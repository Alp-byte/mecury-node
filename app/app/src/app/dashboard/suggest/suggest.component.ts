import { EshopEngine } from './../../eshop/engine.service';
import { Component, OnInit, Input, EventEmitter, NgZone } from '@angular/core';
import * as $ from 'jquery';
@Component({
    selector: 'suggest',
    templateUrl: './suggest.component.html',
    styleUrls: ['./suggest.component.scss']
})
export class SuggestComponent implements OnInit {

    @Input('category') category;
    @Input('tags') tags;
    @Input('initSuggested') initSuggested: EventEmitter<any>;
    private suggested: Object[];
    constructor(
        private eshop: EshopEngine,
        private zone: NgZone
    ) { }

    ngOnInit() {
        if (this.initSuggested)
            this.initSuggested.subscribe(res => {
                this.zone.run(() => {
                    this.suggested = this.eshop.smartSort(4, res.address, res.tags, res.category);
                })
            })
    }
}
