import { GlobalService } from './global.service';

import { Injectable, EventEmitter } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
export interface Notification {
    message: string;
    header?: string;
    link?: string;
}
@Injectable()
export class NotificationsService {
    public onOrdersPage = new EventEmitter();
    public onPurchasesPage = new EventEmitter();
    public notifications: BehaviorSubject<any> = new BehaviorSubject<any>({ myOrders: {}, myPurchases: {}, sold: {}, expired: {} });
    public notificationsLog: BehaviorSubject<Array<any>> = new BehaviorSubject<any>([]);


    public message: EventEmitter<Notification>;
    constructor(
        private gs: GlobalService
    ) {
        this.message = new EventEmitter<Notification>(true);
    }

    showMessage(message, header = '', link = '') {
        if (header == "") header = message; message = "";
        let data: Notification = { message: message, header: header, link: link };
        this.message.emit(data);
    }

    init() {
        try {
            let notificationsLog = JSON.parse(localStorage.getItem('notificationsLog'));
            if (notificationsLog)
                this.notificationsLog.next(notificationsLog);
        } catch (e) { }
    }

    save() {
        localStorage.setItem('notificationsLog', JSON.stringify(this.notificationsLog.getValue()));
    }

    createNotification(type, hash: string, item: any = {}, date = Date.now()) {

        //those notifications are being added if something has been changed since last sync compared to a new one
        if (hash) {
            let notifications = this.notifications.getValue();
            if (!notifications[type][hash]) notifications[hash] = 1;
            else notifications[type][hash]++;
        }

        if (item) {
            let notificationsLog = this.notificationsLog.getValue();

            //dont add duplicate notifications to the logfile
            let found = notificationsLog.findIndex((itemLog) => { return itemLog.date == item.date });

            if (!found || found == -1) {
                notificationsLog.push({ type: type, title: item.title, date: date });
                this.notificationsLog.next(notificationsLog);
            }
        }


        this.save();
    }

    add(type, order, item) {

        let status = order.eventType;
        let hash = order.transactionHash;
        let date = order.timestamp * 1000;
        let notificationsLog = this.notificationsLog.getValue()
        let notifications = this.notifications.getValue()
        //check if the notification is already in the notificationsLog
        let foundInLog = notificationsLog.findIndex(logItem => {
            if (logItem['date'] == date
                || logItem['hash'] == hash) {
                console.log('notification already is in the list', logItem);
                return true;
            }
            else return false;
        })

        if (foundInLog == -1) {
            let notification = {
                date: date,
                type: status,
                title: item.title,
                hash: hash
            };
            console.log('Notification is not on the list, add new notification', notification, item);
            notificationsLog.push(notification);
            if (notifications[type][hash]) notifications[type][hash]++;
            else notifications[type][hash] = 1;
            this.notificationsLog.next(notificationsLog);
            this.notifications.next(notifications);
            this.save();
        }
    }

    sync(type: string, newValue: any) {
        let prevValue = this.gs.cached[type];
        newValue = this.adaptNewValue(newValue);
        console.log('newValue in sync', newValue);
        this.gs.cached[type] = newValue;
        this.gs.saveCached();

        let walletAddress = this.gs.wallet.address;

        let notifications = this.notifications.getValue();
        let notificationsLog = this.notificationsLog.getValue();

        newValue.forEach((newItem, newI) => {
            newItem['firstOrder'] = newItem['formatted_orders'][0]['transactionHash'];
            let foundNew = true;
            prevValue.forEach((prevItem, prevI) => {
                if (prevItem['formatted_orders'] && prevItem['formatted_orders'].length)
                    prevItem['firstOrder'] = prevItem['formatted_orders'][0]['transactionHash'];
                if (prevItem['firstOrder'] && prevItem['firstOrder'] == newItem['firstOrder']) {
                    //this order has already been in the list
                    foundNew = false;

                    //check if there are new order statuses in this order
                    if (newItem['formatted_orders'].length > prevItem['formatted_orders'].length) {
                        //default situation - new order is a last one, and its from the other person if order sender is not me
                        let newOrder = newItem['formatted_orders'][newItem['formatted_orders'].length - 1];
                        let others = newOrder.sender != walletAddress;

                        //now that we have all the needed info - if its others and order status itself, we can add a notification
                        if (others) {
                            this.add(type, newOrder, newItem);
                        }

                    }
                }


                //we did not find the order, means we have a new one -- add notification
                if (foundNew && prevI == prevValue.length - 1 && type == 'myOrders') {
                    this.add(type, newItem['formatted_orders'][0], newItem);
                }

            })
        })
    }

    adaptNewValue(newValue): any {
        //deprecated -- the newValue is supposed to come already adapted
        // newValue.map((item, i) => {
        //     let now = Date.now() / 1000;
        //     if (item.endTimestamp > now) { item['active'] = true; }
        //     else {
        //         item['active'] = false;
        //     }
        //     let resArr = [];
        //     console.log('gonna enter formatOrders with 2: ', JSON.parse(JSON.stringify(item.orderObj)));
        //     this.gs.formatOrders(item.sender, item['orderObj'], resArr);
            

        //     newValue[i]['formatted_orders'] = resArr;


        // });
        return newValue;
    }

    syncSimple(type: string, newValue) {

        let prevValue = this.gs.cached[type];
        let notifications = this.notifications.getValue();
        let notificationsLog = this.notificationsLog.getValue();

        newValue.forEach((newItem, newIndex) => {
            let found;
            if (prevValue && prevValue.length)
                prevValue.forEach((prevItem, prevIndex) => {
                    if (prevItem.address == newItem.address) {
                        found = true;
                    }
                    if (prevValue.length - 1 == prevIndex && !found) {
                        //dont add duplicate notifications to the logfile
                        let found = notificationsLog.findIndex((itemLog) => { return itemLog.date == newItem.timestamp * 1000 });

                        if (!found || found == -1) {
                            if (notifications[type][newItem.address]) notifications[type][newItem.address]++;
                            else notifications[type][newItem.address] = 1;
                            notificationsLog.push({ date: Date.now(), type: type, title: newItem.title });
                            this.notificationsLog.next(notificationsLog);
                        }
                    }
                    if (prevValue.length - 1 == prevIndex && newIndex == newValue.length - 1) {
                        this.gs.cached[type] = newValue;
                        this.notifications.next(notifications);
                        this.gs.saveCached();
                        this.save();
                    }
                })
            else {
                //dont add duplicate notifications to the logfile
                let found = notificationsLog.findIndex((itemLog) => { return itemLog.date == newItem.timestamp * 1000 });
                if (!found || found == -1) {
                    if (notifications[type][newItem.address]) notifications[type][newItem.address]++;
                    else notifications[type][newItem.address] = 1;
                    notificationsLog.push({ date: Date.now(), type: type, title: newItem.title });
                    this.notificationsLog.next(notificationsLog);
                }
                this.notifications.next(notifications);
                this.gs.cached[type] = newValue;
                this.gs.saveCached();
                this.save();
            }
        })
    }

    clearNotifications(type: string, hash = null) {
        if (!hash) {


            let notifications = this.notifications.getValue();
            notifications[type] = {};
            this.notifications.next(notifications);
        } else {
            let notifications = this.notifications.getValue();
            notifications[type][hash] = 0;
            delete notifications[type][hash];
            this.notifications.next(notifications);
        }
    }
}
