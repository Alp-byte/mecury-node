import { NotificationsService } from './notifications.service';
import { reviewURL } from './../reviews/write-review/write-review.component';
import { SocketService } from './socket.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, Injectable, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { GlobalService, CATEGORIES } from './global.service';
import { UUID } from 'angular2-uuid';
import { Md5 } from 'ts-md5/dist/md5';
import { environment } from '../../environments/environment';
import { ViewItemsService } from '../view-items/view-items.service';

const TIMESTAMP = 1520508133; //filtering out old items
const rssToJsonServiceBaseUrl: string = 'https://rss2json.com/api.json?rss_url=';

export interface Category {
    goods: number;
    code: string;
}

export const API = 'http://localhost:1337/api';
const ETHER_SCAN_API = 'https://api.etherscan.io/api';
const API_KEY = environment.API_KEY;
const COUNTRY_API = "http://api.population.io:80/1.0/countries";
const CHANGENOW_APIKEY = '24cec12d3df08fe8ec2fe16fd281bae33d252ad373b351346053e96037365044';


const ANNOUNCE = {
    title: "BitBoost Marketplace is public now!",
    description: "Thank you for choosing BitBoost Marketplace! Read more about crucial points of the application usage, available features and upcoming updates. We are happy to have you here!",
    link: "home"
}

declare var ipc: any;
@Injectable()

export class HttpService implements OnInit {
    public isElectron: boolean = true;
    public ipcRenderer = ipc;
    private categories: Array<string> = [];
    private categoriesMapping: Array<{ name: string, translate: string }> = [];

    public publicCategories: Category[] = [];

    public actionInProgress: boolean = false;

    constructor(
        private http: Http,
        private globalService: GlobalService,
        private translate: TranslateService,
        private socket: SocketService,
        private notification: NotificationsService,
        private viewItemService: ViewItemsService

    ) {

    }

    call(callName, args = {}) {
        args['requestType'] = callName;
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, res) => {
                    let parsedRes = { result: 'error' };
                    try {
                        parsedRes = JSON.parse(res);
                    } catch (e) {
                        console.error('Call returned unparsable JSON ' + callName, res);
                    }

                    observer.next(parsedRes);
                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }



    ngOnInit() {
        this.ipcRenderer.once('updater', (event, arg) => {
        })
    }

    ipfsDaemonActive() {


        let callName = 'ipfsIsDaemonActive';
        let args = { "requestType": callName };
        return new Observable((observer) => {

            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {

                    let res1 = JSON.parse(arg);

                    observer.next(res1);
                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    postLogin(password, code, _2fa = false, cheat = false) {
        let callName = 'useWallet';

        let args = { "requestType": callName, "index": this.globalService.defaultIndex, "password": password, "code": code, cheat: cheat };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res1 = JSON.parse(arg);

                    observer.next(res1);
                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });

    }

    getRatingByAddress(address) {
        return this.http.get(reviewURL + '/rating/' + address).map(res => res.json());
    }

    createWallet(password) {

        let callName = 'createWallet';
        let args = { "requestType": callName, "index": this.globalService.defaultIndex, "password": password };
        return new Observable((observer) => {

            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {

                    let res1 = JSON.parse(arg);

                    observer.next(res1);
                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    checkWallet() {
        let callName = 'checkWallet';
        let args = { "requestType": callName };
        return new Observable((observer) => {

            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res1 = JSON.parse(arg);
                    observer.next(res1);
                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    public getAnnounce() {
        return new Observable(observer => {
            observer.next(ANNOUNCE);
        })
    }

    postLogout() {
        return new Observable((observer) => {
            observer.next(true);
        });
    }

    setGas(gas) {

        let callName = 'setGas';
        gas = gas * Math.pow(10, 9);
        let args = { "requestType": callName, "gas": gas };


        console.log('setgas called', args);

        return new Observable((observer) => {

            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);

                    observer.next();

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next();
                })
            }

        });
    }

    gettingGasFromAPI = true;

    getSafelowGasAPI() {
        let callName = 'gasPriceEstimateWithBlocks';
        let args = { "requestType": callName };



        return new Observable((observer) => {

            this.ipcRenderer.once(callName, (event, arg) => {
                let res = JSON.parse(arg);

                observer.next(res);

            })
            let gasInterval = setInterval(() => {
                if (!this.gettingGasFromAPI) {
                    this.gettingGasFromAPI = true;
                    if (this.isElectron) {
                        this.ipcRenderer.send('api', args)
                        this.ipcRenderer.once(callName, (event, arg) => {
                            let res = JSON.parse(arg);
                            this.gettingGasFromAPI = false;
                            observer.next(res);

                        })
                    } else {
                        this.http.post(API, args).map(res => res.json()).subscribe(res => {
                            this.gettingGasFromAPI = false;
                            observer.next(res);
                        })
                    }
                } else observer.next({ result: "error", error: "Previous request is still pending!" })
            }, 60000)

        });
    }

    getSafelowGasHTTP() {
        return new Observable(observer => {
            this.http.get('https://ethgasstation.info/json/ethgasAPI.json').map((res: any) => res.json()).subscribe(res => {
                observer.next(res);
            });
            let gasInterval = setInterval(() => {
                let sub = this.http.get('https://ethgasstation.info/json/ethgasAPI.json').map((res: any) => res.json()).subscribe(res => {
                    observer.next(res);
                }, err => {
                    console.log('err getting gas HTTP', err);
                })
            }, 30000);
        })
    }

    saveSettings(settings) {
        let callName = 'saveSettings';
        let args = { "requestType": callName, "settings": settings };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    updater() {
        let callName = 'updater';
        let args = { "requestType": callName };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    getSettings(key) {
        let callName = 'getSettings';
        let args = { "requestType": callName, "key": key };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    resetSettings() {
        let callName = 'resetSettings';
        let args = { "requestType": callName };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    observer.next(true);
                });
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    getNewsList() {

        let url = "https://www.bitboost.net/blog/feed/atom";
        return new Observable((observer) => {

            this.http.get(rssToJsonServiceBaseUrl + url)
                .map(res => res.json()).subscribe(res => {
                    observer.next(res.items)
                })
        })

    }

    sendReport(err) {

        let args = { error: err };
        if (this.globalService.reporting == 'on')
            args['isAllowed'] = true;
        else args['isAllowed'] = false;
        if (this.isElectron)
            this.ipcRenderer.send('handleError', args)
        else {
            this.http.post(API, args).map(res => res.json()).subscribe(res => {
            })
        }

    }

    viewAllMyOrders(loader = true) {


        let callName = 'allListings';
        let args = { "requestType": callName };
        return new Observable((observer) => {
            this.ipcRenderer.send('api', args)
            this.ipcRenderer.once(callName, (event, arg) => {
                let res = JSON.parse(arg);
                if (res['error']) observer.error(res['error']['code']);

                let items = [];
                let now = Date.now() / 1000;
                res['items'].forEach((item, i) => {

                    if (item.timestamp > TIMESTAMP) {
                        if (!item.priceEth) item.priceEth = this.globalService.toEth(item.price);
                        let itemCat = item['cat'][0];
                        let catFound: boolean = false;

                        items.push(item);
                    }
                    if (i == res['items'].length - 1) {
                        items = items.sort((a: any, b: any) => {
                            return this.globalService.sortBackwards(a, b, 'timestamp');
                        });

                        res['items'] = items;
                        observer.next(res);
                    }
                })

            })
        });
    }

    openChangelly(address) {
        this.ipcRenderer.send('changelly', { address: address });
    }

    viewAllMyActive(loader = true) {
        let res = { result: 'ok', items: [] };
        return new Observable((observer) => {
            this.getMyItems(loader)
                .then(myIems => {
                    res.items.push(...myIems.items);
                    return this.getMyIPFSItems(loader)
                        .then(IPFSMyItems => {
                            res.items.push(...IPFSMyItems.items);
                        })
                        .then(() => {
                            this.myActiveInner(res, observer, loader)
                        })
                });
        })
    }

    getMyItems(loader): Promise<{ result: string, items: any }> {

        let callName = 'allListings';
        let args = { "requestType": callName };
        return new Promise((resolve, reject) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    return resolve(res)


                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    return resolve(res)
                })
            }
        });
    }

    getMyIPFSItems(loader): Promise<{ result: string, items: any }> {

        let callName = 'ipfsStorageGetAll';
        let args = { "requestType": callName };
        return new Promise((resolve, reject) => {
            let ipfsPreference = this.globalService.ipfsPreference.value;
            if (this.isElectron) {
                if (ipfsPreference) {
                    this.ipcRenderer.send('api', args)
                    this.ipcRenderer.once(callName, (event, arg) => {
                        let res = JSON.parse(arg);
                        return resolve(res)
                    })
                }
                else {
                    return resolve({ result: 'ok', items: [] })
                }
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    return resolve(res)
                })
            }
        });
    }

    myActiveInner(res, observer, loader) {

        let items = [];
        let now = Date.now() / 1000;
        if (res['error']) observer.error(res['error']['code']);

        res['items'].forEach((item, i) => {

            if (item.timestamp > TIMESTAMP) {
                if (!item.priceEth) item.priceEth = this.globalService.toEth(item.price);
                if (item.pendingCount >= item.availableCount)
                    item.pending = true;
                if (item.endTimestamp > now && item.availableCount > 0) {
                    if (item.sender.toLowerCase() == this.globalService.wallet['address'].toLowerCase()) //TYPE OF CALL
                    {
                        let itemCat = item['cat'][0];
                        let catFound: boolean = false;

                        items.push(item);
                    }
                }
            }
            if (i == res['items'].length - 1) {

                items = items.sort((a: any, b: any) => {
                    return this.globalService.sortBackwards(a, b, 'timestamp');
                });

                res['items'] = items;
                observer.next(res);
            }
        })
    }

    /*viewAllMyExpired(loader = true) {

        let callName = 'allListings';
        let args = { "requestType": callName };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    this.myExpiredInner(res, observer, loader);
                    // observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    this.myExpiredInner(res, observer, loader);
                    // observer.next(res)
                })
            }
        });
    }*/

    viewAllMyExpired(loader: boolean = true) {
        let res = { result: 'ok', items: [] };
        return new Observable((observer) => {
            this.getMyItems(loader)
                .then(myIems => {
                    res.items.push(...myIems.items);
                    return this.getMyIPFSItems(loader)
                        .then(IPFSMyItems => {
                            res.items.push(...IPFSMyItems.items);
                        })
                        .then(() => {
                            this.myExpiredInner(res, observer, loader)
                        })
                });
        })
    }

    myExpiredInner(res, observer, loader) {


        let items = [];
        let now = Date.now() / 1000;
        if (res['error']) observer.error(res['error']['code']);

        res['items'].forEach((item, i) => {


            if (item.timestamp > TIMESTAMP) {
                if (!item.priceEth) item.priceEth = this.globalService.toEth(item.price);
                if (item.pendingCount >= item.availableCount)
                    item.pending = true;
                if (item.endTimestamp <= now && item.availableCount > 0)
                    if (item.sender == this.globalService.wallet['address']) //TYPE OF CALL
                    {
                        let itemCat = item['cat'][0];
                        let catFound: boolean = false;

                        items.push(item);
                    }
            }
            if (i == res['items'].length - 1) {

                items = items.sort((a: any, b: any) => {
                    return this.globalService.sortBackwards(a, b, 'timestamp');
                });

                res['items'] = items;
                this.notification.syncSimple('expired', res['items']);
                observer.next(res);
            }
        })

    }

    viewAllMySold(loader = true) {


        let callName = 'allListings';
        let args = { "requestType": callName };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    this.mySoldInner(res, observer, loader);
                    // observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    this.mySoldInner(res, observer, loader);
                    // observer.next(res)
                })
            }
        });
    }



    mySoldInner(res, observer, loader) {


        let items = [];
        let now = Date.now() / 1000;
        if (res['error']) observer.error(res['error']['code']);

        res['items'].forEach((item, i) => {


            if (item.timestamp > TIMESTAMP) {
                if (!item.priceEth) item.priceEth = this.globalService.toEth(item.price);
                if (item.pendingCount >= item.availableCount)
                    item.pending = true;
                if (item.availableCount <= 0)
                    if (item.sender == this.globalService.wallet['address']) //TYPE OF CALL
                    {
                        let itemCat = item['cat'][0];
                        let catFound: boolean = false;

                        items.push(item);
                    }
            }
            if (i == res['items'].length - 1) {

                items = items.sort((a: any, b: any) => {
                    return this.globalService.sortBackwards(a, b, 'timestamp');
                });

                res['items'] = items;
                this.notification.syncSimple('sold', res['items']);
                observer.next(res);
            }
        })
    }


    getBalance(address) {

        let callName = 'getBalance';
        let args = { "requestType": callName, "address": address };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });

    }

    // WALLET BBT

    getBalanceBBT(address) {
        let callName = 'getBalanceBBT';
        let args = { "requestType": callName, "address": address };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    getDecimalsBBT() {
        let callName = 'getDecimalsBBT';
        let args = { "requestType": callName };
        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });
    }

    sendMoneyBBT(address, amount) {

        let callName = 'sendMoneyBBT';
        let args = { "requestType": callName, address: address, amount: amount };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    // observer.next(res);

                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res)
                })
            }
        });

    }

    newMarketAddress(data) {
        let address = JSON.parse(localStorage.getItem('auth'))['address'];
        let callName = 'setStore';
        let args = {
            "requestType": callName,
            "storename": data.storename,
            "walletAddress": address,
        };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);
                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res);
                })
            }
        });
    }

    // END WALLET BTT

    showNotificationElectron(message) {
        this.ipcRenderer.send('message', message);
    }

    updateItem(data) {


        let callName = 'listItem';
        let args = { "requestType": callName, "goods": data };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res);
                })
            }
        });
    }

    relistItem(data) {

        let actionId = this.createAction_({
            text: 'Relisting an item ',
            item: data.title,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'newitem'
        })

        let callName = 'listItem';
        return new Observable((observer) => {
            this.viewItemService.cancelItem({ address: data['address'] }).subscribe(cancelRes => {
                if (this.actionInProgress) {
                    this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: { result: "error", error: "Another action in progress" } })
                    observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
                } else this.actionInProgress = true;
                if (this.isElectron) {
                    this.ipcRenderer.send('api', data)
                    this.ipcRenderer.once(callName, (event, arg) => {
                        let res = JSON.parse(arg);
                        this.actionInProgress = false;
                        if (res.result == 'ok')
                            this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'newitem', data: res })
                        else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: res })

                        observer.next(res);

                    })
                } else {
                    this.http.post(API, data).map(res => res.json()).subscribe(res => {
                        this.actionInProgress = false;
                        if (res.result == 'ok')
                            this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'newitem', data: res })
                        else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: res })

                        observer.next(res);
                    })
                }
            });
        })

    }

    getActionInProgress() {
        return this.actionInProgress;
    }

    acceptBuy(data, item: any = false) {
        //placeholder for relisting an expired item for when we have api call

        let actionId = this.createAction_({
            text: 'Accepting buy request on ',
            item: item.title,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'acceptbuy'
        })

        let callName = 'acceptBuy';
        data['requestType'] = callName;

        return new Observable((observer) => {
            if (this.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'acceptbuy', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.actionInProgress = true;
            if (this.isElectron) {
                this.ipcRenderer.send('api', data)
                this.ipcRenderer.once(callName, (event, arg) => {
                    this.actionInProgress = false;
                    let res = JSON.parse(arg);
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'acceptbuy', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'acceptbuy', data: res })

                    observer.next(res);

                })
            } else {
                this.http.post(API, data).map(res => res.json()).subscribe(res => {
                    this.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'acceptbuy', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'acceptbuy', data: res })

                    observer.next(res);
                })
            }
        });
    }

    openDispute(data, item: any = false, seller) {
        //placeholder for relisting an expired item for when we have api call

        let actionId = this.createAction_({
            text: seller ? 'Continuing with dispute on ' : 'Opening dispute on ',
            item: item.title,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'opendispute'
        })

        let callName = 'openDispute';
        data['requestType'] = callName;
        if (seller) data['seller'] = seller;

        return new Observable((observer) => {
            if (this.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'opendispute', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.actionInProgress = true;
            if (this.isElectron) {
                this.ipcRenderer.send('api', data)
                this.ipcRenderer.once(callName, (event, arg) => {
                    this.actionInProgress = false;
                    let res = JSON.parse(arg);
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'opendispute', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'opendispute', data: res })

                    observer.next(res);

                })
            } else {
                this.http.post(API, data).map(res => res.json()).subscribe(res => {
                    this.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'opendispute', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'opendispute', data: res })

                    observer.next(res);
                })
            }
        });
    }

    claimDispute(data, item: any = false) {

        let actionId = this.createAction_({
            text: 'Recieving funds from the sale: ',
            item: item.title,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'claimdispute'
        })

        let callName = 'claimDispute';
        data['requestType'] = callName;

        return new Observable((observer) => {
            if (this.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'claimdispute', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.actionInProgress = true;
            if (this.isElectron) {
                console.log('claimDispute data', data);
                this.ipcRenderer.send('api', data)
                this.ipcRenderer.once(callName, (event, arg) => {
                    this.actionInProgress = false;
                    let res = JSON.parse(arg);
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'claimdispute', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'claimdispute', data: res })

                    observer.next(res);

                })
            } else {
                this.http.post(API, data).map(res => res.json()).subscribe(res => {
                    this.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'claimdispute', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'claimdispute', data: res })

                    observer.next(res);
                })
            }
        });
    }

    closeDispute(data, item: any = false, dispute, seller) {
        //placeholder for relisting an expired item for when we have api call
        let text = seller ? 'Refunding the buyer of ' : 'Finalizing Sale on ';
        let actionId = this.createAction_({
            text: text,
            item: item.title,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'closedispute'

        })

        let callName = 'closeDispute';


        data['requestType'] = callName;
        data['isDispute'] = dispute;

        console.log('CALLING CLOSEDISPUTE FE', data, item, dispute);

        return new Observable((observer) => {
            if (this.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'closedispute', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.actionInProgress = true;
            if (this.isElectron) {
                this.ipcRenderer.send('api', data)
                this.ipcRenderer.once(callName, (event, arg) => {
                    console.log('result on CLOSEDISPUTE', arg);
                    this.actionInProgress = false;
                    let res = JSON.parse(arg);
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'closedispute', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'closedispute', data: res })

                    observer.next(res);

                })
            } else {
                this.http.post(API, data).map(res => res.json()).subscribe(res => {
                    this.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'closedispute', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'closedispute', data: res })

                    observer.next(res);
                })
            }
        });
    }

    rejectBuy(data, item: any = false) {

        let actionId = this.createAction_({
            text: 'Rejecting buy request on ',
            item: item.title,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'rejectbuy'
        })

        let callName = 'rejectBuy';

        data['requestType'] = callName;
        return new Observable((observer) => {
            if (this.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'rejectbuy', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.actionInProgress = true;
            if (this.isElectron) {
                this.ipcRenderer.send('api', data)
                this.ipcRenderer.once(callName, (event, arg) => {
                    this.actionInProgress = false;
                    let res = JSON.parse(arg);
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'rejectbuy', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'rejectbuy', data: res })

                    observer.next(res);

                })
            } else {
                this.http.post(API, data).map(res => res.json()).subscribe(res => {
                    this.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'rejectbuy', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'rejectbuy', data: res })

                    observer.next(res);
                })
            }
        });
    }

    login(info: any = false) {
        if (info) {
            localStorage.setItem('auth', JSON.stringify(info));
        } else {
            info = JSON.parse(localStorage.getItem('auth'));
        }
        if (info) {
            this.globalService.wallet = info;
            this.globalService.authTrigger.emit(true);
            this.getBalance(info.address).subscribe(
                balance => {
                    if (balance['result'] == 'ok') {
                        this.globalService.wallet['balance'] = balance['balance'].toString();
                        this.globalService.wallet['balanceEth'] = this.globalService.toEth(balance['balance']);
                    }
                    this.globalService.updateBalance.emit(this.globalService.wallet.balanceEth);
                },
                err => {

                },
                () => {

                }
            )
        }
    }

    logout() {
        localStorage.removeItem('auth');
        localStorage.removeItem('storeinfo');
        this.globalService.authTrigger.emit(false);
    }

    currencyBTC_ETH() {
        let URL = 'https://changenow.io/api/v1/market-info';
        return this.http.get(URL)
            .map(res => res.json());
    }

    getExchangeInstructions(data) {
        let url = 'https://changenow.io/api/v1/transactions/' + CHANGENOW_APIKEY;
        let body = {
            from: "btc",
            to: "eth",
            address: this.globalService.wallet.address,
            amount: data
        };
        return this.http.post(url, body)
            .map(res => res.json());
    }

    sendMoney(address, amount) {


        let callName = 'sendMoney';
        let args = { "requestType": callName, address: address, amount: amount };

        return new Observable((observer) => {
            if (this.isElectron) {
                this.ipcRenderer.send('api', args)
                this.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map(res => res.json()).subscribe(res => {
                    observer.next(res);
                })
            }
        });
    }

    createCheatCode() {
        let code: string = UUID.UUID();
        return new Observable(observer => {
            this.saveSettings([{ value: Md5.hashStr(code), key: 'cheatcode' }]).subscribe(res => { })
            observer.next(code)
        })

    }

    checkCheatCode(cheatCode: string) {
        return new Observable(observer => {
            this.getSettings('cheatcode').subscribe((code: any) => {
                if (code.value == Md5.hashStr(cheatCode)) observer.next(true)
                else observer.next(false)
            })
        });
    }

    getAllMyETHTransactions(address) {
        let transaction = {
            ETHTransaction: []
        }
        return new Observable((observer) => {
            this.ETHtransactions(address)
                .then((res: any) => {
                    transaction.ETHTransaction = res
                    observer.next(transaction);
                })
        })
    }

    getAllMyBBTTransactions(address) {
        let transaction = {
            BBTTransaction: [],
        }
        return new Observable((observer) => {
            this.BBTtransactions(address)
                .then((res: any) => {
                    transaction.BBTTransaction = res
                    observer.next(transaction);
                })
        })
    }

    ETHtransactions(address) {
        return new Promise((resolve) => {
            return this.http.get(ETHER_SCAN_API + "?module=account&action=txlist&address=" + address + "&sort=desc&apikey=" + API_KEY)
                .map(res => res.json())
                .subscribe(res => {
                    resolve(res);
                })
        })

    }

    BBTtransactions(address) {
        return new Promise(resolve => {
            return this.http.get(ETHER_SCAN_API + "?module=account&action=tokentx&address=" + address + "&sort=desc&apikey=" + API_KEY)
                .map(res => res.json())
                .subscribe(res => {
                    resolve(res)
                })
        })

    }


    reloadApp() {
        this.ipcRenderer.send('reload', {});
    }


    bookmarkItem(item) {

        return new Observable((observer) => {

            let bookmarked = localStorage.getItem('bookmarkedItems');

            let bookmarkedArr: any[] = JSON.parse(bookmarked);
            let alreadyHave = false;
            bookmarkedArr.forEach((bookmarkedItem, index) => {
                if (bookmarkedItem.address == item.address) {
                    alreadyHave = true;

                }
            })
            if (!alreadyHave) {

                bookmarkedArr.push(item);
                localStorage.setItem('bookmarkedItems', JSON.stringify(bookmarkedArr));
            }
            observer.next({
                result: 'ok'
            });
        });
    }

    bookmarkItemRemove(item) {

        return new Observable((observer) => {
            let bookmarked = localStorage.getItem('bookmarkedItems');

            let bookmarkedArr: any[] = JSON.parse(bookmarked);
            bookmarkedArr.forEach((bookmarkedItem, index) => {
                if (bookmarkedItem.address == item.address) {

                    bookmarkedArr.splice(index, 1);
                    localStorage.setItem('bookmarkedItems', JSON.stringify(bookmarkedArr));
                }
            })
            observer.next({
                result: 'ok'
            });
        });
    }

    checkBookmarkedItem(address = undefined) {

        if (!localStorage.getItem('bookmarkedItems'))
            localStorage.setItem('bookmarkedItems', '[]')

        return new Observable((observer) => {
            let items = localStorage.getItem('bookmarkedItems');
            let itemsArr = JSON.parse(items);
            if (address) {
                itemsArr.forEach(item => {
                    if (address == item.address) {

                        observer.next({
                            result: 'ok',
                            bookmarked: true
                        });
                        observer.complete();
                    }
                })

                observer.next({
                    result: 'ok',
                    bookmarked: false
                });
            } else {
                let addressArr = itemsArr.map(item => item.address)
                observer.next({
                    result: 'ok',
                    bookmarked: addressArr
                });
            }
        });
    }

    getBookmarkedItems() {

        return new Observable((observer) => {
            let items = localStorage.getItem('bookmarkedItems');
            observer.next({
                result: 'ok',
                items: JSON.parse(items)
            });
        });
    }

    imgurImage(image) {
        let headers = new Headers({ 'Authorization': "Client-ID " + this.globalService.imgurAuthData.id });
        let cutImg = image.replace(/^data:image\/(png|jpeg);base64,/, "");
        return this.http.post('https://api.imgur.com/3/image', { image: cutImg }, { headers: headers })
            .map(res => res.json());
    }

    imgurAuth() {
        return this.http.post('https://api.imgur.com/oauth2/token', {
            client_id: this.globalService.imgurAuthData.id,
            client_secret: this.globalService.imgurAuthData.secret,
            grant_type: 'pin',
            pin: 'kilazi'
        })
    }

   

    getTransactions() {
        let callName = 'getTransactions';
        let args = { "requestType": callName };

        return new Observable((observer) => {
            this.ipcRenderer.send('api', args)
            this.ipcRenderer.once(callName, (event, arg) => {
                let res = JSON.parse(arg);

                observer.next(res);
            })
        });
    }

    clearStoreFront() {
        let callName = 'clearStoreFront';
        let args = { "requestType": callName };

        return new Observable((observer) => {
            this.ipcRenderer.send('api', args)
            this.ipcRenderer.once(callName, (event, arg) => {
                let res = JSON.parse(arg);
                observer.next(res);
            })
        });
    }

    createAction_(data) {
        let actionId = Date.now();
        data['actionId'] = actionId;
        let title = data['text'];
        if (data['item']) title = title + " " + data['item']

        this.globalService.createAction.emit(data);
        return actionId;
    }

    getCountryList() {
      return new Observable((observer) => {
        this.http.get('assets/countries.json').map(res => res.json()).subscribe(res => {
          observer.next(res);
        })
      })
    }

    getConfig() {
        let callName = 'getConfig';
        let args = { "requestType": callName };

        return new Observable((observer) => {
            this.ipcRenderer.send('api', args)
            this.ipcRenderer.once(callName, (event, arg) => {
                let res = JSON.parse(arg);
                observer.next(res);
            })
        });
    }

}
