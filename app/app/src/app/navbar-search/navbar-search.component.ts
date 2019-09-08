import { Router } from '@angular/router';
import { NotificationsService } from './../utils/notifications.service';
import { HttpService } from './../utils/http.service';
import { GlobalService } from './../utils/global.service';
import { Component, OnInit, NgZone } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'navbar-search',
  templateUrl: './navbar-search.component.html',
  styleUrls: ['./navbar-search.component.scss']
})
export class NavbarSearchComponent implements OnInit {
  private activeAutocompletes = false;
  private autocomplete = [];
  private term: string = '';
  constructor(
      private globalService: GlobalService,
      private http: HttpService,
      private notifications: NotificationsService,
      private router: Router,
      private ngZone: NgZone
  ) {

  }
  ngOnInit() {
  }

  choseItem(item) {
      this.autocomplete = [];
      if (item.address && item.address.length) {
      this.router.navigateByUrl('/buy/single-item/' + item.address);
      } else {
        this.router.navigateByUrl('/buy/single-item/' + item.hashIpfs)
    }
    this.term = '';
  }

  keydown($event, index = -1) {
      if (1 || this.globalService.searchComponentUp) {
          if (this.autocomplete.length) {
              if ($event.code == "ArrowUp") {
                  $event.preventDefault();
                  if (index == 0) {
                      let temp:any = $('input.navbar-search')[0]
                      temp.focus();
                  } else if (index > 0) {
                    let temp:any = $('.autocomplete-item-' + (index - 1))[0]
                    temp.focus();
                  }
              } else if ($event.code == "ArrowDown") {
                  $event.preventDefault();
                  if (index < this.autocomplete.length - 1) {
                      let temp:any = $('.autocomplete-item-' + (index + 1))[0]
                      temp.focus();
                  }
              }
          }
          if (index != -1 && $event.code == 'Enter') {
              $event.preventDefault();
              this.choseItem(this.autocomplete[index]);
          } else if (index == -1 && $event.code == 'Enter') {
              $event.preventDefault();
              if (this.autocomplete.length > 1) {
                  let temp:any = $('.autocomplete-item-' + (index + 1))[0]
                  temp.focus();
              }
              else if (this.autocomplete.length == 1) this.choseItem(this.autocomplete[0])
              else if (this.autocomplete.length == 0) this.router.navigateByUrl('/buy/view-all')
          }
      } else {
          // this.globalService.searchChanged.emit($event);
      }
  }
  searchChanged($event) {
      if (1 || !this.globalService.searchComponentUp) {
          this.activeAutocompletes = false;
          if (!this.globalService.viewAll.length) {
              this.router.navigateByUrl('/buy/view-all')
          }
          if ($event != "") {
              this.autocomplete = this.globalService.viewAll.filter(item => this.globalService.filter(item, $event, ['title', 'tags']));
              this.autocomplete.sort((a, b) => {
                return a.title.toLowerCase().indexOf($event) - b.title.toLowerCase().indexOf($event);
              })

          } else {
              this.autocomplete = [];
          }
      } else {
          this.globalService.searchChanged.emit($event);
      }
  }

}
