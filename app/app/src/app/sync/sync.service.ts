import { NotificationsService } from './../utils/notifications.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GlobalService, ORDER_STATUS } from './../utils/global.service';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OrdersService } from '../orders/orders.service';
import { ViewItemsService } from '../view-items/view-items.service';

export interface Sync {
  title: string;
  progress?: any;
  time?: number;
  error?: boolean;
  current?: boolean;
}

export const SYNCS: Array<Sync> = [
  { title: 'allListings' },
  { title: 'orders' },
  { title: 'purchases' }
]


declare var ipc: any;
@Injectable()
export class SyncService {
  private ipcRenderer = ipc;
  // public syncer: EventEmitter<any>;

  public syncList: BehaviorSubject<Array<Sync>> = new BehaviorSubject(SYNCS);
  private currentSync: number = 0;

  constructor(
    private ordersService: OrdersService,
    private viewItemsService: ViewItemsService,
    private gs: GlobalService,
    private notification: NotificationsService
  ) {
    // this.syncer = new EventEmitter<any>(); 
  }


  // to test the ordersSequence method without waiting for a sync
  public getOrdersSimple() {
    return new Promise((resolve, reject) => {
      this.get('orders').then(res => {
        let temp = this.syncList.getValue();
        resolve(res);
      }).catch(err => {
        reject()
      })
    })
  }

  // to test the ordersSequence method without waiting for a sync
  public getPurchasesSimple() {
    return new Promise((resolve, reject) => {
      this.get('purchases').then(res => {
        let temp = this.syncList.getValue();
        resolve(res);
      }).catch(err => {
        reject()
      })
    })
  }

  syncAndCache(syncNumber: number) {
    return new Promise((resolve, reject) => {
      let temp = this.syncList.getValue();
      temp[syncNumber].current = true;
      this.syncList.next(temp);
      switch (syncNumber) {
        // allListings
        case 0: {
          let temp = this.syncList.getValue();
          temp[syncNumber].progress = 'Syncing Store..';
          this.syncList.next(temp);
          this.sync('store').then(res => {
            let temp = this.syncList.getValue();
            temp[syncNumber].progress = 'Syncing IPFS Store..';
            this.syncList.next(temp);
            this.sync('storeIPFS').then(res => {
              let temp = this.syncList.getValue();
              temp[syncNumber].progress = 'Caching All Listings..';
              this.syncList.next(temp);
              this.get('allListings').then(res => {
                let temp = this.syncList.getValue();
                console.log('allListings result', res);
                temp[syncNumber].progress = 'Done!';
                temp[syncNumber].time = Date.now();
                temp[syncNumber].current = false;
                resolve();
                this.syncList.next(temp);
              }).catch(err => {
                console.log('allListings error', err);
                // if (res.result != 'ok') {
                let temp = this.syncList.getValue();
                temp[syncNumber].progress += ' Error!';
                temp[syncNumber].error = true;
                temp[syncNumber].current = false;
                reject();
                this.syncList.next(temp);
                // }
              })
            }).catch(err => {
              let temp = this.syncList.getValue();
              temp[syncNumber].progress += ' Error!';
              temp[syncNumber].error = true;
              temp[syncNumber].current = false;
              reject();
              this.syncList.next(temp);
            })
          }).catch(err => {
            let temp = this.syncList.getValue();
            temp[syncNumber].progress += ' Error!';
            temp[syncNumber].error = true;
            temp[syncNumber].current = false;
            reject();
            this.syncList.next(temp);
          })
        } break;
        // orders
        case 1: {
          let temp = this.syncList.getValue();
          temp[syncNumber].progress = 'Syncing Orders ETH..';
          this.syncList.next(temp);
          this.sync('myOrdersETH').then(res => {
            let temp = this.syncList.getValue();
            temp[syncNumber].progress = 'Syncing IPFS Orders..';
            this.syncList.next(temp);
            this.sync('allOrdersIPFS').then(res => {
              this.sync('myOrdersIPFS').then(res => {
                let temp = this.syncList.getValue();
                temp[syncNumber].progress = 'Caching All Orders..';
                this.syncList.next(temp);
                this.get('orders').then(res => {
                  let temp = this.syncList.getValue();
                  temp[syncNumber].progress = 'Done!';
                  temp[syncNumber].time = Date.now();
                  temp[syncNumber].current = false;
                  resolve();
                  this.syncList.next(temp);
                }).catch(err => {
                  let temp = this.syncList.getValue();
                  temp[syncNumber].progress += ' Error!';
                  temp[syncNumber].error = true;
                  temp[syncNumber].current = false;
                  reject();
                  this.syncList.next(temp);
                })
              }).catch(err => {
                let temp = this.syncList.getValue();
                temp[syncNumber].progress += ' Error!';
                temp[syncNumber].error = true;
                temp[syncNumber].current = false;
                reject();
                this.syncList.next(temp);
              })
            })
          }).catch(err => {
            let temp = this.syncList.getValue();
            temp[syncNumber].progress += ' Error!';
            temp[syncNumber].error = true;
            temp[syncNumber].current = false;
            reject();
            this.syncList.next(temp);
          })
        } break;
        // purchases
        case 2: {
          let temp = this.syncList.getValue();
          temp[syncNumber].progress = 'Syncing Purchases..';
          this.syncList.next(temp);
          this.sync('myPurchasesETH').then(res => {
            let temp = this.syncList.getValue();
            temp[syncNumber].progress = 'Syncing IPFS Purchases..';
            this.syncList.next(temp);
            this.sync('myPurchasesIPFS').then(res => {
              let temp = this.syncList.getValue();
              temp[syncNumber].progress = 'Caching All Purchases..';
              this.syncList.next(temp);
              this.get('purchases').then(res => {
                let temp = this.syncList.getValue();
                temp[syncNumber].progress = 'Done!';
                temp[syncNumber].time = Date.now();
                temp[syncNumber].current = false;
                resolve();
                this.syncList.next(temp);
              }).catch(err => {
                let temp = this.syncList.getValue();
                temp[syncNumber].progress += ' Error!';
                temp[syncNumber].error = true;
                temp[syncNumber].current = false;
                reject();
                this.syncList.next(temp);
              })
            }).catch(err => {
              let temp = this.syncList.getValue();
              temp[syncNumber].progress += ' Error!';
              temp[syncNumber].error = true;
              temp[syncNumber].current = false;
              reject();
              this.syncList.next(temp);
            })
          }).catch(err => {
            let temp = this.syncList.getValue();
            temp[syncNumber].progress += ' Error!';
            temp[syncNumber].error = true;
            temp[syncNumber].current = false;
            reject();
            this.syncList.next(temp);
          })
        } break;
      }
    })
  }


  startSync() {
    console.log('startSync', this.currentSync);
    this.syncAndCache(this.currentSync).then(() => {
      console.log('syncAndCache resolve');
      setTimeout(() => {
        this.nextSync();
        this.startSync();
      }, 5000);
    }).catch(() => {
      console.log('syncAndCache reject');
      setTimeout(() => {
        this.nextSync();
        this.startSync();
      }, 5000);
    })
  }

  nextSync() {
    let nextSync = this.currentSync + 1;
    if (nextSync >= SYNCS.length) {
      nextSync = 0;
    }
    this.currentSync = nextSync;
  }


  syncStoreETH() {
    this.ipcRenderer.send('syncStore');
    console.log('ipcRenderer syncStore sent');
    return new Observable(observer => {
      this.ipcRenderer.once('syncStore', (event, arg) => {
        arg = JSON.parse(arg);
        observer.next(arg)
      })
    })
  }

  syncStoreIPFS() {
    this.ipcRenderer.send('syncStoreIPFS');
    return new Observable(observer => {
      this.ipcRenderer.once('syncStoreIPFS', (event, arg) => {
        arg = JSON.parse(arg);
        observer.next(arg)
      })
    })
  }

  sync(type: string, args: any = null) {
    return new Promise((resolve, reject) => {
      console.log('sync ' + type + ' started with args: ', args);
      switch (type) {
        case 'allOrdersIPFS': {
          this.ordersService.syncAllOrdersIPFS().subscribe((res: any) => {
            console.log('sync allOrdersIPFS result', res);
            if (res.result == 'ok')
              resolve(res)
            else reject(res);
          });
        } break;
        case 'myOrdersETH': {
          this.ordersService.syncOrdersETH().subscribe(res => {
            console.log('sync myOrdersETH result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myPurchasesETH': {
          //TODO: make it right by doing initial purchases sync only at the start of the app and then sync purchases by escrows and addresses
          this.ordersService.syncInitialPurchasesETH().subscribe((res: any) => {
            console.log('sync myPurchasesETH result', res);
            if (res.result == 'ok')
              resolve(res)
            else reject(res);
          })

        } break;
        case 'myOrdersIPFS': {
          this.ordersService.syncAllOrdersIPFSNew().subscribe(res => {
            console.log('sync myOrdersIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myPurchasesIPFS': {
          this.ordersService.syncAllPurchasesIPFSNew().subscribe(res => {
            console.log('sync myPurchasesIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'allListingsETH': {
          this.syncStoreETH().subscribe(res => {
            console.log('sync allListingsETH result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'allListingsIPFS': {
          this.syncStoreIPFS().subscribe(res => {
            console.log('sync allListingsIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'store': {
          this.syncStoreETH().subscribe(res => {
            console.log('syncStore result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          });
        } break;
        case 'storeIPFS': {
          this.syncStoreIPFS().subscribe(res => {
            console.log('syncStoreIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          });
        } break;
      }
    })
  }

  get(type: string, args: any = null) {
    return new Promise((resolve, reject) => {

      console.log('get ' + type + ' started with args: ', args);
      switch (type) {
        case 'orders': {
          this.ordersService.getOrders().subscribe((res: any) => {
            console.log('getOrders from backend:', JSON.parse(JSON.stringify(res)));
            res.items.forEach(item => {
              console.log('-------------------getOrders processing item:', JSON.parse(JSON.stringify(item)));
              let resArr = [];
              this.gs.formatOrders(this.gs.wallet.address, item.orderObj, resArr);
              item['formatted_orders'] = resArr;
              console.log('getOrders formatOrders result:', JSON.parse(JSON.stringify(item['formatted_orders'])));
              item['formatted_orders'] = this.orderSequence(item['formatted_orders']);
              item = this.assignMeta(item);
              console.log('getOrders orderSequence result:', item['formatted_orders']);
            })
            this.notification.sync('myOrders', res.items);
            this.ordersService.orders.next(res.items);            
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'purchases': {
          this.ordersService.getPurchases().subscribe((res: any) => {
            console.log('getPurchases from backend:', JSON.parse(JSON.stringify(res)));
            res.items.forEach(item => {
              console.log('getPurchases processing item:', JSON.parse(JSON.stringify(item)));
              let resArr = [];
              this.gs.formatOrders(this.gs.wallet.address, item.orderObj, resArr);
              item['formatted_orders'] = resArr;
              console.log('getOrders formatOrders result:', JSON.parse(JSON.stringify(item['formatted_orders'])));
              item['formatted_orders'] = this.orderSequence(item['formatted_orders']);
              item = this.assignMeta(item);
              console.log('getPurchases orderSequence result:', item['formatted_orders']);             
              
            })            
            this.notification.sync('myPurchases', res.items);
            this.ordersService.purchases.next(res.items);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myOrdersETH': {
          this.ordersService.getOrdersETH().subscribe(res => {
            console.log('get myOrdersETH result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myPurchasesIPFS': {
          this.ordersService.getPurchasesIPFS().subscribe(res => {
            console.log('get myPurchasesIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myPurchasesETH': {
          this.ordersService.getPurchasesETH().subscribe(res => {
            console.log('get myPurchasesETH result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myOrdersIPFS': {
          this.ordersService.getOrdersETH().subscribe(res => {
            console.log('get myOrdersIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'myPurchasesIPFS': {
          this.ordersService.getOrdersIPFS().subscribe(res => {
            console.log('get myPurchasesIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'allListingsETH': {
          this.viewItemsService.viewAll().then(res => {
            console.log('get allListingsETH result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);

          })
        } break;
        case 'allListingsIPFS': {
          this.viewItemsService.viewAllIPFSListings().then(res => {
            console.log('get allListingsIPFS result', res);
            if (res['result'] == 'ok')
              resolve(res)
            else reject(res);
          })
        } break;
        case 'allListings': {
          this.viewItemsService.getAllListings().subscribe((res: any) => {
            console.log('get allListings result', res);
            if (res['result'] == 'ok') {
              console.log('resolve OK');
              resolve(res)
            }
            else {
              console.log('REJECT err');
              reject(res);
            }
          })
        } break;
      }
    })
  }

  assignMeta(item) {    
    item['currentStatusCode'] = item['formatted_orders'][item['formatted_orders'].length-1]['currentStatusCode'];
    item['currentStatus'] = ORDER_STATUS[item['currentStatusCode']];
    item['updatedStatus'] = item['formatted_orders'][item['formatted_orders'].length-1].timestamp;
    return item;
  }


  orderSequence(orderList: any[]) {
    console.log('orderSequence input: ', JSON.parse(JSON.stringify(orderList)));
    let myWallet: string = this.gs.wallet.address;
    let othersWallet: string;
    let resArr = [];

    //conditions
    let conditions = {
      disputeOrders: [],
      rejectOrder: {
        index: null,
        value: null
      },
      finaliseOrder: {
        index: null,
        value: null
      },
      fakeBuyOrder: {
        index: null,
        value: null
      },
      getFunds: {
        index: null,
        value: null
      }
    }

    resArr = orderList.map((order, i) => {
      //do some META stuff, like set each order's human readable status etc
      order.currentStatusCode = order.eventType;

      if (!othersWallet && order.sender != myWallet) {
        othersWallet = order.sender;
        console.log('found othersWallet', othersWallet);
      }


      if (order.eventType == 3) {
        conditions.rejectOrder.index = i;
        conditions.rejectOrder.value = order;
      }

      if (order.eventType == 5) {
        conditions.fakeBuyOrder.index = i;
        conditions.fakeBuyOrder.value = order;
      }

      if (order.eventType == 11) {
        conditions.finaliseOrder.index = i;
        conditions.finaliseOrder.value = order;
      }

      //TODO: confirm that getFunds returns 13 status ??
      if (order.eventType == 13) {
        conditions.getFunds.index = i;
        conditions.getFunds.value = order;
      }

      if (order.eventType == 12) {
        conditions.disputeOrders.push({
          index: i,
          value: order
        });
      }



      return order;

      // if the order is a dispute, disputeOrder = order
      // if the order is a rejection, rejectOrder = order
      // if the order is finalise, finaliseOrder = order
      // if the order is a fakeBuy, fakeBuyOrder = order
    })

    //now check the conditions and format resArr accordingly, e.g. (if conditions.fakeBuyOrder.index => swap the first order with fakeBuy and set the eventType to be 1 instead of 5
    console.log('conditions out of ordersSequence', JSON.parse(JSON.stringify(conditions)));

    //in case of fakeBuy -- ensure it goes first and assign a status of 1
    if (conditions.fakeBuyOrder.value) {
      resArr[conditions.fakeBuyOrder.index].currentStatusCode = 1;
      if (conditions.fakeBuyOrder.index != 0) {
        let temp0 = JSON.parse(JSON.stringify(resArr[0]));
        let tempFakeBuy = JSON.parse(JSON.stringify(resArr[conditions.fakeBuyOrder.index]));
        resArr[0] = tempFakeBuy;
        resArr[conditions.fakeBuyOrder.index] = temp0;
      }
    }

    //in case of rejectBuy -- ensure it goes last for a show and swap senders
    if (conditions.rejectOrder.value) {
      if (conditions.rejectOrder.value.sender == myWallet) {
        conditions.rejectOrder.value.sender = othersWallet;
      } else {
        conditions.rejectOrder.value.sender = myWallet;
      }
      if (conditions.rejectOrder.index != resArr.length - 1) {
        let tempLast = JSON.parse(JSON.stringify(resArr[resArr.length - 1]));
        let tempReject = JSON.parse(JSON.stringify(resArr[conditions.rejectOrder.index]));
        resArr[resArr.length - 1] = tempReject;
        resArr[conditions.fakeBuyOrder.index] = tempLast;
      }
    }

    // in case of dispute -- we need to set status 121 for each next step in dispute after the first one
    if (conditions.disputeOrders.length) {
      conditions.disputeOrders.forEach((disputeOrder, disputeI) => {
        if (disputeI > 0) {
          resArr[disputeOrder.index].currentStatusCode = 121;
        }
      })
    }


    /* in case of finalise --  we need to figure out what kind of finalise is that
      1. finalise which appears with rejection (if there was a rejection in the list) -- ignore
      2. normal finalise which comes after accept buy (default)
      3. finalise which also means resolve dispute (if there were disputes in the list) -- set status of 110 and swap senders
    */
    if (conditions.finaliseOrder.value) {
      console.log('working FInalise here', JSON.parse(JSON.stringify(conditions.finaliseOrder.value)));
     
      console.log('swapped addresses here', JSON.parse(JSON.stringify(conditions.finaliseOrder.value)));
      if (conditions.disputeOrders.length) {
        //TODO: seems like we need to swap addresses only in case of a dispute?
        if (conditions.finaliseOrder.value.sender == myWallet) {
          conditions.finaliseOrder.value.sender = othersWallet;
        } else {
          conditions.finaliseOrder.value.sender = myWallet;
        }
        conditions.finaliseOrder.value.currentStatusCode = 110;        
      }
      resArr[conditions.finaliseOrder.index] = conditions.finaliseOrder.value;
    }






    return resArr;

  }


  //TODO: refactor this
  _orderSequence(orderList: any[]) {
    console.log('orderSequence input: ', orderList);
    let myWallet: string = this.gs.wallet.address;
    let isDispute: boolean;
    let resArr = [];

    resArr = orderList.map((item, index) => {
      if (item['eventType'] == 12) {
        isDispute = true;
        if (item['sender'] === myWallet) {
          item['eventType'] = 121;
        }
      }
      if (item['eventType'] == 5) {
        item['eventType'] = 1;
      }
      if (item['eventType'] == 11 && isDispute && item['sender'] !== myWallet) {
        item['eventType'] = 110;
        item['refunded'] = true;
      }
      item['status'] = ORDER_STATUS[item['eventType']];

      let finalizedIndex = -1;
      let spliceStatus = false;

      if (resArr[resArr.length - 1]) {

        item['updatedStatus'] = resArr[resArr.length - 1]['timestamp'];
        item['currentStatus'] = resArr[resArr.length - 1]['status'];
        if (item['currentStatus'] == 'PENDING.BUY_REQUEST_SENT') item['currentStatus'] = 'PENDING.BUY_REQUEST_SENT';
        item['currentStatusCode'] = resArr[resArr.length - 1]['eventType'];
      }

      //TODO: remove the second loop
      for (var j = 0; j < orderList.length; j++) {
        (orderList[j]['eventType'] == 11) ? finalizedIndex = j : null;
        (orderList[j]['eventType'] == 3) ? spliceStatus = true : null;
        (orderList[j]['eventType'].toString().startsWith('12')) ? isDispute = true : false;
        if (orderList[j]['eventType'] == 3) {
          item['rejectSender'] = orderList[j].sender;
          item['rejectTimestamp'] = orderList[j].timestamp;
          item['rejectOrder'] = orderList[j];
        }
        if (orderList[j]['eventType'] == 110 && isDispute) {
          item['isDispute'] = true;
        }
      }
      if ((finalizedIndex != -1) && (spliceStatus)) {
        item['currentStatusCode'] = 3;
        item['currentStatus'] = 'PENDING.PURCHASE_REJECTED';

      }

      // adapt this for a new method 

      // //if the new order status is reject-related
      // if (item['rejectOrder']) {
      //   newOrder = item['rejectOrder'];
      //   others = item['rejectOrder'].sender != walletAddress;
      // } //if the new order is of status "finalize" - it should not be a reject order as reject is having a finalize status, too - but the sender is inverted so
      // else if (newOrder.eventType == 11 || newOrder.eventType == 110) {
      //   others = newOrder.sender == walletAddress;
      // }
    })

    console.log('orderSequence result: ', resArr);
    return resArr;
  }



}
