import { OrdersService } from './../orders.service';
import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';


import * as objectPath from "object-path";
import * as $ from 'jquery';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
    private items: any[] = this.globalService.cached.myOrders;
    private filter: any = {
        search: ''
    };
    private orderBy: any = {
        name: 'updatedStatus',
        desc: true
    };
    //little hack to make sure Pipe updates data and returns length
    private changeState: boolean = false;
    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private router: Router,
        private globalService: GlobalService,
        private notifications: NotificationsService,
        private ordersService: OrdersService
    ) {
    }

    ngOnDestroy() {
        this.notifications.onOrdersPage.emit(false);
        this.globalService.searchComponentUp = false;
    }
    ngOnInit() {
        this.globalService.searchComponentUp = true;
        this.globalService.searchChanged.subscribe(term => {
            this.filter.search = term;
            this.searchChanged();
        });
        this.getInfo();
        this.notifications.clearNotifications('myOrders');
        this.notifications.onOrdersPage.emit(true);
    }

    syncOrders(again = false) {
//        this.globalService.(true);
        // this.http.syncAllMyOrders().subscribe(res => {
        //     if (!again) this.getInfo();
//        //     this.globalService.(false);
        // });
    }


    getInfo() {

        this.items = this.ordersService.orders.getValue();
        console.log('got orders', this.items);
        this.ordersService.orders.subscribe(orders => {
            console.log('orders got updated', orders);
            this.items = orders;
            
        })
    }


    goToOrderDetail(address, order) {
    }

    sort(orderByName, $event) {
        $event.preventDefault();
        if (this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc;
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        }
        localStorage.setItem('myOrderBy', JSON.stringify(this.orderBy));
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
        // localStorage.setItem("tempCache", JSON.stringify(item["formatted_orders"]));
        //end hack
        this.router.navigateByUrl('/items/orders/' + item.tradeId);
    }


}
