import { OrdersService } from './../../orders/orders.service';
import { EshopEngine } from './../../eshop/engine.service';
import { SocketService } from './../../utils/socket.service';
import { GlobalService } from './../../utils/global.service';
import { NotificationsService } from './../../utils/notifications.service';
import { HttpService } from './../../utils/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import * as fancybox from 'fancybox';
import { ViewItemsService } from '../view-items.service';
const DAY = 86400;
@Component({
    selector: 'app-single-item',
    templateUrl: './single-item.component.html',
    styleUrls: ['./single-item.component.scss']
})
export class SingleItemComponent implements OnInit, OnDestroy {
    private item: any = {};
    private message: string = "";
    private load: boolean = true;
    private myItem: boolean = false;
    private chosenPic: number = 0;
    private zoomedPic: number = 0;
    private ends: number = 2;
    private shownPrice: string = "0";
    private shipError: boolean = false;
    private hasShipping: boolean = false;
    private wrongAmount: boolean = false;
    private visual: any = {
        expandDetails: false,
        escrow: false,
        offer: false
    }
    public notEnoughFunds: boolean = false;
    private amount: any = 1;
    private purchase: boolean = false;
    private dispute: boolean = false;
    private pending: boolean = false;
    private category: string = "";
    private chatAddress: string = "";
    private shippingAddress: string = "";
    private chosenShipping: number = 0;
    private goInit: EventEmitter<any>;
    private initSuggested: EventEmitter<any>;
    private savedAddresses: string[] = [];
    private translateParams = {};
    private subscripition;
    constructor(
        private route: ActivatedRoute,
        private http: HttpService,
        private notifications: NotificationsService,
        private gs: GlobalService,
        private router: Router,
        private socket: SocketService,
        private eshop: EshopEngine,
        private viewItemService: ViewItemsService,
        private ordersService: OrdersService
    ) {
        this.goInit = new EventEmitter(true);
        this.initSuggested = new EventEmitter(true);
    }
    ngOnDestroy() {
        $('body').removeClass('stop-scrolling')
        this.shipError = false;
        localStorage.setItem('issingleitem', 'true');
        setTimeout(() => {
            localStorage.removeItem('issingleitem')
            console.log('remove');
        }, 500);
    }
    ngOnInit() {



        this.getInfo(true);

        window.scrollTo(0, 0);
        this.http.getSettings('addresses').subscribe(res => {
            if (!res['value']) this.savedAddresses = [];
            try {

                this.savedAddresses = JSON.parse(res['value']);
                console.log('saved addresses', this.savedAddresses);
            } catch (e) {
                this.savedAddresses = [];
            }
        })
    }

    choosePic(i) {

        this.chosenPic = i;
    }

    decQuantity() {
        if (this.amount > 1)
            this.amount--;

        this.hasShipping ? this.shownPrice = ((this.item.priceEth * this.amount) + (this.amount * parseFloat(this.item['ship'][this.chosenShipping]['cost']))).toFixed(5) : this.shownPrice = (this.item.priceEth * this.amount).toFixed(5);

        this.checkAmount();
    }
    incQuantity() {
        if (this.amount < this.item.availableCount) this.amount++;
        this.hasShipping ? this.shownPrice = ((this.item.priceEth * this.amount) + (this.amount * parseFloat(this.item['ship'][this.chosenShipping]['cost']))).toFixed(5) : this.shownPrice = (this.item.priceEth * this.amount).toFixed(5);

        this.checkAmount();
    }

    goTag(tag) {
        this.router.navigateByUrl('buy/view-all/' + tag);
    }
    reviews;
    goReviews(address) {
        this.router.navigateByUrl('userReviews/' + address);
    }

    checkAmount() {
        if (this.amount && this.amount <= this.item.availableCount) {
            if (!this.amount.toString().match(/^[\d]+$/)) {
                this.shownPrice = "-";
                this.wrongAmount = true
            }
            else {
                this.wrongAmount = false;
                this.hasShipping ? this.shownPrice = ((this.item.priceEth * this.amount) + (this.amount * parseFloat(this.item['ship'][this.chosenShipping]['cost']))).toFixed(5) : this.shownPrice = (this.item.priceEth * this.amount).toFixed(5);
            }
        } else {
            this.shownPrice = "-";
            this.wrongAmount = true;
        }
    }

    getInfo(viewed = false) {

        this.route.params
            .map(params => params['id'])
            .subscribe((id: any) => {
                this.viewItemService.singleItem(id).subscribe(
                    (res: any) => {
                        this.amount = 1;
                        this.shipError = false;
                        this.hasShipping = false;
                        if (res.result == 'ok') {
                            this.item = res.item;
                            this.processItem(viewed)
                        }
                        else {
                            // this.notifications.showMessage('', 'ERROR.WHATEVER');
                            this.viewItemService.getListingByIpfsHash(id).subscribe(res => {
                                console.log('gotItem by hash!', res);
                                this.item = res;
                                this.processItem(res);
                                // this.ordersService.syncOrdersSingleItem(this.item).subscribe(resSync => {
                                //     console.log('syncOrdersSingleItem finished', resSync);
                                //     this.ordersService.getOrdersSingleItem(this.item).subscribe((resGet: any) => {
                                //         console.log('getOrdersSingleItem finished', resGet);
                                //         resGet.orders.forEach(order => {
                                //             this.ordersService.getOrdersDetail(order.tradeId).subscribe(getDetail => {
                                //                 console.log('getOrdersDetail', getDetail);
                                //             })
                                //         })

                                //     })
                                // })
                            })
                        }
                    },
                    err => {
                        console.log('error 2 here');
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            });

    }

    processItem(viewed) {

        this.http.getRatingByAddress(this.item.sender).subscribe(res => {
            if (!res['rating']) res['rating'] = 0;
            this.reviews = res;
        })

        //check funds
        if (this.item.cat.length)
            this.category = this.item.cat[0]
        this.item.endTimestamp = this.item.endTimestamp * 1000;
        this.item.timestamp = this.item.timestamp * 1000;

        if (this.item.endTimestamp - Date.now() <= 2 * DAY) this.ends = 0;
        if (this.item.endTimestamp - Date.now() > 2 * DAY && this.item.endTimestamp - Date.now() < 6 * DAY) this.ends = 1;
        if (this.item.endTimestamp - Date.now() > 6 * DAY) this.ends = 2;

        if (viewed) this.eshop.viewed(this.item);

        if (this.item.sender.toLowerCase() != this.gs.wallet['address'].toLowerCase())
            this.chatAddress = this.item.sender;
        else
            this.myItem = true;


        if (this.item.ship && this.item.ship.length) this.item.ship.forEach(ship => {
            if (ship.method && ship.method.length && ship.method != "") {
                this.hasShipping = true;
            }
            ship.cost && ship.cost.length ? ship.cost = this.gs.toEth(ship.cost) : null;

        })

        this.item['priceEth'] = this.gs.toEth(this.item.price);

        this.hasShipping ? this.shownPrice = ((this.item.priceEth * this.amount) + (this.amount * parseFloat(this.item['ship'][this.chosenShipping]['cost']))).toFixed(5) : this.shownPrice = (this.item.priceEth * this.amount).toFixed(5);


        let balanceBBT = localStorage.getItem('balanceBBT');
        if (!balanceBBT || balanceBBT < '1') {
            this.notEnoughFunds = true;
        }

        let balanceETH = this.gs.fromEth(this.gs.wallet.balance);

        if (!balanceETH || balanceETH < parseFloat(this.shownPrice)) {
            this.notEnoughFunds = true;
        }





        this.http.checkBookmarkedItem(this.item.address).subscribe(
            res => {
                if (res['result'] == 'ok')
                    this.item.bookmarked = res['bookmarked'];
            }
        )
        this.translateParams = { value: this.item.sender };
        this.goInit.emit({ address: this.chatAddress, goodsAddress: this.item.address, type: 'buy', goodsTitle: this.item.title, sender: this.item.sender });
        this.initSuggested.emit({ address: this.item.address, category: this.category, tags: this.item.tags });

    }

    goCategory(cat) {
        this.router.navigateByUrl('/search/category/' + cat)
    }



    openPic(i, withEvent = false) {
        var modal = document.getElementById('myModal');


        var modalImg: any = document.getElementById("img01");
        var captionText = document.getElementById("caption");

        modal.style.display = "block";
        let pic: any = document.getElementById("pic-" + i);
        modalImg.src = pic.getAttribute('imagesrc');
        this.zoomedPic = i;

        $('body').addClass('stop-scrolling')
    }

    arrowClicked(pointed: 'left' | 'right', $event) {
        $event.stopPropagation();
        let length = this.item.img.length;
        switch (pointed) {
            case 'left':
                if (this.zoomedPic <= 0) {
                    this.openPic(length - 1, true);
                } else {
                    this.openPic(this.zoomedPic - 1, true);
                }
                break;
            case 'right':
                if (this.zoomedPic >= length - 1) {
                    this.openPic(0, true);
                } else {
                    this.openPic(this.zoomedPic + 1, true);
                }
                break;
        }
    }

    closePic() {
        var modal = document.getElementById('myModal');
        modal.style.display = "none";
        $('body').removeClass('stop-scrolling')
    }
    buy($event) {

        let now = Date.now() / 1000;
        $event.preventDefault();
        if (this.item.endTimestamp < now) {
            this.notifications.showMessage("The product is expired!");
            return;
        }
        else
            if (parseInt(this.gs.balance) < this.amount * this.item.priceEth) {
                this.gs.confirmation.emit('no_eth');
                return;
            } else if (this.amount <= 0 || isNaN(parseInt(this.amount))) {
                this.notifications.showMessage("Please set correct amount");
                return;
            } else
                if (this.hasShipping && (!this.item['ship'][this.chosenShipping] || this.shippingAddress == "")) {
                    this.shipError = true;
                } else {
                    this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.buy_request });
                    let subscripition = this.gs.confirmation.subscribe(answer => {
                        if (answer == 'no') {
                            subscripition.unsubscribe();
                        }
                        if (answer == 'yes') {
                            if (this.item['ship'][this.chosenShipping] && this.item['ship'][this.chosenShipping]['method'] != "") {
                                if (this.message != "") this.message = this.message + "; "
                                else if (!this.message) this.message = "";
                                this.message = this.message + "Please send it with " + this.item['ship'][this.chosenShipping]['method'] +
                                    " to " + this.shippingAddress;
                            }
                            subscripition.unsubscribe();

                            this.router.navigateByUrl('/buy/view-all');
                            let finalPrice = (this.amount * this.item.price);

                            let ipfsPreference = this.gs.ipfsPreference.value;

                           
                            this.hasShipping ? finalPrice = finalPrice + this.gs.fromEth(this.amount * parseFloat(this.item['ship'][this.chosenShipping]['cost'])) : null;

                            let finalPriceString: string;
                            //HACK to check ipfs accept call
                            if (ipfsPreference && this.item.hashIpfs && this.item.hashIpfs.length) {
                                finalPriceString = (finalPrice).toString();                                
                            }


                            this.viewItemService.buyItem({ address: this.item.address, pubkey: this.item.pubkey, title: this.item.title, sender: this.item.sender, hashIpfs: this.item.hashIpfs, addressIpfs: this.item.addressIpfs, escrow: this.item.escrow }, this.amount, finalPriceString ? finalPriceString : finalPrice, this.message, this.item).subscribe(
                                res => {
                                    if (res['result'] == 'ok') {
                                        if (!this.gs.getEncryptedMark(this.item.sender)) {
                                            localStorage.removeItem('e_' + this.item.sender);
                                            this.gs.setEncryptedMark(this.item.sender);
                                            // this.socket.sendMessage('Encryption evolved', this.item.sender);
                                        }
                                        // this.socket.sendItemBuy(this.item.address, this.item.sender, this.item.title);
                                        this.notifications.showMessage('COMMON.SUCCESS');
                                        // this.gs.createProcessing(this.item.address, 'buy_request', this.item);
                                        // this.router.navigateByUrl('/buy/view-all');
                                    } else {
                                        this.notifications.showMessage('COMMON.FAILURE');
                                    }
                                },
                                err => {
                                    this.notifications.showMessage('ERROR.WHATEVER');
                                }
                            )
                        }
                    })
                }
    }
    finalize() {
        this.notifications.showMessage('COMMON.SUCCESS');
    }
    bookmark() {
        this.load = false;
        if (this.item.bookmarked) {
            this.http.bookmarkItemRemove(this.item).subscribe(res => {
                this.item.bookmarked = false;
            });

        } else {
            this.http.bookmarkItem(this.item).subscribe(res => {
                this.item.bookmarked = true;
            });
            this.item.bookmarked = true;
        }
    }

    cancelItem() {
        this.gs.confirmation.emit({ type: 'pop', gas: this.gs.gasPrices.cancel });
        this.subscripition = this.gs.confirmation.subscribe(answer => {
            if (answer == 'yes') {

                // let subscripition = this.gs.confirmation.subscribe(answer => {

                // if (answer == 'yes') {
                this.viewItemService.cancelItem(this.item.address, this.item).subscribe((res: any) => {
                    if (res && res.result == 'ok') {
                        this.notifications.showMessage('COMMON.SUCCESS');
                        this.router.navigateByUrl('/buy/view-all');
                    } else {
                        this.notifications.showMessage('COMMON.FAILURE');
                    }
                })
            }
            this.subscripition.unsubscribe();
        })

    }

    public shippingCalculated(data: any) {
        //show calculated shipping on the UI and include the delivery address to the order request + shipping fee converted to ETH to the price
    }
}
