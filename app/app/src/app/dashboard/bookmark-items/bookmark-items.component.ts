import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-bookmark-items',
  templateUrl: './bookmark-items.component.html',
  styleUrls: ['./bookmark-items.component.css']
})
export class BookmarkItemsComponent implements OnInit { 
    private items: any[] = [];
    private showTip: number = -1;
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
        private globalService: GlobalService,
        private notifications: NotificationsService
    ) {
    }


    ngOnInit() {
        this.getItems();
    }

    getItems() {
        this.http.getBookmarkedItems().subscribe(
        (res:any) => {
              if (res['result'] == 'ok') {
                  this.items = res.items;
              } else {
                  this.notifications.showMessage('', 'ERROR.WHATEVER');
              }
              
              if(!res.items || !res.items.length) { 
                  this.recall = true;
              } 

              if(res.items) {
                res.items.map(item => {
                    item['active'] = true;
                });
                this.runSort();
              }
              
            },
            err => {
                this.notifications.showMessage("", 'ERROR.WHATEVER');
            }
        )
    }


    sort(orderByName, $event) {
        $event.preventDefault();
        if(this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        } 
        this.changeState = !this.changeState;
        this.runSort();
    }

    runSort() {
        let $this = this;
        this.items = this.items.sort((a: any,b: any)=>{
            if ($this.orderBy.desc)
                return $this.globalService.sortBackwards(a,b,$this.orderBy.name);
            else
                return $this.globalService.sort(a,b,$this.orderBy.name);
        });
    }

    searchChanged() {
        if (this.filter.search != '') {
            this.items.map(item => {
                if(this.globalService.filter(item, this.filter.search, ['title', 'cat.0', 'priceEth'])) {
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

    getTimeRemaining(endtime){
        var t = endtime - Date.now();
        var seconds = Math.floor( (t/1000) % 60 );
        var minutes = Math.floor( (t/1000/60) % 60 );
        var hours = Math.floor( (t/(1000*60*60)) % 24 );
        var days = Math.floor( t/(1000*60*60*24) );
        return { 
            'total': t, 
            'days': days,
            'hours': hours,
            'minutes': minutes, 
            'seconds': seconds
        };
    }
    startCountdown(endtime){
        this.timeInterval = setInterval(() => {
            let t = this.getTimeRemaining(endtime);
            this.timer = (t.seconds+1).toString();
            if(t.total<=0){
                this.timer = "";
                this.getItems(); 
                clearInterval(this.timeInterval);
            }
        },1000);
    }

    goTo(address) {
        scroll(0,0);
        this.router.navigateByUrl(address);
    }

   
}