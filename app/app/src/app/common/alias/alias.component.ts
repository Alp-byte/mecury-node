import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { Component, OnInit, EventEmitter } from '@angular/core';
import * as $ from 'jquery';

@Component({
    selector: 'app-alias',
    templateUrl: './alias.component.html',
    styleUrls: ['./alias.component.css']
})
export class AliasComponent implements OnInit {
    private aliases = [];
    private searchByAlias: string = "";
    private searchByAddress: string = "";
    private goInit: EventEmitter<any> = new EventEmitter<any>(true);
    address = "";
    name = "";
    disableAdd = true;
    constructor(
        private http: HttpService,
        private gs: GlobalService
    ) {

    }
    ngOnInit() {
        this.aliases = this.gs.aliasList();
        this.aliases.forEach(alias => {
            alias['show'] = true;
        })
        this.goInit.emit(false);
    }
    input(type, val) {
        if (type == 'address') this.searchByAlias = "";
        else this.searchByAddress = "";
        this.aliases.forEach(alias => {
            if (alias[type].toLowerCase().indexOf(val.toLowerCase()) == -1) alias['show'] = false;
            else alias['show'] = true;
        })


    }

    checkAdd() {
        let disable;
        this.aliases.forEach((alias, i) => {
            if (alias.address == this.address) disable = true;
        })
        if (!this.address.length || !this.name.length) disable = true;

        this.disableAdd = disable;
    }

    create() {
        this.gs.setAlias(this.address, this.name);
        this.aliases.push({ name: this.name, address: this.address, show: true });
        this.name = "";
        this.address = "";
    }


    removeAlias(i) {
        this.gs.removeAlias(this.aliases[i].address)
        this.aliases.splice(i, 1);
    }


}