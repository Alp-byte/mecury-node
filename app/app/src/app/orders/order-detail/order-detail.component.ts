import { OrdersService } from './../orders.service';
import { ViewItemsService } from '../../view-items/view-items.service';
import { NotificationsService } from './../../utils/notifications.service';
import { HttpService } from './../../utils/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ORDER_STATUS, GlobalService } from './../../utils/global.service';
import { Component, OnInit, EventEmitter } from '@angular/core';
import * as $ from 'jquery';


@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent {
    private item: any = {};
    private orders: any = [{}];
    private visual: any = {
        expandDetails: false
    }
    // private conflict: boolean = false;
    // private conflictCount: number = 0;
    private starter;
    private statuses = ORDER_STATUS;
    private message: string = '';
    private category: string = '';
    private chatAddress: string = "";
    private myPurchase: boolean = false;
    private translateParams: any = {};
    public goInit: EventEmitter<any>;
    public subscription;
    public finalized = false;
    public inProgress;
    private addressID: any;
    private disputeDeclined: boolean = false;
    public myItem;
    private finalFormattedOrders = [];

    constructor(
        private route: ActivatedRoute,
        private http: HttpService,
        private notifications: NotificationsService,
        private gs: GlobalService,
        private router: Router,
        private viewItemService: ViewItemsService,
        private ordersService: OrdersService
    ) {
        this.goInit = new EventEmitter(true);
    }
    ngOnInit() {
        this.inProgress = this.http.getActionInProgress();
        this.getInfo();

        this.myItem = this.item.sender == this.gs.wallet.address;

    }
    reviews;
    goReviews(address) {
        this.router.navigateByUrl('userReviews/' + address);
    }

    syncOrderAndParse(again = false, params) {
//        this.gs.big(true);
//        // this.globalService.(true);
        let addressArray = [];
        addressArray.push(this.addressID)
        // this.http.syncOrdersForItems(addressArray).subscribe(res => {
        // this.viewItemService.singleItem(this.addressID).subscribe(
        //     (res: any) => {
        let res = { result: 'ok', item: this.gs.temp };

        if (this.subscription) this.subscription.unsubscribe();

        if (res.result == 'ok') {
            this.item = res['item'];
            console.log('got orders list for this trade', this.item, this.gs.wallet);
            if (this.item.cat && this.item.cat.length)
                this.category = this.item.cat[0]
            this.item.endTimestamp = this.item.endTimestamp * 1000;
            this.item.timestamp = this.item.timestamp * 1000;

            if (this.item.sender != this.gs.wallet['address']) {
                this.chatAddress = this.item.sender;

                // this.goInit.emit(this.chatAddress);
                this.myPurchase = true;


            } else {
                this.myPurchase = false;
                this.chatAddress = this.item.formatted_orders[0].sender;
                // this.goInit.emit(this.chatAddress);
            }
            let type = 'sell';
            if (this.myPurchase) type = 'buy';
            let item4chat = this.item.address;
            if (!this.item.address || !this.item.address.length || this.item.address == '1') item4chat = this.item.hashIpfs;
            console.log('chat goInit', { address: this.chatAddress, goodsAddress: item4chat, type: type, goodsTitle: this.item.title, sender: this.gs.wallet['address'] });
            this.goInit.emit({ address: this.chatAddress, goodsAddress: item4chat, type: type, goodsTitle: this.item.title, sender: this.gs.wallet['address'] });
            // this.item['orders'].forEach(order => {
            //     if (order['transactionHash'] == params['order']) {
            //         let notificationType;
            //         if (this.myItem) notificationType = 'myOrders';
            //         else notificationType = 'myPurchases';
            //         this.notifications.clearNotifications(notificationType, params['order']);
            //         this.orders.push(order);
            //         this.item.orders = [order];
            //         if (this.item.sender != this.gs.wallet['address']) {
            //             this.chatAddress = this.item.sender;

            //             // this.goInit.emit(this.chatAddress);
            //             this.myPurchase = true;
            //         }
            //         else {
            //             this.chatAddress = order.sender;
            //             // this.goInit.emit(this.chatAddress);
            //         }


            //         let type = 'sell';
            //         if (!this.myItem) type = 'buy';
            //         this.goInit.emit({ address: this.chatAddress, goodsAddress: this.item.address, type: type, goodsTitle: this.item.title, sender: this.item.sender });
            //         var payloadData = JSON.parse(order.payload);
            //         this.item.count = payloadData.count;
            //     }
            // })

            // let finalized = localStorage.getItem('finalized-' + this.addressID + '-' + this.chatAddress);
            // if (finalized) this.finalized = true;




            let resArr = [];
            let finalizedIndex = -1;
            let spliceStatus = false;

            if (this.item['orders'] && !this.gs.temp) {
                // this.gs.formatOrders(this.item.sender, this.item['orders'][0], resArr)
            } else {
                resArr = this.gs.temp;
                this.gs.temp = null;
                delete this.gs.temp;
            }

            // if (this.item['orders'])
            //     this.gs.formatOrders(this.item['orders'][0], resArr)
            //this.item['formatted_orders'] = resArr;

            // (this.myPurchase) ? this.item['formatted_orders'] = JSON.parse(localStorage.getItem("formatted_orders")) : this.item['formatted_orders'] = resArr;
            // this.item['formatted_orders'] = JSON.parse(localStorage.getItem("formatted_orders"));


            // for (var i = 0; i < this.item['formatted_orders'].length; i++) {
            //     (this.item['formatted_orders'][i]['eventType'] == 11) ? finalizedIndex = i : null;
            //     (this.item['formatted_orders'][i]['eventType'] == 3) ? spliceStatus = true : null;
            // }
            // finalizedIndex != -1 && spliceStatus ? this.item['formatted_orders'].splice(finalizedIndex, 1) : null;
            // if (resArr[resArr.length - 1]) {
            //     this.item['updatedStatus'] = resArr[resArr.length - 1]['timestamp'];
            //     this.item['currentStatus'] = resArr[resArr.length - 1]['status'];
            //     this.item['currentStatusCode'] = resArr[resArr.length - 1]['eventType'];
            // }

            this.http.getRatingByAddress(this.chatAddress).subscribe(res => {
                if (!res['rating']) res['rating'] = 0;
                console.log('reviews', res);
                this.reviews = res;
            })
            this.translateParams = { value: this.chatAddress };
          // TODO Need to find the route cause of the issue
          this.item.formatted_orders.forEach(item => {
            if(this.finalFormattedOrders.findIndex(i => i.eventType === item.eventType) === -1){
              this.finalFormattedOrders.push(item)
            }
          });
        }
        else
            this.notifications.showMessage('', 'ERROR.WHATEVER');

        console.log('the item', this.item);
        // this.checkConflict(this.item);
        //     },
        //     err => {
        //         this.notifications.showMessage('', 'ERROR.WHATEVER');
        //     }
        // )
//        this.gs.big(false);
    }

    checkConflict(item) {
        // this.conflictCount = 0;
        // this.starter = 0;
        // for (var i = 0; i < this.item['formatted_orders'].length; i++) {
        //     if (this.item['formatted_orders'][i]['eventType'].toString().startsWith('12')) {
        //         this.conflict = true; this.conflictCount++;
        //         if (this.item['formatted_orders'][i]['sender'] == this.gs.wallet.address) { this.disputeDeclined = true; }
        //     }
        // }
        // if (this.conflictCount > 1) { this.starter = this.item['formatted_orders'][0]['sender']; }
    }
    getInfo(id = false) {

        this.route.params
            .subscribe((params: any) => {
                if (id) this.addressID = id;
                else this.addressID = params['id'];
                console.log('cachedOrders', this.gs.temp);
                this.syncOrderAndParse(true, params);

                //if the item was IPFS initially, put the original escrow
                if(this.item.hashIpfs && this.item.hashIpfs.length) {
                    console.log('going to get escrow of ipfs item', this.item.hashIpfs);
                    this.ordersService.getItemByHash(this.item.hashIpfs, this.item.addressIpfs).subscribe((itemIpfs: any) => {
                        console.log('got item escrow by hashIpfs', itemIpfs);
                        this.item.escrowIpfs = itemIpfs.item.escrow;
                    })
                }

                console.log('tradeId', this.addressID);


                // this.processOrders(this.addressID);

            });

    }

    processOrders(tradeId) {
        let orders = this.ordersService.getOrdersByTradeId(tradeId);
        console.log('got orders by Trade ID', orders);
    }


    findOrder(orders) {

    }

    getOwner(item) {
        let buyer = item['formatted_orders'][0]['sender'];
        let seller = false;
        if (buyer != this.gs.wallet.address) seller = true;
        return seller;
    }
    getMoney() {
        this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.get_funds });
        let subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();
                let seller = this.getOwner(this.item);
                let data: any = {
                    tradeId: this.item.orders[0].tradeId,
                    key: this.item.orders[0].key,
                    senderKey: this.item.orders[0].pubkey,
                    // senderKey: this.item.pubkey,
                    goods: { address: this.item.address, escrow: this.item.escrow, title: this.item.title },
                    privateMessage: this.message
                };
                if (!seller) this.router.navigateByUrl('/buy/purchases');
                else this.router.navigateByUrl('/items/orders')
                this.http.claimDispute(data, this.item).subscribe(
                    res => {

                        if (res['result'] && res['result'] == 'ok') {
                            this.notifications.showMessage('COMMON.SUCCESS');

                        } else {
                            this.notifications.showMessage(res['error'], 'ERROR.WHATEVER');
                        }
                    },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            } else subscripition.unsubscribe();
        });
    }


    finalize(dispute = false) {
        // this.notifications.showMessage('Success! Thank you.');
        let senderKey;
        if (this.myPurchase) senderKey = this.item.pubkey;
        else senderKey = this.item.orders[0].pubkey;
        this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.finalize });

        let subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();
                let seller = this.getOwner(this.item);
                let data: any = {
                    tradeId: this.item.orders[0].tradeId,
                    key: this.item.orders[0].key,
                    // senderKey: this.item.orders[0].pubkey,
                    // senderKey: this.item.pubkey,
                    senderKey: this.item['formatted_orders'][0]['sender'] == this.gs.wallet.address ? this.item.pubkey : this.item.orders[0].pubkey,
                    goods: {
                        address: this.item.address,
                        // escrow: '0x6b2563ed136866022f707ede17891120406f45f5',
                        escrow: this.item.escrow,
                        title: this.item.title },
                    privateMessage: this.message,
                    isIpfs: false
                };
                if (this.item.escrowIpfs) {
                    console.log('is an IPFS item!');
                    data.isIpfs = true;
                    data.goods.escrow = this.item.escrowIpfs;
                }
                if (!seller) this.router.navigateByUrl('/buy/purchases');
                else this.router.navigateByUrl('/items/orders')
                this.http.closeDispute(data, this.item, dispute, seller).subscribe(
                    res => {

                        if (res['result'] && res['result'] == 'ok') {
                            this.notifications.showMessage('COMMON.SUCCESS');

                        } else {
                            this.notifications.showMessage(res['error'], 'ERROR.WHATEVER');
                        }
                    },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            } else subscripition.unsubscribe();
        });
    }

    writeReview() {
        localStorage.setItem('finalized-' + this.item.address + '-' + this.chatAddress, 'Y');
        if (this.myPurchase)
            this.router.navigateByUrl('/writeReview/buy/' + this.item.address + '/' + this.item.sender);
        else this.router.navigateByUrl('/writeReview/sell/' + this.item.address + '/' + this.chatAddress)
    }

    dispute() {
        this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.get_funds, bbt: this.gs.bbtListing });
        let subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();
                let seller = this.getOwner(this.item);
                let data: any = {
                    tradeId: this.item.orders[0].tradeId,
                    key: this.item.orders[0].key,
                    senderKey: this.item['formatted_orders'][0]['sender'] == this.gs.wallet.address ? this.item.pubkey : this.item.orders[0].pubkey,
                    goods: { address: this.item.address, escrow: this.item.escrow, title: this.item.title },
                    privateMessage: this.message
                };
                if (!seller) this.router.navigateByUrl('/buy/purchases');
                else this.router.navigateByUrl('/items/orders')

                if (this.item.escrowIpfs) {
                    console.log('is an IPFS item!');
                    data.isIpfs = true;
                    data.goods.escrow = this.item.escrowIpfs;
                }


                this.http.openDispute(data, this.item, seller).subscribe(
                    res => {
                        if (res['result'] && res['result'] == 'ok') {
                            this.notifications.showMessage('COMMON.SUCCESS');

                        } else {
                            this.notifications.showMessage(res['error'], 'ERROR.WHATEVER');
                        }
                    },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            } else subscripition.unsubscribe();
        })
    }

    private data: any = {

    };
    acceptBuy() {
        this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.accept_buy });
        let subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();
                let data: any = {
                    tradeId: this.item.orders[0].tradeId,
                    key: this.item.orders[0].key,
                    senderKey: this.item.orders[0].pubkey,
                    goods: { address: this.item.address, title: this.item.title },
                    privateMessage: this.message
                };
                this.router.navigateByUrl('/items/orders')

                this.ordersService.acceptBuy(data, this.item).subscribe(
                    res => {
                        if (res['result'] && res['result'] == 'ok') {
                            this.notifications.showMessage('COMMON.SUCCESS');

                        } else {
                            this.notifications.showMessage(res['error'], 'ERROR.WHATEVER');
                        }
                    },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            } else subscripition.unsubscribe();
        });
    }
    rejectBuy() {
        this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.reject_buy });
        let subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();
                let data: any = {
                    tradeId: this.item.orders[0].tradeId,
                    key: this.item.orders[0].key,
                    senderKey: this.item.orders[0].pubkey,
                    goods: { address: this.item.address, title: this.item.title },
                    privateMessage: this.message
                };
                this.router.navigateByUrl('/items/orders')
                this.ordersService.rejectBuy(data, this.item).subscribe(
                    res => {
                        if (res['result'] && res['result'] == 'ok') {
                            this.notifications.showMessage('COMMON.SUCCESS');

                        } else {
                            this.notifications.showMessage(res['error'], 'ERROR.WHATEVER');
                        }
                    },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            } else subscripition.unsubscribe();
        })
    }

}
