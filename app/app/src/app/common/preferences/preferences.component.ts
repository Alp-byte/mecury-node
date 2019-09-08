import { GasService } from './../gas.service';
import { NotificationsService } from './../../utils/notifications.service';
import { StylesheetService } from './../../utils/stylesheet.service';
import { TourService, IStepOption } from 'ngx-tour-ngx-bootstrap';
import { Router } from '@angular/router';
import { SocketService } from './../../utils/socket.service';
import { HttpService } from './../../utils/http.service';
import { GlobalService } from './../../utils/global.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { ViewItemsService } from '../../view-items/view-items.service';

export interface StoreInfo {
    storename?: string;
}

@Component({
    selector: 'app-preferences',
    templateUrl: './preferences.component.html',
    styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
    private privacyLevel: string = 'regular';
    private passwordPref: string = 'on';
    private defaultBlacklist: string = 'on';
    private statistics: boolean = true;
    private _reporting: string = 'on';
    public _ipfs: string = 'on';
    private country: string;
    private countryList;
    public themes = [];
    private visual: any = {
        blacklist: false,
        address: false,
        privacy: false,
        theme: false,
        statistics: false,
        reportingCountry: false,
        reporting: false,
        ipfs: false,
        gas: false,
        storefront: false,
    };

    private storeinfo;
    private storedata;

    private data: StoreInfo = {
        storename: '',
    };

    public currentGas;
    public currentGasType;

    public safelowGasAPI: any;
    public safelowGasHTTP: any;
    public gas: number;
    public gasOption: string;
    public addresses: string[] = [];
    constructor(
        private globalService: GlobalService,
        private http: HttpService,
        private socket: SocketService,
        private router: Router,
        private tourService: TourService,
        private stylesheetService: StylesheetService,
        private notification: NotificationsService,
        private gasService: GasService,
        private viewItemService: ViewItemsService,
        private ref: ChangeDetectorRef
    ) {

        this.getCountrySetting()
            .then(() => {
                this.getIPFSSetting().then(() => {
                    this.getAddressesSetting()
                })
            })
    }

    ngOnInit() {
        this.http.getCountryList().subscribe(data => {
            this.countryList = data;
            this.countryList.unshift({ name: 'select', code: 'select' });
        });

        this._reporting = this.globalService.reporting;
        let themes = localStorage.getItem('themes');

        this.storedata = localStorage.getItem('storeinfo');
        if (this.storedata != "undefined") {
            this.storedata = JSON.parse(this.storedata);
        }

        this.safelowGasHTTP = this.gasService.gasHTTP.value;
        this.safelowGasAPI = this.gasService.gasAPI.value;
        this.gas = this.gasService.gasManual.value;

        this.currentGasType = localStorage.getItem('gasOption');
        this.currentGas = parseFloat(localStorage.getItem('gas'));

        this.gas = parseFloat(localStorage.getItem('gas'));


        this.gasService.gasHTTP.subscribe(gasHTTP => {
            this.currentGasType = localStorage.getItem('gasOption');
            if (this.currentGasType == 'http')
                this.currentGas = gasHTTP;
            this.safelowGasHTTP = gasHTTP;
        })

        this.gasService.gasAPI.subscribe(gasAPI => {
            this.currentGasType = localStorage.getItem('gasOption');
            if (this.currentGasType == 'api')
                this.currentGas = gasAPI;
            this.safelowGasAPI = gasAPI;
        })

        if (themes && themes.length) this.themes = JSON.parse(themes);
    }

    getIPFSSetting() {
        return new Promise((resolve) => {
            this.http.getSettings('ipfs').subscribe((settingsRes: any) => {
                if (settingsRes.value) this._ipfs = settingsRes.value
                let val;
                if (this._ipfs == 'on') val = true;
                else val = false;
                this.globalService.ipfsPreference.next(val);
                resolve(true);
            })
        })
    }

    getCountrySetting() {
        return new Promise((resolve) => {
            this.http.getSettings('country').subscribe((settingsRes: any) => {
                if (settingsRes.value) this.country = settingsRes.value
                resolve(true)
            })
        })
    }

    getAddressesSetting() {
        this.http.getSettings('addresses').subscribe(res => {
            if (!res['value']) this.addresses = [];
            try {
                this.addresses = JSON.parse(res['value']);
            } catch (e) {
                this.addresses = [];
            }


        })
    }
    chooseCountry(country) {
        if (country.target.value !== 'select') {
            this.http.saveSettings([{ key: 'country', value: country.target.value }]).subscribe();
        } else {
            this.http.saveSettings([{ key: 'country' }]).subscribe();
        }
    }


    isActive(lang) {
        return (lang == this.globalService.lang);
    }
    isActiveTheme(theme) {
        return (theme == this.globalService.theme);
    }
    selectLanguage(lang) {
        this.globalService.setLanguage(lang);
    }

    isActiveReporting(trigger) {
        return (this._reporting == trigger)
    }
    reporting(trigger) {
        this._reporting = trigger;
        this.globalService.setReporting(trigger);
    }

    ipfs(trigger) {
        this._ipfs = trigger;
        this.http.saveSettings([{ key: 'ipfs', value: trigger }]).subscribe();

        if (trigger == 'on') trigger = true;
        else trigger = false;
        this.ref.detectChanges();
        this.globalService.ipfsPreference.next(trigger);
    }

    public openFile(fileupload) {
        let input = fileupload.target; // Remove: .target;

        for (var index = 0; index < input.files.length; index++) {
            let reader = new FileReader();
            reader.onload = () => {
                var text = reader.result;
                this.stylesheetService.create();
                let theme = this.stylesheetService.eatXML(text);
                this.addTheme(theme);
            }
            reader.readAsText(input.files[index]);

        };
    }

    private addTheme(theme) {
        let found;
        this.themes.forEach((_theme, i) => {
            if (_theme.name == theme.name) found = i;
        })
        if (!found)
            this.themes.push(theme);
        else this.themes[found] = theme;
        localStorage.setItem('themes', JSON.stringify(this.themes));
        this.applyTheme(theme, this.themes.length - 1);
    }

    removeExistingUserTheme() {
        let elem = document.querySelector('#dynamic-style');
        if (elem)
            elem.parentNode.removeChild(elem);
    }

    applyTheme(theme, i) {
        this.removeExistingUserTheme();
        this.stylesheetService.create();
        this.stylesheetService.apply(theme.value);
        localStorage.setItem('theme', 'custom-' + i)
    }

    removeTheme(i) {
        this.themes.splice(i, 1);
        localStorage.setItem('themes', JSON.stringify(this.themes));
    }

    selectTheme(theme) {
        this.removeExistingUserTheme();
        this.globalService.setTheme(theme);
    }
    change(buttonName, value) {
        this[buttonName] = value;
        this.http.saveSettings([{ key: buttonName, value: value }]).subscribe();
    }
    triggerStatistics(value) {
        this.statistics = value;
        this.http.saveSettings([{ key: 'statistics', value: value }]).subscribe();
    }

    clearCache() {
        this.globalService.confirmation.emit('logout');
        this.globalService.confirmation.subscribe(res => {
            if (res == 'yes') {
                this.clearTransaction();
            }
        })
    }

    clearTransaction() {
        // TODO: why is this storeFront method in the transaction? it is not being called from anywhere. please move elsewhere
        this.http.clearStoreFront().subscribe(() => {
            console.log('StoreFront removed successfully');
            localStorage.clear();
            this.socket.disconnect();
            this.http.postLogout()
                .subscribe(res => {
                    this.http.logout();
                    this.router.navigateByUrl('/login');
                    this.globalService.authorized = false;
                },
                    err => {

                    })
        })
    }

    clearSettings() {
      this.globalService.confirmation.emit('pop');
      let subscripition = this.globalService.confirmation.subscribe(res => {
        if (res == 'yes') {
          this.http.resetSettings().subscribe(() => {
            subscripition.unsubscribe();
            this._ipfs = 'on';
            this.globalService.ipfsPreference.next(true);
            this.country = '';
            this.addresses = [];
            this.notification.showMessage('COMMON.SUCCESS');
            this.ref.detectChanges();
          });
        }
      })
    }

    callUpdater() {
        this.http.updater().subscribe(res => {
        })
    }

    resetTour() {
        localStorage.removeItem('tour_given');
        this.tourService.initialize([{
            anchorId: 'search',
            content: 'TOUR.SEARCH',
            placement: 'bottom'
        }, {
            anchorId: 'balance',
            content: 'TOUR.BALANCE',
            placement: 'bottom'
        },
        {
            anchorId: 'transactions',
            content: 'TOUR.TRANSACTION',
            placement: 'bottom',
            route: '/transactions'
        },
        {
            anchorId: 'viewall',
            content: 'TOUR.VIEWALL',
            placement: 'bottom',
            route: '/buy/view-all'
        },
        {
            anchorId: 'myitems',
            content: 'TOUR.MYITEMS',
            placement: 'bottom',
            route: '/newitem'
        },
        {
            anchorId: 'active',
            content: 'TOUR.ACTIVE',
            placement: 'bottom',
            route: '/items/active'
        },
        {
            anchorId: 'preferences',
            content: 'TOUR.PREFERENCES',
            placement: 'bottom',
            route: '/preferences'

        }, {
            anchorId: 'home',
            content: 'TOUR.BETA',
            placement: 'right',
            route: '/home'
        }]);
        this.tourService.stepShow$.subscribe((step: IStepOption) => {
            if (step.anchorId == 'transactions') {
                window.scrollTo(0, 0);
            }
        });
        this.tourService.end$.subscribe(() => {
            window.scrollTo(0, 0);
            this.router.navigateByUrl('home')


        })
        this.tourService.start()
        localStorage.setItem('tour_given', 'YES');
    }

    openFileUpload() {
        document.getElementById('theme-upload').click();
    }

    setGasOption(option) {
        if (option == 'manual') {
            this.gasService.setGasManual(this.gas);
            this.currentGas = this.gas;
        }
        this.gasService.setGasOption(option);
        this.currentGasType = option;
    }

    addmarket() {
        this.data.storename = this.data.storename.trim();
        let sending = JSON.parse(JSON.stringify(this.data));
        this.visual.storefront = false;
        this.http.newMarketAddress(sending).subscribe(
            res => {
                if (res['result'] == 'ok') {
                    localStorage.setItem('storeinfo', JSON.stringify(sending));
                    this.storedata = JSON.parse(JSON.stringify(sending));
                    this.data.storename = '';
                    this.notification.showMessage('COMMON.SUCCESS');
                }
                else {
                    this.notification.showMessage('', 'ERROR.WHATEVER');
                }
            })
    }

}
