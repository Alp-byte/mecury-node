import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { HttpService, API } from '../utils/http.service';
import { GlobalService } from '../utils/global.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class OrdersService {
    public orders: BehaviorSubject<any> = new BehaviorSubject([]);
    public purchases: BehaviorSubject<any> = new BehaviorSubject([]);
    constructor(
        private httpService: HttpService,
        private http: HttpClient,
        private globalService: GlobalService
    ) {

    }

    public getOrders() {
        let ipfsPreference = this.globalService.ipfsPreference.value;

        if (ipfsPreference) return this.getOrdersAll();
        else return this.getOrdersETH();
    }

    public getPurchases() {
        let ipfsPreference = this.globalService.ipfsPreference.value;

        if (ipfsPreference) return this.getPurchasesAll();
        else return this.getPurchasesETH();
    }

    private combineResults(array1, array2) {
        console.log('combine results here', array1, array2);

        //combining ETH and IPFS orders/purchases. check with tradeId, if there is such a tradeId in both IPFS and ETH -- dont add the IPFS one as it is not actual anymore and creates a clone
        array2.items.forEach((itemIPFS, ipfsIterator) => {
            let found;
            if (!array1.items.length) {
                array1.items = array2.items;
            } else array1.items.forEach((itemETH, index) => {
                if (itemETH.orders[0].tradeId == itemIPFS.orders[0].tradeId) {
                    // array1.items[index].orders.concat(itemIPFS.orders);
                    found = true;
                }
                if (array1.items.length - 1 == index && !found) {
                    array1.items.push(itemIPFS)
                }
            })

        })

        return array1;
    }

    private getOrdersAll() {
        return new Observable(observer => {
            this.getOrdersETH().subscribe(ordersETH => {
                console.log('got all orders ETH', JSON.parse(JSON.stringify(ordersETH)));
                this.getOrdersIPFS().subscribe(ordersIPFS => {
                    console.log('got all orders IPFS', JSON.parse(JSON.stringify(ordersIPFS)));
                    observer.next(this.combineResults(ordersETH, ordersIPFS))
                })
            })
        })
    }

    private getPurchasesAll() {
        return new Observable(observer => {
            this.getPurchasesETH().subscribe(purchasesETH => {
                console.log('got all purchases ETH', JSON.parse(JSON.stringify(purchasesETH)));
                this.getPurchasesIPFS().subscribe(purchasesIPFS => {
                    console.log('got all purchases IPFS', JSON.parse(JSON.stringify(purchasesIPFS)));
                    observer.next(this.combineResults(purchasesETH, purchasesIPFS))
                })
            })
        })
    }

    public getItemByHash(hashIpfs, addressIpfs) {
        console.log('calling ipfsStoreGetItem', { hashIpfs: hashIpfs, addressIpfs: addressIpfs });
        return this.httpService.call('ipfsStoreGetItem', { hashIpfs: hashIpfs, addressIpfs: addressIpfs });
    }


    public getPurchasesETH(loader = true) {
        return new Observable(observer => {
            this.httpService.call('getMyPurchases').subscribe(purchases => {
                this.getPurchasesETHProcess(purchases, observer);
            })
        })
    }

    private getPurchasesETHProcess(res, observer) {
        let resOrders = JSON.parse(JSON.stringify(res));

        resOrders.items = [];
        if (res['items'] && res['items'].length) {
            res['items'].forEach((item, index) => {

                item['orders'].forEach(_order => {
                    // if(_order.eventType == 5) _order.eventType = 1;
                    let currItem = JSON.parse(JSON.stringify(item));
                    res['items'][index]['order'] = _order['transactionHash'];
                    res['items'][index]['orderDate'] = _order['timestamp'];
                    currItem['order'] = _order['transactionHash'];
                    currItem['tradeId'] = _order['tradeId'];
                    currItem['orderDate'] = _order['timestamp'];
                    currItem['orderObj'] = _order;
                    resOrders.items.push(currItem);
                });
                if (index == res['items'].length - 1) {
                    res['items'].reverse();
                    resOrders['items'].reverse();
                    observer.next(resOrders);
                }
                // this.notification.sync('myPurchases', resOrders['items']);

            })
            let addresses = [];

            let now = Date.now() / 1000;


        }
        else observer.next(resOrders);

    }

    public getOrdersETH() {
        return new Observable(observer => {
            this.httpService.call('getMyOrders').subscribe(orders => {
                this.getOrdersETHProcess(orders, observer);
            })
        })
    }

    private getOrdersETHProcess(res, observer) {
        let resOrders = JSON.parse(JSON.stringify(res));

        resOrders.items = [];
        if (res['items'] && res['items'].length) {
            res['items'].forEach((item, index) => {

                item['orders'].forEach(_order => {
                    // if(_order.eventType == 5) _order.eventType = 1;
                    let currItem = JSON.parse(JSON.stringify(item));
                    res['items'][index]['order'] = _order['transactionHash'];
                    res['items'][index]['orderDate'] = _order['timestamp'];
                    currItem['order'] = _order['transactionHash'];
                    currItem['tradeId'] = _order['tradeId'];
                    currItem['orderDate'] = _order['timestamp'];
                    currItem['orderObj'] = _order;
                    resOrders.items.push(currItem);
                });
                if (index == res['items'].length - 1) {
                    res['items'].reverse();
                    resOrders['items'].reverse();
                    observer.next(resOrders);
                }
                // this.notification.sync('myOrders', resOrders['items']);
            })
        }
        else observer.next(resOrders);
    }

    public getOrdersIPFS() {
        return new Observable(observer => {
            this.httpService.call('ipfsOrdersGetMyOrders').subscribe(ordersIPFS => {
                console.log('ipfsOrdersGetMyOrders', ordersIPFS);
                ordersIPFS['items'] = ordersIPFS['okItems'];
                this.getOrdersIPFSProcess(ordersIPFS, observer);
            })
        });
    }

    private getOrdersIPFSProcess(res, observer) {
        let resOrders = JSON.parse(JSON.stringify(res));

        resOrders.items = [];
        if (res['items'] && res['items'].length) {
            res['items'].forEach((item, index) => {
                if (item['orders'].length)
                    item['orders'].forEach((_order, ordersIndex) => {
                        let currItem = JSON.parse(JSON.stringify(item));
                        // res['items'][index]['order'] = _order['transactionHash'];
                        // res['items'][index]['orderDate'] = _order['timestamp'];
                        currItem['order'] = _order['transactionHash'];
                        currItem['tradeId'] = _order['tradeId'];
                        currItem['orderDate'] = _order['timestamp'];
                        currItem['orderObj'] = { orders: [_order] };
                        currItem['active'] = true;
                        console.log('adding new item to orders IPFS', currItem);
                        resOrders.items.push(currItem);
                        if (index == res['items'].length - 1 && ordersIndex == item['orders'].length - 1) {
                            resOrders['items'].reverse();
                            observer.next(resOrders);
                        }
                    });
                else if (index == res['items'].length - 1) {
                    resOrders['items'].reverse();
                    observer.next(resOrders);
                }

                // this.notification.sync('myOrders', resOrders['items']);
            })
        }
        else observer.next(resOrders);
    }

    private getPurchasesIPFSProcess(res, observer) {
        let resOrders = JSON.parse(JSON.stringify(res));

        resOrders.items = [];
        if (res['items'] && res['items'].length) {
            res['items'].forEach((item, index) => {
                if (item['orders'].length)
                    item['orders'].forEach((_order, ordersIndex) => {
                        let currItem = JSON.parse(JSON.stringify(item));
                        // res['items'][index]['order'] = _order['transactionHash'];
                        // res['items'][index]['orderDate'] = _order['timestamp'];
                        currItem['order'] = _order['transactionHash'];
                        currItem['tradeId'] = _order['tradeId'];
                        currItem['orderDate'] = _order['timestamp'];
                        currItem['orderObj'] = { orders: [_order] };
                        currItem['active'] = true;
                        console.log('adding new item to orders IPFS', currItem);

                        // TODO make it proper from backend

                        if (_order['sender'] === this.globalService.wallet.address)
                            resOrders.items.push(currItem);
                        if (index == res['items'].length - 1 && ordersIndex == item['orders'].length - 1) {
                            resOrders['items'].reverse();
                            observer.next(resOrders);
                        }
                    });
                else if (index == res['items'].length - 1) {
                    resOrders['items'].reverse();
                    observer.next(resOrders);
                }

                // this.notification.sync('myOrders', resOrders['items']);
            })
        }
        else observer.next(resOrders);
    }

    public getPurchasesIPFS() {
        let temp = localStorage.getItem(this.globalService.wallet.address + '_ipfsPurchasesHashes');
        let ipfsPurchases = [];
        try {
            if (temp) ipfsPurchases = JSON.parse(temp);
        } catch (e) { }
        console.log('calling getMyIPFSPurchases with ', ipfsPurchases);
        return new Observable(observer => {
            this.httpService.call('ipfsOrdersGetMyPurchases', { hashes: ipfsPurchases }).subscribe(ordersIPFS => {
                console.log('ipfsOrdersGetMyPurchases', ordersIPFS);
                ordersIPFS['items'] = ordersIPFS['okItems'];
                this.getPurchasesIPFSProcess(ordersIPFS, observer);
            })
        });
    }


    syncPurchasesETH(addresses, escrows) {
        return this.httpService.call('syncAllMyPurchases', { "addresses": addresses, "escrows": escrows })
    }

    syncOrdersETH() {
        return this.httpService.call('syncAllMyOrders')
    }

    syncAllOrdersIPFSNew() {
        return this.httpService.call('ipfsOrdersSyncMyOrders')
    }

    syncAllPurchasesIPFSNew() {
        //TODO: hardcoded! fix
        return this.httpService.call('ipfsOrdersSyncMyPurchases', { escrows: ['0x6b2563ed136866022f707ede17891120406f45f5', '0xa1148a0e4298408ed954152ce0d0802b54d92049', '0x0c52a822da4118eb04e4cda2cfb50cdfbb4a1ce8', '0xd4efeae28d58004c7076a628408706931472665f', '0xbf79da05369dae17931482e15565670e99119115'] })
    }

    syncInitialPurchasesETH() {
        return this.httpService.call('syncInitialPurchases');
    }


    syncAllOrdersIPFS() {
        return this.httpService.call('ipfsOrdersListSync');
    }

    syncOrdersSingleItem(item) {
        return this.httpService.call('ipfsOrdersSync');
    }

    getOrdersSingleItem(item) {
        this.httpService.call('ipfsOrdersGet');
    }

    getOrdersDetail(tradeId) {
        this.httpService.call('getOrdersDetail');
    }

    getOrdersByTradeId(tradeId) {
        //TODO: GET from cache here
        let arr: Array<any> = this.purchases.getValue();
        let resArr = arr.filter(item => item.tradeId == tradeId);
        if (!resArr || !resArr.length)
            resArr = this.orders.getValue().filter(item => item.tradeId == tradeId);
        return resArr;
    }

    acceptBuy(data, item) {
        if (item.address && item.address.length && !item.hashIpfs) {
            //If it is a classic ETH item - use old method, if a new IPFS item - proceed
            //TODO: refactor both acceptBuys to be in ordersService and recognise either IPFS or not there
            return this.httpService.acceptBuy(data, item);
        } else {
            return new Observable(observer => {
                let actionId = this.httpService.createAction_({
                    text: 'Accepting buy request on ',
                    item: item.title,
                    status: 'COMMON.RESPONSE_NOT_FOUND',
                    code: 'acceptbuy'
                })
                if (this.httpService.actionInProgress) {
                    this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'acceptbuy', data: { result: "error", error: "Another action in progress" } })
                    observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
                } else this.httpService.actionInProgress = true;
                console.log('calling accept buy for IPFS');
                item.formatted_orders[0].payment = item.formatted_orders[0].count * item.price;
                //HACK to check the call
                //TODO get payment from the buy request in case of shipping
                item.formatted_orders[0].payment = item.formatted_orders[0].payment / Math.pow(10, 9);
                this.httpService.call('ipfsStoreAccept', {
                    goods: item,
                    // newEscrow: "0xbf79da05369dae17931482e15565670e99119115", <-- is set by default now
                    buyOrder: item.formatted_orders[0],
                    sessionKey: item.formatted_orders[0].key,
                    privateMessage: data.privateMessage
                }).subscribe((res: any) => {
                    this.httpService.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'acceptbuy', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'acceptbuy', data: res })

                    observer.next(res);
                })
            })
        }
    }
    rejectBuy(data, item: any = false) {
        if (item.address && item.address.length && !item.hashIpfs) {
            return this.httpService.rejectBuy(data, item);
        } else {
            return new Observable(observer => {
                let actionId = this.httpService.createAction_({
                    text: 'Rejecting buy request on ',
                    item: item.title,
                    status: 'COMMON.RESPONSE_NOT_FOUND',
                    code: 'rejectbuy'
                })
                if (this.httpService.actionInProgress) {
                    this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'rejectbuy', data: { result: "error", error: "Another action in progress" } })
                    observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
                } else this.httpService.actionInProgress = true;
                console.log('calling reject buy for IPFS');
                this.httpService.call('ipfsStoreReject', {
                    goods: { title: item.title, escrow: item.escrow },
                    sessionKey: item.orders[0].key,
                    tradeId: data.tradeId,
                    privateMessage: data.privateMessage
                }).subscribe((res: any) => {
                    this.httpService.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'rejectbuy', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'rejectbuy', data: res })

                    observer.next(res);
                })
            })
        }
    }
}
