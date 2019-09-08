import { OrdersService } from './../orders.service';
import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as objectPath from "object-path";
import * as $ from 'jquery';
import { ViewItemsService } from '../../view-items/view-items.service';
@Component({
    selector: 'app-purchases',
    templateUrl: './purchases.component.html',
    styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit, OnDestroy {
    private items: any[] = this.globalService.cached.myPurchases;
    private filter: any = {
        search: ''
    };
    private orderBy: any = {
        name: 'timestamp',
        desc: true
    };
    private bookmarkedItems: any = [];

    private changeState: boolean = false;
    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private router: Router,
        private globalService: GlobalService,
        private notifications: NotificationsService,
        private viewItemService: ViewItemsService,
        private ordersService: OrdersService
    ) {
    }


    ngOnInit() {
        this.getInfo();
        // this.globalService.temp = null;
        this.notifications.clearNotifications('myPurchases');
        this.notifications.onPurchasesPage.emit(true);

    }

    syncOrders(again = false) {
//        this.globalService.(true);
        let addresses = [];
        let escrows = [];
        this.items.forEach(item => {
            if (!addresses.includes(item.address))
                addresses.push(item.address)
            if (!escrows.includes(item.escrow))
                escrows.push(item.escrow)
        });
        if (addresses.length === 0 && escrows.length === 0) {
//            this.globalService.(false);
        }

        this.bookmarkedItems = JSON.parse(localStorage.getItem("bookmarkedItems"))
        this.items.forEach(item => {
            let bookmarkitem = this.bookmarkedItems.find(i => i.address === item.address && item.currentStatus === "PENDING.PURCHASE_ACCEPTED")
            if (bookmarkitem) {
                if (bookmarkitem.availableCount !== 0) {
                    this.viewItemService.singleItem(item.address).subscribe(
                        (res: any) => {
                            bookmarkitem.availableCount = item.availableCount;
                            localStorage.setItem("bookmarkedItems", JSON.stringify(this.bookmarkedItems));
                        })
                }
            }
        });
        // this.http.syncAllMyPurchases(addresses, escrows).subscribe(res => {
        //     if (!again) this.getInfo();
//        //     this.globalService.(false);
        // });
    }

    getInfo() {
        
        this.items = this.ordersService.purchases.getValue();
        console.log('got purchases', this.items);
        this.ordersService.purchases.subscribe(purchases => {
            console.log('purchases got updated', purchases);
            this.items = purchases;
            this.items.forEach(item => item.active = true)
        })
        // this.ordersService.getOrdersIPFS().subscribe(ordersIPFS => {
        //     console.log('orders IPFS', ordersIPFS);
        // })

        // this.http.getMyPurchases().subscribe(
        //     (res: any) => {
        //         let notifications = this.notifications.notifications.getValue();
        //         this.notifications.clearNotifications('myOrders');

        //         let addresses = [];

        //         let now = Date.now() / 1000;
        //         res.items.map(item => {
        //             if (item.endTimestamp > now) { item['active'] = true; }
        //             else {
        //                 item['active'] = false;
        //             }
        //             let resArr = [];

        //             let finalizedIndex=-1;
        //             let spliceStatus=false;
        //             this.globalService.formatOrders(item.sender, item['orderObj'], resArr);

        //             let unseen = localStorage.getItem('purchases_lastseen');
        //             item['formatted_orders'] = resArr;

        //             for (var i = 0; i < item['formatted_orders'].length; i++) {
        //                 (item['formatted_orders'][i]['eventType'] == 11) ? finalizedIndex = i : null;
        //                 (item['formatted_orders'][i]['eventType'] == 3) ? spliceStatus = true : null;
        //             }
        //             finalizedIndex!=-1 && spliceStatus ? item['formatted_orders'].splice(finalizedIndex,1) : null;

        //             if (resArr[resArr.length - 1]) {
        //                 item['updatedStatus'] = resArr[resArr.length - 1]['timestamp'];
        //                 item['orderMessage'] = resArr[resArr.length - 1]['private']['msg'];
        //                 item['currentStatus'] = resArr[resArr.length - 1]['status'];
        //                 item['currentStatusCode'] = resArr[resArr.length - 1]['eventType'];
        //                 // if(item['updatedStatus']>unseen) item['unseen'] = true;
        //             }
        //             if (!item['updatedStatus']) item['updatedStatus'] = 0;
        //             if (!item['orderDate']) item['orderDate'] = 0;
        //         });
        //         if (res.result == 'ok') {
        //             localStorage.setItem('purchases_lastseen', (Date.now() / 1000).toString());
        //             this.items = res.items;
        //         } else {
        //             this.notifications.showMessage('', 'ERROR.WHATEVER');
        //         }


        //         if (localStorage.getItem('purchaseOrderBy')) {
        //             this.orderBy = JSON.parse(localStorage.getItem('purchaseOrderBy'))
        //         }
        //         this.runSort();

        //         if (res.result == 'ok') {

        //             this.globalService.cached.myPurchases = this.items;
        //             this.globalService.saveCached();
        //         }
        //     },
        //     err => {
        //         this.notifications.showMessage("", 'ERROR.WHATEVER');
        //     }
        // )
    }

    ngOnDestroy() {
        this.notifications.onPurchasesPage.emit(false);
    }

    sort(orderByName, $event) {
        $event.preventDefault();
        if (this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc;
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        }
        localStorage.setItem('purchaseOrderBy', JSON.stringify(this.orderBy));
        this.changeState = !this.changeState;
        this.runSort();
    }

    runSort() {
        let $this = this;
        this.items = this.items.sort((a: any, b: any) => {
            if ($this.orderBy.desc)
                return $this.globalService.sortBackwards(a, b, $this.orderBy.name);
            else
                return $this.globalService.sort(a, b, $this.orderBy.name);
        });
    }

    searchChanged() {
        let now = Date.now() / 1000;
        if (this.filter.search != '') {

            this.items.map(item => {
                let val = this.globalService.filter(item, this.filter.search, ['title']);

                if (val && item.endTimestamp > now) {
                    item.active = true;
                } else {
                    item.active = false;
                }
            });
        } else {
            this.items.map(item => {
                if (item.endTimestamp > now) { item['active'] = true; }
                else {
                    item['active'] = false;
                }
            });
        }
    }

    goOrder(item) {
        //hack because getItem returns encrypted order
        this.globalService.temp = item;
        localStorage.setItem("formatted_orders", JSON.stringify(item["formatted_orders"]));
        //end hack
        this.router.navigateByUrl('/items/orders/' + item.tradeId);
    }


}
