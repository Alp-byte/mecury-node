// deprecated at the moment
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService } from './../../utils/global.service';
import { NotificationsService } from './../../utils/notifications.service';
import { HttpService } from './../../utils/http.service';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { ViewItemsService } from '../../view-items/view-items.service';

export interface GoodsInfo {
  title?: string;
  description?: string;
  currency?: string;
  price?: any;
  saleCount?: any;
  escrow?: string;
  expireTime?: any;
  cat?: string[];
  tags?: string;
  img?: string[];
  ship?: any[];
}
@Component({
  selector: 'app-active-detail',
  templateUrl: './active-detail.component.html',
  styleUrls: ['./active-detail.component.css']
})
export class ActiveDetailComponent implements OnInit {
    private successfullyListed: boolean = false;
    private price_num: boolean = false;
    private duration: number = 1209600;
    private item_address: string = '';
    private ship_num: boolean[] = [
        false,
        false,
        false
    ]
    private tagsArr: string[] = ['', '', '']
    private visual: any = {
        shipping: false,
        shipping_checkbox: false,
        escrow: false,
        images: false
    }
    private data: GoodsInfo = {
        title: '',
        description: '',
        currency: '',
        price: '',
        saleCount: 1,
        escrow: '',
        expireTime: '',
        cat: [''],
        tags: '',
        img: ['', '', '', ''],
        ship: [
            {
                cost: '',
                method: ''
            },
            {
                cost: '',
                method: ''
            },
            {
                cost: '',
                method: ''
            },
        ]
    };
    ngOnInit() {
       this.getInfo()
    }

    getInfo() {
         this.route.params
            .map(params => params['id'])
            .subscribe((id: any) => {
                this.viewItemService.singleItem(id).subscribe(
                    (res: any) => {
//                        this.gs.(false);
                        if (res.result == 'ok') {
                            this.data = res.item;
                            this.data.ship.forEach(ship => {
                                ship.cost = this.gs.toEth(ship.cost)
                            })
                        }
                        else
                            this.notifications.showMessage('', 'ERROR.WHATEVER');
                    },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            });
    }
    private required: any = {
        name: false,
        description: false,
        price: false
    }


    constructor(
        private http: HttpService,
        private notifications: NotificationsService,
        private gs: GlobalService,
        private route: ActivatedRoute,
        private router: Router,
        private viewItemService: ViewItemsService
    ) {
    }

     change(name) {
        this.visual[name] = !this.visual[name];
    }


    submit() {
        this.combineTags();
        this.checkImages();
        this.checkShip();
        this.makeUpPrices();
        this.http.relistItem(this.data).subscribe(
            res => {
                if (res['result'] && res['result'] == 'ok') {
                    this.successfullyListed = true;
                    this.notifications.showMessage('COMMON.SUCCESS');
                } else {
                    this.notifications.showMessage(res['error'], 'ERROR.WHATEVER');
                }
            },
            err => {
                this.notifications.showMessage('', 'ERROR.WHATEVER');
            }
        )
    }

    cancel() {
        this.viewItemService.cancelItem(this.data['address']).subscribe(res => {
            this.router.navigateByUrl('/items/orders');
        })
    }

    inputChange(code, $event) {
        if ($event == '') {
            this.required[code] = true;
        } else if (!code.match(/^ship/)) {
            this.required[code] = false;
            if (code == 'price') {
                if (!this.isNumber(this.data[code])) {
                    this.price_num = true;
                } else this.price_num = false;
            }
        }
        if (code.match(/^ship/)) {
            let tmp = code.split('.');
            let index = tmp[1];
            let key = tmp[0];

            if (!this.isNumber(this.data[key][index]['cost'])) {
                this.ship_num[index] = true;
            } else this.ship_num[index] = false;
        }
    }
    checkHttp(input, required = false) {
        if (!required && input == '' || !input) return true;
        else {
            if (input.match(/^(http|https)\:\/\/([A-Za-z\.\_\-0-9\#]+?)\.([A-Za-z]{2,10})([\?\?=\/A-Za-z\#\.\_\-0-9]+?)+$/) ) return true;
            else return false;
        }
    }
    isNumber(v) {
        return v.match(/^[\d]*(\.[\d]+){0,1}$/);
    }
    decQuantity() {
        if (this.data.saleCount > 1) this.data.saleCount--;
    }
    incQuantity() {
        this.data.saleCount++;
    }
    selectChange($event) {
        this.data.cat = $event.target.value;
    }
    combineTags() {
        let addedTags: boolean = false;
        this.tagsArr.forEach(tag => {
            if (tag != '') {
                this.data.tags = this.data.tags + ", " + tag;
                addedTags = true;
            }
        })
        if (addedTags)
            this.data.tags.slice(0, -1);
    }
    checkImages() {
        this.data.img = this.data.img.filter(res => res != "");
    }
    checkShip() {
        this.data.ship.filter(ship => (ship.price != '' && ship.method != ''))
    }
    makeUpPrices() {
        this.data.price = this.gs.fromEth(this.data.price);
        this.data.ship.forEach(ship => {
            ship.cost = this.gs.fromEth(ship.cost);
        })
    }
}
