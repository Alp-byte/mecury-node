import { Router } from '@angular/router';
import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { Component, OnInit, NgZone } from '@angular/core';
import * as $ from 'jquery';
import { NotificationsService } from "../../utils/notifications.service";

@Component({
    selector: 'transactions-list',
    templateUrl: './transactions-list.component.html',
    styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
    private transactionList = [];
    constructor(
        private http: HttpService,
        private gs: GlobalService,
        private notifications: NotificationsService,
        private zone: NgZone,
        private router: Router
    ) {

    }
    ngOnInit() {
        this.getInfo();
        this.gs.removeAction.subscribe(() =>
            setTimeout(() => this.getInfo(), 500)
        );
    }
    getInfo() {
      this.transactionList = JSON.parse(localStorage.getItem('transactions'));
        this.http.getTransactions().subscribe((transactions: any) => {
            this.transactionList = transactions.items;
            this.transactionList && this.transactionList.forEach(data =>{
              if(data.hash.length === 0)
                data.hash = "-"
            })
          localStorage.setItem('transactions', JSON.stringify(this.transactionList));
        })
    }
}
