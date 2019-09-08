import { EshopEngine } from './../../eshop/engine.service';
import { Component, OnInit, NgZone } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'app-viewed',
  templateUrl: './viewed.component.html',
  styleUrls: ['./viewed.component.scss']
})
export class ViewedComponent {
    private viewed: Object[];
    constructor(
        private eshop: EshopEngine,
        private zone: NgZone
    ) {
        this.zone.run(() => {
            this.viewed = eshop.getViewed();
            this.viewed.reverse();            
        })

    }

}