import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { Dropdown } from './../../utils/dropdown-menu/dropdown-menu.component';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Directive, OnDestroy, EventEmitter, NgZone, ChangeDetectorRef } from '@angular/core';
import * as objectPath from "object-path";
import * as $ from 'jquery';
import { Category } from '../../utils/http.service';
import { ViewItemsService } from '../view-items.service';
const DAY = 86400;
@Directive({ selector: 'tip, tip-tip, tip-arrow, tooltip, tip-cont' })
class FakeTags { }

export const FAKE_TAGS = FakeTags;
@Component({
    selector: 'app-view-all',
    templateUrl: './view-all.component.html',
    styleUrls: ['./view-all.component.scss']
})
export class ViewAllComponent implements OnInit, OnDestroy {
    private items: any[] = this.globalService.cached.viewAll;
    private showTip: number = -1;
    private recall: boolean = false;
    private timeInterval: any;
    private timer: string = "10";
    private thumbs: boolean = true;
    private tag;
    private showCats = false;
    private update: EventEmitter<any> = new EventEmitter<any>(true);
    private filter: any = {
        search: ''
    };
    private orderBy: any = {
        name: 'title',
        desc: false
    };
    private dropdownMenu: Array<Dropdown> = [{
        name: 'DROPDOWN.PRICE',
        type: 'asc',
        code: 'priceEth',
        active: false
    }, {
        name: 'DROPDOWN.PRICE',
        type: 'desc',
        code: 'priceEth',
        active: false
    }, {
        name: 'DROPDOWN.LISTED',
        type: 'desc',
        code: 'timestamp',
        active: true
    }, {
        name: 'DROPDOWN.ENDS',
        type: 'asc',
        code: 'endTimestamp',
        active: false
    }]
    //little hack to make sure Pipe updates data and returns length
    private changeState: boolean = false;
    private publicCategories: Category[];
    private selectedId: string;

    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private router: Router,
        private globalService: GlobalService,
        private notifications: NotificationsService,
        private zone: NgZone,
        private route: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        private viewItemService: ViewItemsService
    ) {
        try {
            this.zone.run(() => {
                let temp = localStorage.getItem('publicCategories');
                if (temp) this.publicCategories = JSON.parse(temp);
                this.changeDetector.detectChanges();
            })
        } catch (e) {

        }
    }

    calcExpired(endTimestamp) {
        if (endTimestamp - Date.now() <= 2 * DAY) return 0;
        else if (endTimestamp - Date.now() > 2 * DAY && endTimestamp - Date.now() < 6 * DAY) return 1;
        else if (endTimestamp - Date.now() > 6 * DAY) return 2;
    }


    ngOnInit() {
        let ipfsPreference = this.globalService.ipfsPreference.value;
        this.selectedId = localStorage.getItem('selectedId');

        if(!ipfsPreference && this.selectedId && this.selectedId.startsWith("Q")){
          localStorage.removeItem('selectedId');
        }
        else{
          let selectedDiv = document.getElementById(this.selectedId);

          if (this.selectedId && this.router.url === "/buy/view-all") {
            if (selectedDiv) {
              let scrollHeight = selectedDiv.offsetTop;
            //   window.scroll(0, scrollHeight);
              localStorage.removeItem('selectedId');
            }
            else {
              if (this.router.url === "/buy/view-all") {
                var checkSelection = setInterval(() => {
                  if (this.router.url !== "/buy/view-all") {
                    return
                  }
                //   window.scrollTo(0, document.body.scrollHeight);
                  let selectedDiv = document.getElementById(this.selectedId);
                  if (selectedDiv) {
                    let scrollHeight = selectedDiv.offsetTop;
                    // window.scroll(0, scrollHeight);
                    localStorage.removeItem('selectedId');
                    clearInterval(checkSelection);

                  }
                }, 400);
              }
            }
          }
        }
        this.update.emit(this.items);
        if (!this.selectedId) {
            this.getItems();
        }
    }
    go(address) {
        this.router.navigateByUrl(address);
    }

    ngOnDestroy() {
        this.globalService.searchComponentUp = false;
    }

    getItems() {
        this.publicCategories = this.viewItemService.getPublicCategories();

        this.viewItemService.getAllListings(false).subscribe(
            (res: any) => {
                if (res['result'] == 'ok') {
                    this.items = res.items;
                } else {
                    this.notifications.showMessage('', 'ERROR.WHATEVER');
                }
                res.items.map(item => {
                    item['active'] = true;

                });

                this.route.params
                    .map(params => params['tag'])
                    .subscribe((tag: any) => {
                        if (tag) {
                            this.tag = tag;
                            res.items.map(item => {
                                if (item['tags'].indexOf(tag) != -1) item['active'] = true;
                                else item['active'] = false;
                            });
                        }
                    });
//                this.globalService.big(false);
//                this.globalService.(false);
                this.globalService.viewAll = res['items'];
                this.globalService.cached.viewAll = res['items'];
                this.globalService.saveCached();
                this.publicCategories = this.viewItemService.getPublicCategories();
                if (this.publicCategories && this.publicCategories.length) {
                    localStorage.setItem('publicCategories', JSON.stringify(this.publicCategories))
                }
                this.update.emit(this.items);

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
        this.changeState = !this.changeState;
        this.runSort();
    }

    private dropdownClicked(dropdown: Dropdown): void {
        this._runSort(dropdown);
    }

    goCat(cat) {
        this.router.navigateByUrl('/search/category/' + cat)
    }

    changeView(val) {
        this.zone.run(() => {
            this.thumbs = val;
        })
    }

    _runSort(by: Dropdown) {
        let $this = this;
        this.items = this.items.sort((a: any, b: any) => {
            if (by.type == 'desc')
                return $this.globalService.sortBackwards(a, b, by.code);
            else
                return $this.globalService.sort(a, b, by.code);
        });
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
        if (this.filter.search != '') {
            this.items.map(item => {
                if (this.globalService.filter(item, this.filter.search, ['title', 'cat.0', 'tags'])) {
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

    getTimeRemaining(endtime) {
        var t = endtime - Date.now();
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }
    startCountdown(endtime) {
        this.timeInterval = setInterval(() => {
            let t = this.getTimeRemaining(endtime);
            this.timer = (t.seconds + 1).toString();
            if (t.total <= 0) {
                this.timer = "";
                this.getItems();
                clearInterval(this.timeInterval);
            }
        }, 1000);
    }


}
