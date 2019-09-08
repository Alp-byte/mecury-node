import { GlobalService } from './../../utils/global.service';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-addresses',
    templateUrl: './addresses.component.html',
    styleUrls: ['./addresses.component.css']
})
export class AddressesComponent implements OnInit {
    @Input() private addresses: string[] = [];
    private addressField: string = "";
    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private globalService: GlobalService
    ) {
    }


    ngOnInit() {}

    save() {
        this.http.saveSettings([{ key: 'addresses', value: JSON.stringify(this.addresses) }]).subscribe()
    }

    addAddress(address: string): void {
        this.addresses.push(this.addressField);
        this.addressField = "";
        this.save();
    }

    removeAddress(index: number) {
        this.addresses.splice(index, 1);
        this.save();
    }

    clearCache() {
        localStorage.clear();
    }
}
