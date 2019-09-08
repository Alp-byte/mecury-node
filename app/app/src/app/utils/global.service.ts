import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as objectPath from "object-path";
import * as _ from 'lodash';
declare var shell: any;
export interface KeypressInterface {
    key: string;
    path: Element[];
    event: any;
}
export interface NotificationItem {
    title: string,
    link_title?: string,
    link?: string,
    link_type: string,
    type: string,
    date: number,
    seen: boolean
}
export const CATEGORIES = ['ANTIQUE',
    'ART',
    'BABY',
    'BOOK',
    'BUSINESS',
    'INDUSTRY',
    'CAMERA',
    'CELL',
    'CLOTHING',
    'COIN',
    'COLLECT',
    'COMPUTER',
    'CONSUME',
    'ELECTRON',
    'CRAFT',
    'DOLL',
    'DVD',
    'ENTERTAIN',
    'OTHER',
    'FOOD',
    'CARD',
    'HEALTH',
    'HOME',
    'JEWELRY',
    'MUSIC',
    'INSTRUMENT',
    'NETWORK',
    'PET',
    'POTTERY',
    'REAL_ESTATE',
    'DEFENSE',
    'SERVICE',
    'SPORT',
    'SPORT_MEMO',
    'STAMP',
    'TICKET',
    'TOY',
    'TRAVEL',
    'VIDEO_GAME'];

export const ORDER_STATUS = {
    1: "PENDING.BUY_REQUEST_SENT",
    5: "PENDING.BUY_REQUEST_SENT",
    2: "PENDING.PURCHASE_ACCEPTED",
    3: "PENDING.PURCHASE_REJECTED",
    4: "PENDING.CANCELLED",
    10: "PENDING.DESCRIPITON",
    11: "PENDING.PURCHASE_FINALIZED",
    110: "PENDING.PURCHASE_REFUNDED",
    12: "PENDING.DISPUTE_OPENED",
    121: "PENDING.DISPUTE_CONTINUED",
    13: "PENDING.RESOLVED",
    14: "PENDING.BUY_REQUEST_IPFS",
    expired: "PENDING.EXPIRED",
    sold: "PENDING.SOLD"
}
export interface ProcessingItem {
    address: string,
    type: string,
    timestamp: number;
    item: any;
}
@Injectable()
export class GlobalService {
    public lang: string = 'en';
    public theme: string = 'default';
    public authTrigger: EventEmitter<any>;
    public authorized: boolean = false;
    public setLanguageEvent: EventEmitter<string>;
    public setThemeEvent: EventEmitter<string>;
    public newMessage: EventEmitter<any>;
    public messageRead: EventEmitter<any>;
    public preloader: EventEmitter<boolean>;
    public bigPreloader: EventEmitter<boolean>;
    public triggerMenu: EventEmitter<boolean>;
    public setGlobalUnread: EventEmitter<number>;
    public searchChanged: EventEmitter<any>;
    public confirmation: EventEmitter<any>;
    public arrowEvent: EventEmitter<KeypressInterface>;
    public windowWidth: number;
    public ipfsPreference: BehaviorSubject<any> = new BehaviorSubject<any>(true);
    public createAction: EventEmitter<any> = new EventEmitter<any>(true);
    public removeAction: EventEmitter<any> = new EventEmitter<any>(true);
    public reviewSeen: EventEmitter<any> = new EventEmitter<any>(true);
    public wallet: any = {};
    public temp: any;
    public defaultIndex: number = 0;
    public chatsUndread = {};
    public balance: string = "";
    public updateBalance: EventEmitter<string>;
    public updateView: EventEmitter<any>;
    public viewAll = [];
    public badges: any = [];
    public secret: string;
    public searchComponentUp: boolean = true;
    public menuBadges: EventEmitter<any>;
    private processing: ProcessingItem[] = [];
    public reporting: string = 'on';
    public gas = new BehaviorSubject<any>(0);
    public gasType = new BehaviorSubject<any>('http');
    public gasPrices = {
        newitem: 0.00010,
        blockchain: 0.00771,
        buy_request: 0.00326,
        cancel: 0.00042,
        accept_buy: 0.00047,
        reject_buy: 0.00031,
        finalize: 0.00031,
        get_funds: 0.00031,
        dispute: 0.00031
    }
    public bbtListing = 1;
    public cached = {
        viewAll: [],
        myOrders: [],
        myPurchases: [],
        active: [],
        sold: [],
        expired: []
    };
    public imgurAuthData: any;

    private messageSource = new BehaviorSubject({});
    currentNewsItem = this.messageSource.asObservable();


    constructor(
        private router: Router
    ) {

        this.authTrigger = new EventEmitter<any>(true);
        this.setLanguageEvent = new EventEmitter<any>(true);
        this.setThemeEvent = new EventEmitter<any>(true);
        this.arrowEvent = new EventEmitter<KeypressInterface>(true);
        this.setThemeEvent = new EventEmitter<any>(true);
        this.preloader = new EventEmitter<boolean>(true);
        this.bigPreloader = new EventEmitter<boolean>(true);
        this.triggerMenu = new EventEmitter<boolean>(true);
        this.newMessage = new EventEmitter<any>(true);
        this.messageRead = new EventEmitter<any>(true);
        this.searchChanged = new EventEmitter<any>(true);
        this.menuBadges = new EventEmitter<any>(true);
        this.confirmation = new EventEmitter<any>(true);
        this.setGlobalUnread = new EventEmitter<number>(true);
        this.updateBalance = new EventEmitter<string>(true);
        this.updateView = new EventEmitter<any>(true);

    }
    public sort(a, b, compareField, translationParam = null) {
        let first: any = objectPath.get(a, compareField);
        let second: any = objectPath.get(b, compareField);
        if (!isNaN(parseFloat(first)) && !isNaN(parseFloat(second)) && !translationParam) {
            first = parseFloat(first);
            second = parseFloat(second);
        }
        if (translationParam) {

            first = ORDER_STATUS[first];
            second = ORDER_STATUS[second];
        }
        if (typeof first == 'string') first = first.toLocaleLowerCase();
        if (typeof second == 'string') second = second.toLocaleLowerCase();
        if (first < second)
            return -1;
        if (first > second)
            return 1;
        return 0;
    }
    public sortBackwards(a: any, b: any, compareField, translationParam = null) {
        let first: any = objectPath.get(a, compareField);
        let second: any = objectPath.get(b, compareField);

        if (!isNaN(parseFloat(first)) && !isNaN(parseFloat(second)) && !translationParam) {
            first = parseFloat(first);
            second = parseFloat(second);
        }
        if (translationParam) {
            first = ORDER_STATUS[first];
            second = ORDER_STATUS[second];
        }

        if (typeof first == 'string') first = first.toLocaleLowerCase();
        if (typeof second == 'string') second = second.toLocaleLowerCase();

        if (first < second)
            return 1;
        if (first > second)
            return -1;
        return 0;
    }

    public trimArray(array: Array<any>) {
        let toRemove = [];
        array.forEach((item, index) => {
            if (!item || item == "") {
                toRemove.push(index);
            }
        })
        toRemove.reverse();
        toRemove.forEach(remove => {
            array.splice(remove, 1);
        })
        return array;
    }

    setReporting(trigger) {
        this.reporting = trigger;
        localStorage.setItem('reporting', trigger);
    }
    public filter(object, value, keys = null) {
        if (keys) {
            let found = false;
            keys.forEach(key => {
                let objValue: any = objectPath.get(object, key);
                if (objValue && objValue.constructor == Array) {
                    objValue.forEach(item => {
                        if (typeof item == 'undefined') found = false;
                        else {
                            if (item.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                                found = true;
                            }
                        }
                    })
                } else {
                    if (typeof objValue == 'undefined') found = false;
                    else {
                        if (objValue.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                            found = true;
                        }
                    }
                }
            })
            return found;
        } else return false;
    }
    setLanguage(lang) {
        this.lang = lang;
        this.setLanguageEvent.emit(lang);
        localStorage.setItem('lang', lang);
    }
    setTheme(theme) {
        this.theme = theme;
        this.setThemeEvent.emit(theme);
        localStorage.setItem('theme', theme);
    }
    toEth(v) {
        return (v / Math.pow(10, 18)).toFixed(5);
    }
    fromEth(v) {
        return v * Math.pow(10, 18);
    }

    toBBT(v) {
        return (v / Math.pow(10, 4)).toFixed(5);
    }

    manageBadges(notifications) {
        notifications.forEach(notification => {
            let found = false;
            this.badges.forEach((badge, i) => {
                if (badge.title == notification.type) {
                    this.badges[i].value++;
                    found = true;
                }
            })
            if (!found)
                this.badges.push({
                    title: notification.type,
                    value: 1
                })
        })
        this.menuBadges.emit(this.badges);
    }

    getChatList() {
        let chats = localStorage.getItem('chats');
        let object = [];
        if (!chats) {
            object = [];
            localStorage.setItem('chats', JSON.stringify(object))
        }
        else object = JSON.parse(chats);
        let globalUnread = 0;
        object.forEach(chat => {
            globalUnread = globalUnread + chat['unread'];
        });
        this.setGlobalUnread.emit(globalUnread);
        return object
    }
    getMessages(address, goodsAddress) {
        let messages = localStorage.getItem('messages-' + address + '/' + goodsAddress);
        if (!messages) messages = '{"messages": []}';
        return JSON.parse(messages);
    }
    saveMessage(address, message) {
        let messages: any = localStorage.getItem('messages-' + address + '/' + message.goods.address);
        let object;
        if (!messages) {
            object = {
                messages: []
            }
            let _chats = localStorage.getItem('chats');
            let chats;
            if (!_chats) chats = [];
            else {

                chats = JSON.parse(_chats);
            }
            chats.push({ address: address, unread: 0, favorite: false, goods: message.goods });
            localStorage.setItem('chats', JSON.stringify(chats));
        } else object = JSON.parse(messages);
        object['messages'].push(message)
        localStorage.setItem('messages-' + address, JSON.stringify(object));
    }
    setReadMessages(address) {
        let messages: any = localStorage.getItem('messages-' + address);
        let object;
        if (messages) {
            object = JSON.parse(messages);
            object['messages'].forEach(message => message['read'] = true);
            localStorage.setItem('messages-' + address, JSON.stringify(object));
        }

    }

    modifyUnreadChat(address, unread) {
        let chats: any = localStorage.getItem('chats');
        let object = [];
        if (!chats) {
            if (!chats) object = [];
            object.push({ address: address, unread: 0, favorite: false });
            localStorage.setItem('chats', JSON.stringify(object));
        } else object = JSON.parse(chats);
        let globalUnread = 0;
        object.forEach(chat => {
            if (chat['address'] == address) {
                chat['unread'] = chat['unread'] + unread;
            }
            globalUnread = globalUnread + chat['unread'];
        });
        this.setGlobalUnread.emit(globalUnread);

        localStorage.setItem('chats', JSON.stringify(object));
    }


    getArray(name) {
        let arr: any = localStorage.getItem(name);
        try {
            arr = JSON.parse(arr);
            if (!arr) arr = [];
        } catch (e) {
            arr = [];
        }
        return arr;
    }
    setArray(name, arr) {
        localStorage.setItem(name, JSON.stringify(arr));
    }
    go(address) {
        this.router.navigateByUrl(address);
    }
    setAlias(address, name) {
        let aliases = this.getArray('aliases');
        let found = false;
        address = address.toLowerCase()
        aliases.forEach((alias, index) => {

            if (alias['address'] == address) {
                aliases[index]['name'] = name;
                found = true;
            } else if (index == aliases.length - 1) {
                aliases.push({ address: address, name: name });
            }
        })
        if (!aliases.length) aliases = [{ address: address, name: name }];
        this.setArray('aliases', aliases);
    }
    removeAlias(address) {
        address = address.toLowerCase()
        let aliases = this.getArray('aliases');
        let found = -1;
        aliases.forEach((alias, index) => {
            if (alias['address'] == address) {
                aliases[index]['name'] = name;
                found = index;
            }
        })
        if (found != -1) aliases.splice(found, 1);
        this.setArray('aliases', aliases);
    }
    aliasList() {
        let aliases = this.getArray('aliases');
        return aliases;
    }
    getAlias(address) {
        console.log('get alias', address);
        if(address)        
        address = address.toLowerCase()
        let aliases = this.getArray('aliases');
        let found: any = false;
        aliases.forEach((alias, index) => {
            if (alias['address'] == address) {
                found = alias;
            } else if (!found && index == aliases.length - 1) {
                found = false;
            }
        })
        return found;
    }

    addBadge(title) {
        let found = false;
        this.badges.forEach((badge, i) => {
            if (badge.title == title) {
                found = true;
                this.badges[i].value++;
            }
        })
        if (!found) {
            this.badges.push({
                title: title,
                value: 1
            });
        }
    }
    notificationsList() {
        let notifications = this.getArray('notifications');
        return notifications;
    }

    // most important processor of the orders coming from the backend into the front-end structure
    formatOrders(sender, info, resArr = [], isDispute = null) {
        if (!info) {
            return resArr;
        }
        if (info['orders'] || info['orderObj']) {
            if (info['orderObj'] && !info['orders'])
                info['orders'] = info['orderObj'];
            if (Object.prototype.toString.call(info['orders']) === '[object Array]') {
                if (!info['orders'].length) {
                    return resArr;
                } else if (info['orders'].length == 1 && info['orders'][0]['orders'] && info['orders'][0]['orders'].length) {
                    return this.formatOrders(sender, info['orders'][0], resArr);
                } else {

                    info['orders'].forEach((item, index) => {
                        // if (item['eventType'] == 12) {
                        //     isDispute = true;
                        //     if (item['sender'] === sender) {
                        //         item['eventType'] = 121;
                        //     }
                        // }
                        // if (item['eventType'] == 5) {
                        //     item['eventType'] = 1;
                        // }
                        // if (item['eventType'] == 11 && isDispute && item['sender'] !== sender) {
                        //     item['eventType'] = 110;
                        //     item['refunded'] = true;
                        // }
                        // item['status'] = ORDER_STATUS[item['eventType']];
                        resArr.push(item);
                        if (index == info['orders'].length - 1) {
                            return resArr.sort(function (x, y) {
                                return x.eventType - y.eventType;
                            });
                        }


                    })
                }
            } else {
                return this.formatOrders(sender, info['orders'], resArr).sort(function (x, y) {
                    return x.eventType - y.eventType;
                });
            }
        } else {
            return resArr;
        }
    }

    saveCached() {
        console.log('saveCached', this.cached);
        try {

            var cache = [];
            let stringifyed = JSON.stringify(this.cached, function (key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Duplicate reference found
                        try {
                            // If this value does not reference a parent it can be deduped
                            return JSON.parse(JSON.stringify(value));
                        } catch (error) {
                            // discard key if value cannot be deduped
                            return;
                        }
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
            cache = null; // Enable garbage collection
            localStorage.setItem('cached', stringifyed);
            localStorage.setItem('all', JSON.stringify(this.viewAll))
        } catch (e) {
            console.error('saveCached', e);
        }
    }

    getCached() {
        try {
            if (localStorage.getItem('cached'))
                this.cached = JSON.parse(localStorage.getItem('cached'))
            this.viewAll = JSON.parse(localStorage.getItem('all'))
            if (!this.viewAll) this.viewAll = [];
        } catch (e) {

        }

    }


    openURL($event, url) {
        $event.preventDefault;
        shell.openExternal(url);
    }

    addAddressEncryption(address, password) {
        localStorage.setItem('e_' + address, password);
        return 0;
    }

    getAddressEncryption(address) {
        let enc = localStorage.getItem('e_' + address);
        if (enc) return enc;
        else {
            return 0;
        }
    }

    setEncryptedMark(address) {
        localStorage.setItem('encrypted_' + address, 'YES');
    }
    getEncryptedMark(address) {
        return localStorage.getItem('encrypted_' + address);
    }

    createAction_(data) {
        let actionId = Date.now();
        data['actionId'] = actionId;
        let title = data['text'];
        if (data['item']) title = title + " " + data['item']

        this.createAction.emit(data);
        return actionId;
    }


    changeMessage(newsItemActive: any) {

        this.messageSource.next(newsItemActive)
    }
}
