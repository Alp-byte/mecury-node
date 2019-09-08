import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Dropdown } from './../../utils/dropdown-menu/dropdown-menu.component';
import { Component, OnInit, Directive, EventEmitter, NgZone } from '@angular/core';
import * as objectPath from "object-path";
import * as $ from 'jquery';
import { ViewItemsService } from '../view-items.service';
const DAY = 86400;
@Directive({ selector: 'tip, tip-tip, tip-arrow, tooltip, tip-cont' })
class FakeTags { }

export const FAKE_TAGS = FakeTags;

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {
  private items: any[] = [];// = this.globalService.cached.viewAll;
  private showTip: number = -1;
  private recall: boolean = false;
  private timeInterval: any;
  private timer: string = "10";
  private thumbs: boolean = true;
  private cat: string = "";
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
  constructor(
      private translate: TranslateService,
      private http: HttpService,
      private router: Router,
      private globalService: GlobalService,
      private notifications: NotificationsService,
      private zone: NgZone,
      private route: ActivatedRoute,
      private viewItemService: ViewItemsService
  ) {
      // this language will be used as a fallback when a translation isn't found in the current language
      //this.translate.setDefaultLang(this.globalService.lang);
      // the lang to use, if the lang isn't available, it will use the current loader to get them
      //this.translate.use(this.globalService.lang);

      this.route.params
          .map(params => params['code'])
          .subscribe((code: any) => {
              if (code) {
                  this.zone.run(() => {
                      this.cat = code;
                  })
              } else {
              }
          }
          );
  }

  calcExpired(endTimestamp) {
      if (endTimestamp - Date.now() <= 2 * DAY) return 0;
      else if (endTimestamp - Date.now() > 2 * DAY && endTimestamp - Date.now() < 6 * DAY) return 1;
      else if (endTimestamp - Date.now() > 6 * DAY) return 2;
  }


  ngOnInit() {
      this.getItems();

      this.globalService.searchComponentUp = true;
      this.globalService.searchChanged.subscribe(term => {
          this.filter.search = term;
          this.searchChanged();
      })
  }
  go(address) {
      this.router.navigateByUrl(address);
  }

  ngOnDestroy() {
      this.globalService.searchComponentUp = false;
  }

  getItems() {
    this.viewItemService.getAllListings(false).subscribe(
          (res: any) => {
              if (res['result'] == 'ok') {
                //   this.items = res.items;
              } else {
                  this.notifications.showMessage('', 'ERROR.WHATEVER');
                  return;
              }

              if (!res.items.length) {
                  this.recall = true;
                  this.startCountdown(Date.now() + 10000);
              } else this.recall = false;

              this.items = [];

              this.zone.run(() => {

                  if (this.cat.length) {
                      res.items.map(item => {

                          if (this.cat == item['cat'][0]) {
                            item['active'] = true;
                            this.items.push(item);
                          }
                          if(this.cat === 'undefined' && item['cat'] && ! item['cat'][0]){
                            item['active'] = true;
                            this.items.push(item);
                          }
                      });
                  }
                  else {
                      res.items.map(item => {
                        item['active'] = true;
                        this.items.push(item);
                      });
                  }
              })
//              this.globalService.big(false);

              this.globalService.saveCached();
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
