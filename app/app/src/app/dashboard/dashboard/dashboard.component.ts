import { OrdersService } from './../../orders/orders.service';
import { NotificationsService } from './../../utils/notifications.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationItem, GlobalService, ORDER_STATUS } from './../../utils/global.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
import { ViewItemsService } from '../../view-items/view-items.service';
import { SyncService } from '../../sync/sync.service';
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    private notifications: NotificationItem[] = [];
    private showTip: number = -1;
    private announce;
    public order_status = ORDER_STATUS

    ngOnInit() {
        this.getItems();
        this._notifications.notificationsLog.subscribe(res => {
            this.notifications = res;

            let $this = this;
            this.notifications = this.notifications = this.notifications.sort((a: any, b: any) => {
                return $this.gs.sortBackwards(a, b, 'date');
            });

        })

        this.http.getAnnounce().subscribe(res => {
            this.announce = res;
        })
        let $this = this;


        //        this.gs.big(false);
    }

    go(link) {
        this.router.navigateByUrl(link);
    }

    private items: any[] = [];
    private recall: boolean = false;
    private timeInterval: any;
    private timer: string = "10";
    private filter: any = {
        search: ''
    };
    private orderBy: any = {
        name: 'title',
        desc: false
    };
    //little hack to make sure Pipe updates data and returns length
    private changeState: boolean = false;
    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private router: Router,
        private gs: GlobalService,
        private _notifications: NotificationsService,
        private ordersService: OrdersService,
        private ref: ChangeDetectorRef,
        private viewItemsService: ViewItemsService,
        private syncService: SyncService
    ) {
    }


    getItems() {
        this.http.getBookmarkedItems().subscribe(
            (res: any) => {
                if (res['result'] == 'ok') {
                    this.items = res.items;
                } else {
                    this._notifications.showMessage('', 'ERROR.WHATEVER');
                }

                if (!res.items || !res.items.length) {
                    this.recall = true;
                }

                if (res.items) {
                    res.items.map(item => {
                        item['active'] = true;
                    });
                    this.runSort();
                }

            },
            err => {
                this._notifications.showMessage("", 'ERROR.WHATEVER');
            }
        )
    }


    sort(orderByName, $event, id) {
        $event.preventDefault();
        if (this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        }
        this.changeState = !this.changeState;
        if (id == 'not')
            this.notificationrunSort();
        else
            this.runSort();
    }

    runSort() {
        let $this = this;
        this.items = this.items.sort((a: any, b: any) => {
            if ($this.orderBy.desc)
                return $this.gs.sortBackwards(a, b, $this.orderBy.name);
            else
                return $this.gs.sort(a, b, $this.orderBy.name);
        });
    }

    notificationrunSort() {
        let $this = this;
        this.notifications = this.notifications.sort((a: any, b: any) => {
            if ($this.orderBy.desc)
                return $this.gs.sortBackwards(a, b, $this.orderBy.name);
            else
                return $this.gs.sort(a, b, $this.orderBy.name);
        });
    }

    searchChanged() {
        if (this.filter.search != '') {
            this.items.map(item => {
                if (this.gs.filter(item, this.filter.search, ['title', 'cat.0', 'priceEth'])) {
                    item.active = true;
                } else {
                    item.active = false;
                }
            });
        } else {
            this.items.map(item => {
                item['active'] = true;
            });
        }
    }

    notificationNav(status, address) {
        if (
            status == 1
            || status == 10
            || status == 12
            || status == 11
            || status == 14
        ) {
            this.router.navigateByUrl('/items/orders');
        }
        if (
            status == 2
            || status == 3
            || status == 4
            || status == 13
            || status == 110
            || status == 121
        ) {
            this.router.navigateByUrl('/buy/purchases');
        }
        if (status == 'expired') {
            this.router.navigateByUrl('/items/expired');
        }
        if (status == 'sold') {
            this.router.navigateByUrl('/items/sold');
        }
    }


    getOrders() {
        this.syncService.getOrdersSimple().then(res => console.log('getOrdersSimple res', res)).catch(err => console.error('getOrdersSimple err', err))
    }

    getPurchases() {
        this.syncService.getPurchasesSimple().then(res => console.log('getPurchasesSimple res', res)).catch(err => console.error('getPurchasesSimple err', err))
    }
}
