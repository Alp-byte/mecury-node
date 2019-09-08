import { Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './../../utils/notifications.service';
import { HttpService } from './../../utils/http.service';
import { GlobalService, CATEGORIES } from './../../utils/global.service';
import { CropperSettings } from './../../utils/ng2-img-cropper/src/cropperSettings';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { ModalService } from "../../common/modal.service";
import { CountryModalComponent } from "../../common/country-modal/country-modal.component";
import _ from 'lodash';
import * as eth from 'ethereum-address';
import * as bigInt from 'big-integer';
interface Step {
    name?: string,
    desc?: string,
    valid?: boolean;
    required: boolean;
}
import * as $ from 'jquery';
import { GoodsInfo } from '../new-item/new-item.component';
import { NewItemService } from '../new-item.service';

@Component({
    selector: 'app-new-item-wizard',
    templateUrl: './new-item-wizard.component.html',
    styleUrls: ['./new-item-wizard.component.scss']
})
export class NewItemWizardComponent implements CanDeactivate<Observable<any>>, OnInit, OnDestroy {
    private stepback: boolean = false;
    private stephide: boolean = false;
    private modal: boolean = false;
    private storedata;
    private noanimation: boolean = true;
    private currentImage: number = 0;
    private cropImages: any[] = [{}, {}, {}, {}];
    private duration: number = 1209600;
    private shipError: number = -1;
    private price: number;
    private successfullyListed: boolean = false;
    private item_address: string;
    private agreement: boolean = false;
    private invalidValue = {};
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
    private step: number = 0;
    private categories: Array<string> = [];
    private categoriesMapping: Array<{ name: string, translate: string }> = [];
    private steps: Array<Step> = [
        {
            required: true
        }, {
            required: true
        }, {
            required: false,
            valid: true
        }, {
            required: true,
        }, {
            required: false,
            valid: true
        }, {
            required: false,
            valid: true
        }, {
            required: true
        }


    ];
    private subscripition;
    private country;

    cropperSettings: CropperSettings;
    constructor(
        private globalService: GlobalService,
        private http: HttpService,
        private notifications: NotificationsService,
        private router: Router,
        private zone: NgZone,
        private translate: TranslateService,
        private _http: Http,
        private modalService: ModalService,
        private newItemService: NewItemService
    ) {
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.width = 200;
        this.cropperSettings.height = 200;
        this.cropperSettings.canvasWidth = 300;
        this.cropperSettings.canvasHeight = 300;
        this.cropperSettings.rounded = false;
        this.cropperSettings.keepAspect = false;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
        this.cropperSettings.cropperDrawSettings.strokeWidth = 2;

        this.storedata = localStorage.getItem('storeinfo');
        if(this.storedata != 'undefined'){
          this.storedata = JSON.parse(this.storedata);
        }

        CATEGORIES.forEach((cat, index) => {
            translate.get('CATEGORIES.' + cat).subscribe((res: string) => {
                this.categories.push(res);
                this.categoriesMapping.push({
                    name: cat,
                    translate: res
                })
            });
        })

      this.http.getSettings('country').subscribe((settingsRes: any) => {
        if(settingsRes.value) this.country = settingsRes.value;
        if(!this.country) this.modalService.openModalWithComponent(CountryModalComponent);
      })
    }

    checkAddress(name, address) {
      if(address && address.length) {
        this.invalidValue[name] = !eth.isAddress(address);
        return eth.isAddress(address);
      }
      else {
        this.invalidValue[name] = false;
        return true;
      }
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        this.globalService.confirmation.emit('pop');
        return new Observable<boolean>(observer => {
            this.globalService.confirmation.subscribe(confirm => {
                if (confirm == 'yes') {
                    this.globalService.triggerMenu.emit(true);
                    observer.next(true);
                }
                else observer.error(false);
            })
        })
    }

    ngOnInit() {
        this.globalService.triggerMenu.emit(false);
        setTimeout(() => this.noanimation = false, 200);
    }

    keyup($event) {
        if ($event.key == 'Tab' || $event.key == 'Enter') {
            this.nextStep();
        }
    }

    showAgreement() {
        this.globalService.confirmation.emit('prelisting')
    }

    ngOnDestroy() {
        this.globalService.triggerMenu.emit(true);
    }

    private switchPro() {
        this.router.navigateByUrl('/newitem');
    }

    isNumber(v) {
        if (v)
            return v.match(/^[\d]*(\.[\d]+){0,1}$/);
        else return false;
    }

    isCharacter(v) {
      if(v)
        return v.match(/^([^0-9]*)$/);
      else return 0;
    }

    isIntegerNumber(v:string) {
        if(typeof v == 'number') return true;
        else if (v)
            return v.match(/^[\d]+$/) && parseInt(v) > 0;
        else return false;
    }

    decQuantity() {
        if (this.data.saleCount > 1) this.data.saleCount--;
        this.inputChange()
    }
    incQuantity() {
        this.data.saleCount++;
        this.inputChange()
    }
    private checkHttp(input, required = false): boolean {
        if (input == '') {
            return false;
        }
        else {
            if (input && input.match(/^(http|https)\:\/\/([A-Za-z\.\_\-0-9\#]+?)\.([A-Za-z]{2,10})([\?\?=\/A-Za-z\#\.\_\-0-9]+?)+$/) ) return true;
            else {
                return false;
            }
        }
    }

    private stepValid(step): boolean {

        let result: boolean = false;

        switch (step) {
            case 0:
                result = this.data.title.trim() !== '';
                break;
            case 1:
                result = this.data.description.trim() !== '';
                break;
            case 2:
                // this.realCheckHttp(this.data.img)
                result = true;
                break;
            case 3:
                if (this.data.cat[0])
                    result = this.data.cat[0].length > 0;
                else result = false;
                break;
            case 4:
                result = true;
                break;
            case 5:
                result = this.checkShip();
                break;
            case 6:
                this.price = parseFloat(this.data.price);
                result = (this.isNumber(this.data.price) && this.isIntegerNumber(this.data.saleCount));
                break;
        }
        return result;
    }

    arbitrationChange($event) {

        if ($event && $event.length>0 && eth.isAddress($event)) {

            this.steps[this.step].valid = true
        } else if (!$event.length) this.steps[this.step].valid = true;
        else {
            this.steps[this.step].valid = false;
        }
    }


    conversion(i) {
        if(this.data.ship[i].cost.indexOf('.')) {
            let tmpArr = this.data.ship[i].cost.split('.');
            let decimals = tmpArr[1];
            if(decimals != undefined){
              if(decimals.length > 4){
                decimals = decimals.substr(0, 4);
                this.data.ship[i].cost = tmpArr[0] + '.' + decimals;
              }
            }
            else this.data.ship[i].cost = tmpArr[0];
            // this.inputChange();
        }
    }

    priceConversion() {
        if(this.data.price.indexOf('.')) {
            let tmpArr = this.data.price.split('.');
            let decimals = tmpArr[1];
            if(decimals != undefined){
              if(decimals.length > 4){
                decimals = decimals.substr(0, 4);
                this.data.price = tmpArr[0] + '.' + decimals;
              }
            }
            else this.data.price = tmpArr[0];
            this.inputChange();
        }
    }

    inputChange(timeout = 0) {
        this.zone.run(() => {
            setTimeout(() => {
                this.steps[this.step].valid = this.stepValid(this.step);
            }, timeout);
        })
    }

    checkShip() {
        let result = true;
        if(!this.shipChange(0) || !this.shipChange(1) || !this.shipChange(2)) result = false;
        return result;
    }

    shipChange(i) {
      this.zone.run(() => {
        let ship = this.data.ship[i];
        if ((!ship.method.length && !ship.cost.length) || (ship.method.length && ship.cost.length && this.isCharacter(ship.method) && this.isNumber(ship.cost))) {
          this.shipError = -1;
          ship.isError = false;
        } else {
          this.shipError = i;
          ship.isError = true;
        }
        // this.steps[this.step].valid = !ship.isError;
        let hasErrors = false;
        this.data.ship.forEach(ship_ => {
            if(ship_.isError) hasErrors = true;
        })
        this.steps[this.step].valid = !hasErrors;
        return !ship.isError;
      })
    }

    nextStep() {
        this.stepback = false;
        if (this.steps[this.step].valid) {
            if (this.steps.length - 1 == this.step) {
                this.submit();
            } else {
                this.step++
            }
        }

    }

    prevStep() {

        this.stepback = true;
        this.step--;

    }

    submit() {
      let ipfsPreference = this.globalService.ipfsPreference.value;
      if(!ipfsPreference){
        this.globalService.confirmation.emit({type: 'pop', gas: this.globalService.gasPrices.newitem});
        this.subscripition = this.globalService.confirmation.subscribe(answer => {
          if (answer == 'yes') {
            this.newItemWizard();
          }
          this.subscripition.unsubscribe();
        });
      }
      else
        this.newItemWizard();
    }

    newItemWizard(){
      this.data.img = this.globalService.trimArray(this.data.img);
      this.data.tags = this.globalService.trimArray(this.data.tags);
      this.data.title = this.data.title.trim();
      this.data.description = this.data.description.trim();
      if(!this.storedata || this.storedata == 'undefined')
        this.data.storename = "";
      else
        this.data.storename = this.storedata.storename.trim();
      let sending = JSON.parse(JSON.stringify(this.data));
      sending.timespan = this.duration;
      sending.price = bigInt(this.globalService.fromEth(sending.price));
      sending.ship.forEach(ship => {
        ship.cost = this.globalService.fromEth(ship.cost);
      });
      sending['pubKey'] = this.globalService.wallet['pubKey'];
      sending['pubkey'] = this.globalService.wallet['pubKey'];
      sending.img = sending.img.filter(res => res != "");
      sending['price'] = sending.price.toString();
      sending['timespan'] = this.duration;
      this.categoriesMapping.forEach(cat => {
        if (cat.translate == this.data.cat[0]) {
          sending['cat'] = [cat.name];
        }
      });
      this.globalService.triggerMenu.emit(true);
      this.router.navigateByUrl('buy/view-all');
      this.newItemService.newItem(sending).subscribe(
        res => {
          this.globalService.triggerMenu.emit(true);
          if (res['result'] && res['result'] == 'ok') {
            this.notifications.showMessage('COMMON.SUCCESS');
            //                this.globalService.big(false);
            this.successfullyListed = true;
            this.item_address = res['hash'];
          } else {
            this.globalService.triggerMenu.emit(true);
            this.notifications.showMessage('', 'ERROR.WHATEVER');
          }
        },
        err => {
          this.globalService.triggerMenu.emit(true);
          this.notifications.showMessage('', 'ERROR.WHATEVER');
        }
      )
    }

    switchToPro() {
        this.router.navigateByUrl('/newitem');
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
//        this.globalService.(true);
        if (this.cropImages[i].image)
            this.http.imgurImage(this.cropImages[i].image).subscribe(res => {
                this.closePic(false);
                if (res.data && res.data.link) {
                    this.data.img[i] = res.data.link;
//                    this.globalService.(false);
                } else {
                    this.notifications.showMessage("ERROR.WHATEVER")
//                    this.globalService.(false);
                }

            }, err => {
                this.closePic(false);
//                this.globalService.(false);
                this.notifications.showMessage("ERROR.WHATEVER")
                return false;
            })
        else {
//            this.globalService.(false);
            this.notifications.showMessage("ERROR.WHATEVER")
            return false;
        }
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';
    crop = {image: ""};
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
}
