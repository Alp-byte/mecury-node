import { NewItemService } from './../new-item.service';
import { Router } from '@angular/router';
import { GlobalService } from './../../utils/global.service';
import { NotificationsService } from './../../utils/notifications.service';
import { HttpService } from './../../utils/http.service';
import { CropperSettings } from './../../utils/ng2-img-cropper/src/cropperSettings';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as $ from 'jquery';
import _ from 'lodash';
import * as bigInt from 'big-integer';
import { send } from "q";

export interface GoodsInfo {
    title?: string;
    description?: string;
    currency?: string;
    price?: any;
    saleCount?: any;
    escrow?: string;
    expireTime?: string;
    cat?: string[];
    tags: string[];
    img?: string[];
    ship?: any[];
    storename?: string;
}
@Component({
    selector: 'app-new-item',
    templateUrl: './new-item.component.html',
    styleUrls: ['./new-item.component.scss']
})
export class NewItemComponent implements OnDestroy {
    private button: boolean = false;
    private mainErrorMessage: boolean = false;
    private successfullyListed: boolean = false;
    private price_num: boolean = false;
    private price: number;
    private storedata;
    private duration: number = 1209600;
    private item_address: string = '';
    private agreement: boolean = false;
    private isShippingValid: boolean = true;
    private modal: boolean = false;
    private currentImage: number = 0;
    private cropImages: any[] = [{}, {}, {}, {}];
    private tagsArr: string[] = ['', '', '']
    private visual: any = {
        shipping: false,
        shipping_checkbox: false,
        escrow: false,
        images: false
    }

    goWizard() {
        this.router.navigateByUrl('newitem-wizard')
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
        tags: ['', '', ''],
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
        ],
        storename: '',
    };

    private required: any = {
        title: false,
        description: false,
        category: false,
        price: false,
        saleCount: false
    };
    image: any;
    cropperSettings: CropperSettings;
    private subscripition;
    constructor(
        private http: HttpService,
        private notifications: NotificationsService,
        private gs: GlobalService,
        private router: Router,
        private zone: NgZone,
        private newItemService: NewItemService
    ) {
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.width = 200;
        this.cropperSettings.height = 200;
        this.cropperSettings.canvasWidth = 300;
        this.cropperSettings.canvasHeight = 300;
        this.cropperSettings.keepAspect = false;
        this.cropperSettings.rounded = false;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
        this.cropperSettings.cropperDrawSettings.strokeWidth = 2;
        this.storedata = localStorage.getItem('storeinfo');
        if(this.storedata != 'undefined'){
          this.storedata = JSON.parse(this.storedata);
        }
    }

    submit() {
        let ipfsPreference = this.gs.ipfsPreference.value;
        if(!ipfsPreference){
          this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.newitem });
          this.subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {
              this.newItem();
            }
            this.subscripition.unsubscribe();
          })
        }
        else
          this.newItem();
    }

    newItem(){
      this.checkShip();
      this.makeUpPrices();
      if (!this.checkRequired()) return false;
      this.data.title = this.data.title.trim();
      this.data.description = this.data.description.trim();
      if(!this.storedata || this.storedata == 'undefined')
        this.data.storename = "";
      else
        this.data.storename = this.storedata.storename.trim();
      let sending = JSON.parse(JSON.stringify(this.data));
      sending['cat'] = [this.data.cat];

      sending.price = bigInt(this.gs.fromEth(sending.price));
      sending.ship.forEach(ship => {
        ship.cost = this.gs.fromEth(ship.cost);
      })
      sending['pubKey'] = this.gs.wallet['pubKey'];
      sending['pubkey'] = this.gs.wallet['pubKey'];
      sending.img = sending.img.filter(res => res != "");
      sending['price'] = sending.price.toString();
      sending['timespan'] = this.duration;

      this.newItemService.newItem(sending).subscribe(
        res => {
          if (res['result'] == 'ok') {
            this.notifications.showMessage('COMMON.SUCCESS');
          }
          else {
            this.notifications.showMessage('', 'ERROR.WHATEVER');
          }
        },
        err => {
          this.notifications.showMessage('', 'ERROR.WHATEVER');
        }
      )
      this.router.navigateByUrl('/buy/view-all');
    }

    ngOnDestroy() {
        if (this.subscripition)
            this.subscripition.unsubscribe();
    }

    change(name) {
        this.visual[name] = !this.visual[name];
    }

    showAgreement() {
        this.gs.confirmation.emit('prelisting')
    }

    inputChange(code, $event) {
        if (!this.checkRequired() || !this.checkHttp) {
            this.button = false;
        } else {
            this.button = true;
        }
        if (code == 'saleCount' && this.isIntegerNumber(this.data.saleCount)) {
            this.required[code] = true;
            return;
        }
        if ($event == '') {
            this.required[code] = true;
        } else if (!code.match(/^ship/)) {
            this.required[code] = false;
            if (code == 'price') {
                this.price = parseFloat(this.data.price);
                this.price_num = !this.isNumber(this.data[code]) && (parseInt(this.data.price, 10) > 0);
            }
        }
    }

    shipChange(i) {
        this.zone.run(() => {
            let ship = this.data.ship[i];
            ship.methodError = "";
            ship.costError = "";
            if ((!ship.method.length && !ship.cost.length) || (ship.method.length && ship.cost.length && this.isCharacter(ship.method) && this.isNumber(ship.cost))) {
                ship.isError = false;
                if (ship.methodError || ship.costError) {
                    ship.methodError = "";
                    ship.costError = "";
                }
            } else {
                ship.isError = true;
                if (!ship.method.length) ship.methodError = "COMMON.REQUIRED";
                if (!ship.cost.length) ship.costError = "COMMON.REQUIRED";
                if (ship.method.length && !this.isCharacter(ship.method)) ship.methodError = "ERROR.SHIPPING_CHARACTERS_REQUIRED"
                if (ship.cost.length && !this.isNumber(ship.cost)) ship.costError = "ERROR.SHIPPING_NUMBERS_REQUIRED"
            }

            if (ship.isError) {
                this.isShippingValid = false;
                return false;
            }
            else {
                this.isShippingValid = true;
                return true;
            }
        })
    }
    checkRequired() {
        if (
            (!this.data.title || this.data.title.trim() === '' ||
                (!this.data.description || this.data.description.trim() === '') ||
                (!this.data.cat || this.data.cat[0] == '')) ||
            !this.isNumber(this.data.price) || !this.isIntegerNumber(this.data.saleCount || (parseInt(this.data.price, 10) > 0))
        ) {
            this.mainErrorMessage = true;
            if ((!this.data.title || this.data.title == "")) this.required.title = true;
            if ((!this.data.description || this.data.description == "")) this.required.description = true;
            if ((!this.data.cat || this.data.cat[0] == "")) this.required.category = true;
            if (!this.isNumber(this.data.price)) this.required.price = true;
            if (!this.isIntegerNumber(this.data.saleCount)) this.required.saleCount = true;
            return false
        } else {
            this.mainErrorMessage = false;
            return true;
        }
    }
    isIntegerNumber(v: string) {
        if (typeof v == 'number') return true;
        else if (v)
            return v.match(/^[\d]+$/) && parseInt(v) > 0;
        else return false;
    }
    checkHttp(input, required = false) {
        if (!required && input == '') {
            return true;
        }
        else {

            if (input && input.match(/^(http|https)\:\/\/([A-Za-z\.\_\-0-9\#]+?)\.([A-Za-z]{2,10})([\?\?=\/A-Za-z\#\.\_\-0-9]+?)+$/) ) return true;
            else {
                this.mainErrorMessage = true;
                return false;
            }
        }
    }
    isNumber(v) {
        if (v)
            return v.match(/^[\d]*(\.[\d]+){0,1}$/);
        else return 0;
    }
    isCharacter(v) {
        if (v)
            return v.match(/^([^0-9]*)$/);
        else return 0;
    }
    decQuantity() {
        if (this.data.saleCount > 1) this.data.saleCount--;
    }
    incQuantity() {
        this.data.saleCount++;
    }
    selectChange($event) {
        this.data.cat = $event.target.value;
        this.inputChange('category', this.data.cat);
    }
    checkImages() {
        this.data.img = this.data.img.filter(res => res != "");
    }
    checkShip() {
        this.data.ship.filter(ship => (ship.price != '' && ship.method != ''))
    }
    makeUpPrices() {

    }

    conversion(i) {
        if (this.data.ship[i].cost.indexOf('.')) {
          let tmpArr = this.data.ship[i].cost.split('.');
          let decimals = tmpArr[1];
          if (decimals != undefined) {
            if (decimals.length > 4) decimals = decimals.substr(0, 4);
            this.data.ship[i].cost = tmpArr[0] + '.' + decimals;
            //this.inputChange('ship.' + i, tmpArr[0] + '.' + decimals);
          }
          else this.data.ship[i].cost = tmpArr[0];
          this.inputChange('ship.' + i, this.data.ship[i].cost);
        }
    }


    priceConversion() {
        if (this.data.price.indexOf('.') !== -1) {
            let tmpArr = this.data.price.split('.');
            let decimals = tmpArr[1];
            if (decimals.length > 4) decimals = decimals.substr(0, 4);
            this.data.price = tmpArr[0] + '.' + decimals;
            this.inputChange('price', tmpArr[0] + '.' + decimals);
        }
    }

    copyToClipboard(id) {
        this._copyToClipboard(id);
    }
    _copyToClipboard(id) {
        // creating new textarea element and giveing it id 't'
        let t: any = document.createElement('textarea')
        t.id = 't'
        // Optional step to make less noise in the page, if any!
        t.style.height = 0
        // You have to append it to your page somewhere, I chose <body>
        document.body.appendChild(t)
        // Copy whatever is in your div to our new textarea
        t.value = document.getElementById(id).innerText
        // Now copy whatever inside the textarea to clipboard
        let selector: any = document.querySelector('#t')
        selector.select()
        try {
            document.execCommand('copy')
            this.notifications.showMessage(t.value, "COMMON.COPY_MESSAGE");
        } catch (e) {
            this.notifications.showMessage("ERROR.WHATEVER");
        }
        // Remove the textarea
        document.body.removeChild(t)

    }

    openPic(i) {
        this.currentImage = i;
        this.modal = true;
        this.cropImages[i]['active'] = true;
    }

    closePic($event, i = -1) {
        if (i == -1) {
            this.cropImages.forEach((item, index) => {
                item['active'] = false;
            })
        } else
            this.cropImages[i]['active'] = false;
        this.modal = false;
    }

    removePic(i) {
        this.zone.run(() => {
            this.data.img[i] = '';
            this.cropImages[i] = {};
        })
    }

    sendImage($event, i) {
        $event.preventDefault();
//        this.gs.(true);
        if (this.cropImages[i].image)
            this.http.imgurImage(this.cropImages[i].image).subscribe(res => {
                this.closePic(false);
                if (res.data && res.data.link) {
                    // this.realCheckHttp(this.data.img);
                    this.data.img[i] = res.data.link;
//                    this.gs.(false);
                } else {
                    // this.realCheckHttp(this.data.img);
                    this.notifications.showMessage("ERROR.WHATEVER")
//                    this.gs.(false);
                }

            }, err => {
                // this.realCheckHttp(this.data.img);
                this.closePic(false);
//                this.gs.(false);
                this.notifications.showMessage("ERROR.WHATEVER")
                return false;
            })
        else {
            // this.realCheckHttp(this.data.img);
//            this.gs.(false);
            this.notifications.showMessage("ERROR.WHATEVER")
            return false;
        }
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';
    crop = { image: "" };
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(image: string) {
        this.crop.image = image;
    }
    imageLoaded() {
        // show cropper
    }
    loadImageFailed() {
        // show message
    }

    public setAddress(data: any) {
        //TODO: include retrieved data into the item listing

    }
}
