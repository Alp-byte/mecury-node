import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Dropdown, DropdownMenuComponent } from './../../utils/dropdown-menu/dropdown-menu.component';
import { Category, HttpService } from './../../utils/http.service';

import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Directive, OnDestroy, NgZone, Input, EventEmitter, ViewChild } from '@angular/core';
import * as objectPath from "object-path";
import * as $ from 'jquery';
import { ViewItemsService } from '../view-items.service';

export const DAY = 86400;
@Directive({ selector: 'tip, tip-tip, tip-arrow, tooltip, tip-cont' })
class FakeTags { }
@Component({
  selector: 'item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})

export class ItemListComponent implements OnInit {
  @Input() items: any[];
  @Input() update: EventEmitter<any>;
  @ViewChild('divClick') divClick: DropdownMenuComponent;

  private dropdownList = [];
  private selectedItems = [];
  private selected = [];
  private cat: string = "";
  private dropdownSettings = {};
  private showTip: number = -1;
  private recall: boolean = false;
  private timeInterval: any;
  private timer: string = "10";
  private translateParams = {};
  private thumbs: boolean = true;
  private selectedId: string = '';
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
  private publicCategories: Category[] = [];
  private stores = [];
  private listLimit: number = 12;
  private limitMultiplier: number = 12;
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
    this.limitMultiplier = 12;
    this.listLimit = this.limitMultiplier;
    let thumbs: any = localStorage.getItem('listingThumbs');
    if (thumbs) this.thumbs = thumbs == 'false' ? false : true;
  }


  calcExpired(endTimestamp) {
    if (endTimestamp - Date.now() <= 2 * DAY) return 0;
    else if (endTimestamp - Date.now() > 2 * DAY && endTimestamp - Date.now() < 6 * DAY) return 1;
    else if (endTimestamp - Date.now() > 6 * DAY) return 2;

  }


  ngOnInit() {
    this.getStoreName();

    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Store(s)",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      labelKey: "storename",
      primaryKey: "length"
    };

    let isback = localStorage.getItem('issingleitem');

    if (isback == 'true') {
      localStorage.setItem('issingleitem', 'false');
      this.selected = (JSON.parse(localStorage.getItem('selected')) || []);
      this.selectedItems = JSON.parse(localStorage.getItem('selected')) || [];
      localStorage.removeItem('selected');
      if (this.selected.length != 0) {
        this.selectchange();
      }
    }
    else {
      localStorage.removeItem('selected');
    }

    this.items.forEach((item) => {
      // if (item.endTimestamp < Date.now() / 1000) item['expired'] = true;
      if(item.hashIpfs) this.translateParams[item.hashIpfs] = { value: item.availableCount };
      else this.translateParams[item.address] = { value: item.availableCount }
    })
    let scope = this;
    $(window).scroll(function () {
      if ($('#load-more') && $('#load-more').offset()) {
        var hT = $('#load-more').offset().top,
          hH = $('#load-more').outerHeight(),
          wH = $(window).height(),
          wS = $(this).scrollTop();
        if (wS > (hT + hH - wH)) {
          scope.loadMore();
        }
      }
    });

    this.globalService.searchComponentUp = true;
    this.globalService.searchChanged.subscribe(term => {
      this.filter.search = term;
      this.searchChanged();
    })


    this.update.subscribe(items => {
      this.items = items;
      if (localStorage.getItem('sort')) {
        let sortObj = this.dropdownMenu.find((data) => data.code === localStorage.getItem('sort'));
        let index = this.dropdownMenu.indexOf(sortObj);
        this.divClick._clicked(index);
        this._runSort(sortObj);

      }

      this.items.forEach((item) => {
        if (item.endTimestamp < Date.now() / 1000) item['expired'] = true;
        if(item.hashIpfs) this.translateParams[item.hashIpfs] = { value: item.availableCount };
        else this.translateParams[item.address] = { value: item.availableCount }
      })
      setTimeout(() => {
        $('.stroke-hamburgermenu').trigger('click');
      }, 50)
    })
  }

  go(item) {
    if(item.address && item.address.length) {
      localStorage.setItem('selectedId', item.address);
      this.router.navigateByUrl('/buy/single-item/'+item.address)
    } else {
      localStorage.setItem('selectedId', item.hashIpfs);
      this.router.navigateByUrl('/buy/single-item/'+item.hashIpfs)
    }
    // this.router.navigateByUrl(path);
    localStorage.setItem('selected', JSON.stringify(this.selectedItems));
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
    localStorage.setItem('sort', dropdown.code);
    this._runSort(dropdown);
  }



  goCat(cat) {
    this.router.navigateByUrl('/search/category/' + cat)
  }

  changeView(val) {
    this.zone.run(() => {
      if (val) this.limitMultiplier = 12;
      else this.limitMultiplier = 4;
      this.listLimit = this.limitMultiplier;
      window.scrollTo(0, 0);
      this.thumbs = val;
      localStorage.setItem('listingThumbs', val == false ? 'false' : 'true')
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

  loadMore() {
    this.listLimit = this.listLimit + this.limitMultiplier;
  }

  getIdOfSelected(selectedId) {
    localStorage.setItem('selectedId', selectedId);
  }

  getStoreName() {
    let localstorename = localStorage.getItem('AllStoreFront');
    this.dropdownList = localstorename ?  JSON.parse(localstorename) : [];
    this.viewItemService.viewAllStoreName().subscribe(
      (res: any) => {
        if (res.result == 'ok') {
          // this.stores = res.items;
          let length = 0;
          res.items.map(e => {
            var index = this.stores.findIndex(f => f.sender === e.sender && f.storename === e.storename);
            if(index === -1){
              length = length + 1;
              // this.stores.push(e)
              this.stores.push({...e,length})
            }
          })

        }
        localStorage.setItem('AllStoreFront', JSON.stringify(this.stores));
        this.dropdownList = this.stores;
      }
    )
  }

  selectchange() {
    this.viewItemService.viewAllSelectedStoresItem(this.selected).subscribe(
      (res: any) => {
        if (res.result == 'ok') {
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
          this.items = res.items;

          this.zone.run(() => {
            if (this.cat.length) {
              res.items.map(item => {
                if (this.cat == item['cat'][0]) {
                  if (item.endTimestamp < Date.now() / 1000) item['expired'] = true;
                  if(item.hashIpfs) this.translateParams[item.hashIpfs] = { value: item.availableCount };
                  else this.translateParams[item.address] = { value: item.availableCount }
                  item['active'] = true;
                }
                if (this.cat === 'undefined' && item['cat'] && !item['cat'][0]) {
                  if (item.endTimestamp < Date.now() / 1000) item['expired'] = true;
                  if(item.hashIpfs) this.translateParams[item.hashIpfs] = { value: item.availableCount };
                  else this.translateParams[item.address] = { value: item.availableCount }
                  item['active'] = true;
                }
              });
            }
            else {
              res.items.map(item => {
                if (item.endTimestamp < Date.now() / 1000) item['expired'] = true;
                if(item.hashIpfs) this.translateParams[item.hashIpfs] = { value: item.availableCount };
                else this.translateParams[item.address] = { value: item.availableCount }
                item['active'] = true;
              });
            }
          })
        }
      }
    )
  }

  onItemSelect() {
    this.selectedItems.map(o => {
      if (this.selected.indexOf(o) === -1) {
        // this.selected.push(o.sender);
        this.selected.push(o);
      }
    });
    this.selectchange();
  }

  OnItemDeSelect(args) {
    const index = this.selected.indexOf(args);
    this.selected.splice(index, 1);
    console.log(this.selected);
    if (this.selected.length != 0)
      this.selectchange();
    else
      this.onDeSelectAll(args);
  }

  onDeSelectAll(args) {
    if (this.cat != "")
      this.router.navigateByUrl('/search/category/' + this.cat)
    else
      this.router.navigateByUrl('buy/view-all');
  }

  onSelectAll(args) {
    this.onItemSelect();
  }
}
