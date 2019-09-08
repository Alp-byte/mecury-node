import { Router } from '@angular/router';
import { NotificationsService } from './../utils/notifications.service';
import { GlobalService, NotificationItem } from './../utils/global.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    private notifications: NotificationItem[] = [];
    private showTip: number = -1;
    public gas;
    constructor(
        private translate: TranslateService,
        private gs: GlobalService,
        private notificationsService: NotificationsService,
        private router: Router
    ) {
    }

    ngOnInit() {
      this.gas = this.gs.gasPrices;
    }

    openChat() {
        let address = "0xf0f825061ebbd87b7a9223387aeeed7bd2dba0e1";
        this.router.navigateByUrl('/chats')
    }
}
