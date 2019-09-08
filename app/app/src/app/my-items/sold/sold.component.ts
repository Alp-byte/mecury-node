import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as objectPath from "object-path";
import * as $ from 'jquery';
@Component({
  selector: 'app-sold',
  templateUrl: './sold.component.html',
  styleUrls: ['./sold.component.css']
})
export class SoldComponent implements OnInit, OnDestroy {
  private items: any[] = this.globalService.cached.sold;
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
      this.notifications.clearNotifications('sold');
  }

  getInfo() {
      this.http.viewAllMySold().subscribe(
          (res: any) => {
              if (res.result == 'ok') {
                  this.items = res.items;
              } else {
                  this.notifications.showMessage('', 'ERROR.WHATEVER');
              }
              res.items.map(item => {
                  item['active'] = true;
              });
            if(localStorage.getItem('soldOrderBy')) {
              this.orderBy = JSON.parse(localStorage.getItem('soldOrderBy'))
            }
            this.runSort();

          },
          err => {
              this.notifications.showMessage("", 'ERROR.WHATEVER');
          }
      )
  }

  go(item){
      this.router.navigateByUrl('/buy/single-item/'+item.address);
  }


  sort(orderByName, $event) {
      $event.preventDefault();
      if (this.orderBy.name == orderByName)
          this.orderBy.desc = !this.orderBy.desc
      else {
          this.orderBy.name = orderByName;
          this.orderBy.desc = false;
      }
    localStorage.setItem('soldOrderBy', JSON.stringify(this.orderBy));
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
      this.globalService.cached.sold = this.items;
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

}
