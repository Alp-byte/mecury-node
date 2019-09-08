import { Component, Input } from "@angular/core";

@Component({
    selector: 'price',
    templateUrl: './price.component.html',
    styleUrls: ['./price.component.scss']
})
export class PriceComponent {
    @Input() price;
    @Input() currency;
}