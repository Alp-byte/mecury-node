import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { NotificationsService } from './../../utils/notifications.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';

import * as $ from 'jquery';
import * as fancybox from 'fancybox';

@Component({
  selector: 'app-dispute',
  templateUrl: './dispute.component.html',
  styleUrls: ['./dispute.component.css']
})

export class DisputeComponent implements OnInit {
  private item: any = {};
  private message: string = "";
  private visual: any = {
      expandDetails: false,
      escrow: false
  }
  private purchase: boolean = false;
  private dispute: boolean = false;
  private category: string = "";
  constructor(
      private route: ActivatedRoute,
      private http: HttpService, 
      private notifications: NotificationsService,
      private global: GlobalService
  ) {
      
  } 
  ngOnInit() {
      this.route.params
          .map(params => params['id'])
          .subscribe((id: any) => {                
              this.item['address'] = id;                    
          });
      
  }
}