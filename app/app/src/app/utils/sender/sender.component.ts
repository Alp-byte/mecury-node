import { GlobalService } from './../global.service';
import { Component, OnInit, Input } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'sender',
  templateUrl: './sender.component.html',
  styleUrls: ['./sender.component.css']
})
export class SenderComponent implements OnInit {
    @Input('address') address;
    @Input('goInit') goInit;
    constructor(
        private gs: GlobalService
    ) {

    }
    ngOnInit() {

        if (this.goInit)
            this.goInit.subscribe(address => {
                setTimeout(() => {
                    if (this.address)
                        this.workAddress(this.address);
                    else this.workAddress(address);
                }, 100)
            })
        else {
            this.workAddress(this.address);
        }
    }

    workAddress(address) {
        this.name = address;
        this.address = address;

        let _address = this.gs.getAlias(address);
        if (_address)
            this.name = _address['name'];
    }

    private name: any = "";
    private modify: boolean = false;

    save() {
        this.modify = false;
        this.gs.setAlias(this.address, this.name);
    }
}