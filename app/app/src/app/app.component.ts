import { OrdersService } from './orders/orders.service';
import { GasService } from './common/gas.service';
import { StylesheetService } from './utils/stylesheet.service';
import { NotificationsService } from './utils/notifications.service';
import { SocketService } from './utils/socket.service';
import { HttpService } from './utils/http.service';
import { KeypressInterface, GlobalService } from './utils/global.service';
import { TourService, IStepOption } from 'ngx-tour-ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Router, RoutesRecognized, NavigationEnd } from '@angular/router';
import { Component, OnInit, HostListener, NgZone, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { OrdersComponent } from './orders/orders/orders.component';
import * as $ from 'jquery';
import { ChatService } from './chat/chat.service';
import { SyncService } from './sync/sync.service';
import { Observable } from 'rxjs/Observable';
import { ENV } from './environment/environment';
import { ViewItemsService } from './view-items/view-items.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: {
        '(keydown)': 'keydown($event)'
    }
})

export class AppComponent implements OnInit {


    private authorized: boolean = false;
    private menu: boolean = false;
    private loader: boolean = false;
    private bigLoader: boolean = false;
    private cacheLoader: boolean = false;
    private noWallet: boolean = false;
    private balance: number = 0;
    private actions = [];
    private ownstorename;
    private searchComponentUp: boolean = false;
    private showRefresh: boolean = false;
    private loadingItems: string[] = [
    ]
    public environment = ENV;
    private hideBackButton = true;
    constructor(
        private globalService: GlobalService,
        private http: HttpService,
        private router: Router,
        private _location: Location,
        private socket: SocketService,
        private notification: NotificationsService,
        private translate: TranslateService,
        private tourService: TourService,
        private zone: NgZone,
        private stylesheetService: StylesheetService,
        private chatService: ChatService,
        private syncService: SyncService,
        private gasService: GasService,
        private viewItemService: ViewItemsService,
        private ordersService: OrdersService,
        private ref: ChangeDetectorRef
    ) {
        // router.events.subscribe(event => {
        // })

        document.addEventListener('dragover', function (event) {
            event.preventDefault();
            return false;
        }, false);

        document.addEventListener('drop', function (event) {
            event.preventDefault();
            return false;
        }, false);

        router.events
            .subscribe((event: any) => {
                this.hideBackButton = false;
                if (event.constructor['name'] === "NavigationStart") {
                    if (event.url.indexOf('buy/view-all') != -1
                        || event.url.indexOf('buy/orders') != -1
                        || event.url.indexOf('buy/purchases') != -1
                        || event.url.indexOf('wallet') != -1
                        || event.url.indexOf('search/') != -1
                        || event.url.indexOf('items/') != -1
                    ) {
                        this.globalService.searchChanged.emit('');
                        this.showRefresh = true;
                    } else this.showRefresh = false;
                    if (event.url.indexOf('buy/view-all') != -1
                        || event.url.indexOf('search/') != -1
                    ) {
                        this.searchComponentUp = true;
                    } else this.searchComponentUp = false;
                }
                window.scrollTo(0, 0);
                this.globalService.searchChanged.emit('');
            })
        router.events
            .filter(e => e instanceof RoutesRecognized).pairwise().subscribe((e) => {
                if (e && e[1] && e[1]['urlAfterRedirects'] == '/login') this.hideBackButton = true;
            });


        this.authorized = false;
        this.globalService.authorized = false;


        if (!this.authorized) {
            $('body').removeClass('nav-toggle');
        }
        this.authorized = false;
        this.globalService.authorized = false;
        localStorage.removeItem('auth');




        if (!this.authorized) {
            $('body').removeClass('nav-toggle');
        }
    };

    isElectron() {
        return window && window['process'] && window['process']['type']
    }

    logout($event) {
        $event.preventDefault();
        this.http.postLogout()
            .subscribe(
                res => {
                    this.http.logout();
                    this.router.navigateByUrl('/login');
                    this.authorized = false;
                    this.globalService.authorized = false;
                },
                err => {

                }
            )
    }
    private disposer;
    private unreadMessages = 0;
    ngOnInit() {
        let notifications = this.globalService.notificationsList();
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };

        this.router.events.subscribe((evt) => {
            if (evt) {
                this.router.navigated = false;
                window.scrollTo(0, 0);
            }
        });

        if (this.isElectron())
            this.http.isElectron = true;
        else this.http.isElectron = false;
        var focused = true;

        window.onfocus = function () {
            focused = true;
        };
        window.onblur = function () {
            focused = false;
        };
        let openChat = false;

        this.globalService.setGlobalUnread.subscribe(globalUnread => {
            if (globalUnread < 0) globalUnread = 0;
            this.unreadMessages = globalUnread;
        })

        this.http.getConfig().subscribe((res: any) => {
            this.globalService.secret = res.reviews_secret;
            this.globalService.imgurAuthData = res.imgur;
            this.chatService.secret = res.chat_secret;
        })




        this.globalService.triggerMenu.subscribe(trigger => {
            this.menu = trigger;
        })


        setTimeout(() => {
            if (localStorage.getItem('theme')) {
                this.setTheme(localStorage.getItem('theme'));
            }
            if (localStorage.getItem('lang')) {

                let lang: string = localStorage.getItem('lang');
                this.globalService.lang = lang;
                this.globalService.setLanguageEvent.emit(lang);
            } else {
                let lang = 'en'
                this.globalService.lang = lang;
                this.globalService.setLanguageEvent.emit(lang);
            }
        }, 1000)


        this.globalService.preloader.subscribe(
            trigger => {
                if (!trigger) this.cacheLoader = false;
                this.loader = trigger;
            }
        )
        this.globalService.bigPreloader.subscribe(
            trigger => {
                if (!trigger) this.cacheLoader = false;
                this.bigLoader = trigger;
            }
        )

        setInterval(() => {
            let sub = this.http.getBalance(this.globalService.wallet['address']).subscribe(
                balance => {
                    if (balance['result'] == 'ok') {
                        this.globalService.wallet['balance'] = balance['balance'].toString();
                        this.globalService.wallet['balanceEth'] = this.globalService.toEth(balance['balance']);
                        sub.unsubscribe();
                    }
                    this.globalService.updateBalance.emit(this.globalService.wallet.balanceEth);
                },
                err => {
                    sub.unsubscribe();
                }
            )
        }, 10000)


        this.globalService.updateBalance.subscribe(balance => {

            this.balance = balance;
        });

        //login: person has logged in
        this.globalService.authTrigger.subscribe(
            res => {
                this.onLogin(res);
            }
        )
        this.globalService.setThemeEvent.subscribe(
            res => {
                this.setTheme(res);
            }
        )
        this.http.checkWallet().subscribe(
            res => {
                if (res['result'] == 'ok' && !res['haveWallet']) {
                    this.router.navigateByUrl('/password');
                } else this.router.navigateByUrl('/login');
            },
            err => {
                this.router.navigateByUrl('/password');
            }
        )
        // this.globalService.getChatList();



        this.globalService.setLanguageEvent.subscribe(
            lang => {
                this.zone.run(() => {
                    this.translate.setDefaultLang('en');
                    this.translate.getTranslation(lang).subscribe(res_translate => {
                        this.translate.get('TEST').subscribe(res => {
                        })
                        this.translate.use(lang)
                    }, err => {
                        this.globalService.setLanguage('en');
                        this.translate.use('en')
                    })
                })
            }
        )


        this.watchActions();
    }


    // Action is a modal in bottom left corner on every blockchain-related transaction
    watchActions() {


        this.globalService.createAction.subscribe(action => {
            this.actions.push(action)
        })

        this.globalService.removeAction.subscribe(action => {
            let code = action.code;
            let status = action.status;
            let txData = action.data;

            if ((code === 'acceptbuy' || code === 'rejectbuy') && this._location.isCurrentPathEqualTo("/items/orders")) {

                this._location.go('/items/orders')
            }



            let i = this.actions.findIndex(item => item.code === code && item.actionId === action.id);
            if (i >= 0) {
                
                setTimeout(() => {
                    this.actions.splice(i, 1);
                }, 4000);

            }
        })
    }

    onLogin(auth) {
        this.globalService.getCached();

        this.ordersService.purchases.next(this.globalService.cached.myPurchases)
        this.ordersService.orders.next(this.globalService.cached.myOrders)

        this.notification.init();

        this.authorized = auth;
        this.globalService.authorized = auth;
        this.menu = true;
        if (auth) {
            this.hideBackButton = true;
            this.chatService.subscribe();



            this.chatService.chats.subscribe(chats => {
                let unread = 0;
                chats.forEach(chat => {
                    if (chat.unread) unread++;
                })

                this.unreadMessages = unread;
                this.chatService.saveChats();
                this.ref.detectChanges();
            })
            this.gasService.manageGas();
            this.http.getDecimalsBBT().subscribe(decimals => {
                this.http.getBalanceBBT(this.globalService.wallet['address']).subscribe(
                    balance => {
                        let balanceBBT = balance['balance'];
                        if (decimals['result'] == 'ok') {
                            balanceBBT = balanceBBT / Math.pow(10, decimals['decimals'])
                        }
                        if (!balanceBBT) balanceBBT = 0;
                        localStorage.setItem('balanceBBT', balanceBBT)
                    }
                )
            })
            this.viewItemService.geStoreName(this.globalService.wallet['address']).subscribe(
                (res: any) => {
                    if (res.items.length != 0) {
                        this.ownstorename = res.items[0];
                        localStorage.setItem('storeinfo', JSON.stringify(this.ownstorename));
                    }
                }
            );
            this.giveTour();

            this.http.ipfsDaemonActive().subscribe((ipfs: any) => {
                console.log('ipfs', this.globalService.ipfsPreference.value, ipfs.running);
                if (this.globalService.ipfsPreference.value && !ipfs.running) {
                    console.log('showConfirmation ipfsNoDaemon');
                    this.globalService.confirmation.emit('ipfsNoDaemon')
                }
            })
        } else {
            this.router.navigateByUrl('/login');
        }
        if (localStorage.getItem('theme')) {
            this.setTheme(localStorage.getItem('theme'));
        }
        if (localStorage.getItem('lang')) {
            let lang: string = localStorage.getItem('lang');
            this.globalService.setLanguageEvent.emit(lang);
        }
        if (localStorage.getItem('reporting')) {
            let reporting = localStorage.getItem('reporting');
            this.globalService.setReporting(reporting);
        }


        this.globalService.confirmation.emit('wait_for_sync');


        this.syncService.startSync();

        this.syncService.syncList.subscribe(syncList => {
            let found;
            syncList.forEach(sync => {                
                if(sync.current) {
                    this.loadingItems = [sync.progress];
                    this.globalService.preloader.emit(true);
                    this.cacheLoader = true;
                    console.log('loadingItems', this.loadingItems);
                    found = true;
                    this.ref.detectChanges();
                }
            })

            if(!found) {
                this.cacheLoader = false;
                this.globalService.preloader.emit(false);
                this.loadingItems = [];
                this.ref.detectChanges();
            }
            
        })


    }

    giveTour() {
        if (!localStorage.getItem('tour_given')) {

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
                placement: 'bottom',
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
            // }, 1000);
            localStorage.setItem('tour_given', 'YES');
        }
    }

    setTheme(theme) {
        if (theme == 'default') {
            $('body').removeClass('light-theme').addClass('default-theme');
        } else if (theme == 'light') {
            $('body').removeClass('default-theme').addClass('light-theme');
        } else if (theme.indexOf('custom-') != -1) {
            let themes: any = localStorage.getItem('themes');
            let tmp = theme.split('-');

            themes = JSON.parse(themes);
            this.stylesheetService.create();
            this.stylesheetService.apply(themes[tmp[1]]['value']);
        }
        // localStorage.setItem('theme', theme);
    }
    keydown($event) {
        let keyPress: KeypressInterface = {
            key: $event.code,
            path: $event.path,
            event: $event
        }
        if ($event.code == 'ArrowUp' || $event.code == 'ArrowDown' || $event.code == 'ArrowRight' || $event.code == 'ArrowLeft') {
            this.globalService.arrowEvent.emit(keyPress);
        }
    }

    goBack() {
        this._location.back();
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event) {
        this.socket.disconnect();
    }
    goTo(where) {
        this.router.navigateByUrl('/' + where);
    }

    newItem() {
        this.router.navigateByUrl('newitem-wizard');
    }

    cancelPreloader() {
        this.cacheLoader = false;
        this.router.navigateByUrl('/notifications');
    }


    //TODO: move into sync.service, make it a BS and call active items through a speficic call
    cacheThings() {

        let preloaders = 0;
        let preloadersLength = 6;
        this.cacheLoader = true;
        let sub1 = this.viewItemService.getAllListings(false).subscribe(res => {
            res['items'].map(item => {
                item['active'] = true;
            });
            let i = this.loadingItems.indexOf('ALL_ITEMS');
            if (i != -1) this.loadingItems.splice(i, 1);
            let $this = this;
            res['items'] = res['items'].sort((a: any, b: any) => {
                return $this.globalService.sortBackwards(a, b, 'timestamp');
            });
            this.globalService.cached.viewAll = res['items'];

            if (++preloaders == preloadersLength) {
                this.cacheLoader = false;
            }

            sub1.unsubscribe();
        }, err => {
            this.globalService.confirmation.emit('connection_error');
        })


        //load from cache
        let val: any = { expired: [] };
        try {
            let temp = localStorage.getItem('cached');
            if (temp) val = JSON.parse(temp);

        } catch (e) { } if (!val)
            this.globalService.cached.expired = val.expired;

        let sub2 = this.http.viewAllMyExpired(false).subscribe(res => {
            res['items'].map(item => {
                item['active'] = false;
            });
            let i = this.loadingItems.indexOf('MY_EXPIRED_ITEMS');
            if (i != -1) this.loadingItems.splice(i, 1);
            let $this = this;
            res['items'] = res['items'].sort((a: any, b: any) => {
                return $this.globalService.sortBackwards(a, b, 'timestamp');
            });

            // if (val.length < res['items'].length) this.notification.createNotification('expired', res['items'][res['items'].length - 1].address, res['items'][res['items'].length - 1]);
            this.notification.syncSimple('expired', res['items']);
            // this.globalService.cached.expired = res['items'];
            if (++preloaders == preloadersLength) {
                this.cacheLoader = false;

            }
            sub2.unsubscribe();
        })
        let sub3 = this.http.viewAllMyActive(false).subscribe(res => {
            res['items'].map(item => {
                item['active'] = true;
            });
            let i = this.loadingItems.indexOf('MY_ACTIVE_ITEMS');
            if (i != -1) this.loadingItems.splice(i, 1);
            let $this = this;
            res['items'] = res['items'].sort((a: any, b: any) => {
                return $this.globalService.sortBackwards(a, b, 'timestamp');
            });

            this.globalService.cached.active = res['items'];
            if (++preloaders == preloadersLength) {
                this.cacheLoader = false;
            }
            sub3.unsubscribe();
        })

        //load from cache
        val = { sold: [] };
        try {
            let temp = localStorage.getItem('cached');
            if (temp) val = JSON.parse(temp);
        } catch (e) { } if (!val)
            this.globalService.cached.sold = val.sold;


        let sub4 = this.http.viewAllMySold(false).subscribe(res => {

            res['items'].map(item => {
                item['active'] = true;
            });
            let i = this.loadingItems.indexOf('MY_SOLD_ITEMS');
            if (i != -1) this.loadingItems.splice(i, 1);
            let $this = this;
            res['items'] = res['items'].sort((a: any, b: any) => {
                return $this.globalService.sortBackwards(a, b, 'timestamp');
            });


            this.notification.syncSimple('sold', res['items']);

            // this.globalService.cached.sold = res['items'];
            if (++preloaders == preloadersLength) {
                this.cacheLoader = false;
            }

            sub4.unsubscribe();
        })


    }
}
