import { DAY } from './../../view-items/item-list/item-list.component';
import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as objectPath from "object-path";
import * as $ from 'jquery';
@Component({
  selector: 'app-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.scss']
})
export class ActiveComponent implements OnInit, OnDestroy {
    private items: any[] = this.globalService.cached.active;
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
        private globalService: GlobalService,
        private notifications: NotificationsService
    ) {
    }


    ngOnDestroy() {
        this.globalService.searchComponentUp = false;
    }
    ngOnInit() {
        this.getInfo();
        this.globalService.searchComponentUp = true;
         this.globalService.searchChanged.subscribe(term => {
            this.filter.search = term;
            this.searchChanged();
        })
    }

    getInfo() {
        this.http.viewAllMyActive().subscribe(
            (res: any) => {
                if (res.result == 'ok') {
                    this.items = res.items;
                    this.globalService.cached.active = this.items;
                } else {
                    this.notifications.showMessage('', 'ERROR.WHATEVER');
                }
                res.items.map(item => {
                    item['active'] = true;
                });
                if(localStorage.getItem('activeOrderBy')) {
                  this.orderBy = JSON.parse(localStorage.getItem('activeOrderBy'))
                }
                this.runSort();
            },
            err => {
                this.notifications.showMessage("", 'ERROR.WHATEVER');
            }
        )
    }


    sort(orderByName, $event) {
        $event.preventDefault();
        if (this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        }
        localStorage.setItem('activeOrderBy', JSON.stringify(this.orderBy));
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

      calcExpired(endTimestamp) {
        if (endTimestamp - Date.now() <= 2 * DAY) return 0;
        else if (endTimestamp - Date.now() > 2 * DAY && endTimestamp - Date.now() < 6 * DAY) return 1;
        else if (endTimestamp - Date.now() > 6 * DAY) return 2;
    }

    searchChanged() {
        if (this.filter.search != '') {
            this.items.map(item => {
                if (this.globalService.filter(item, this.filter.search, ['title', 'cat.0', 'priceEth'])) {
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

    go(item){
      if(item.address && item.address.length) {
        this.router.navigateByUrl('/buy/single-item/'+item.address)
      } else this.router.navigateByUrl('/buy/single-item/'+item.hashIpfs)
    }


}
