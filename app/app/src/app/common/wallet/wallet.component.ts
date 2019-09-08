import { GasService } from './../gas.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import * as eth from 'ethereum-address';
import * as $ from 'jquery';
@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
    private eth = eth;
    private wallet_address;
    private simpleRefill: any = {
        amount: 0,
        instructions: false,
        state: 'none'
    };
    private advancedRefill: any = {
        ethAmount: null,
        btcAmount: null,
        exchangeAddress: '',
        deposit: '',
        orderId: '',
        returnAddress: '',
        withdrawal: '',
        pending: false
    };
    private sendBBT: any = {
        withdraw: ''
    };

    private orderBy: any = {
        name: 'from',
        desc: true
    };

    private changeState: boolean = false;
    private isHiddenETH: boolean = false;
    private isHiddenBBT: boolean = false;

    private decimalsBBT;


    private balanceBBT = 0;
    private transactions;
    private ETHtransactions: any = [];
    private BBTtransactions: any = [];
    private withdrawAmount = 1;
    private withdrawAmountBBT = 1;
    private currencyInfo: any = null;
    private timer: string = '';
    private timeInterval: any = null;
    private wallet: any = {};
    private currency: any = {
        BTC_ETH: 0,
        ETH_BTC: 0,
        time: 0
    };
    private visual: any = {
        withdraw: false,
        exchangeRate: false,
        refillWallet: false,
        refill: false,
        simpleRefill: true,
        transactionHistory: false,
        sendBBT: false
    }
    private invalidValue = {
        BBTwidthdraw: true,
        ETHwidthdraw: true
    }

    public exchangeURL;

    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private router: Router,
        private globalService: GlobalService,
        private notifications: NotificationsService,
        private sanitizer: DomSanitizer,
        private gasService: GasService
    ) {

    }
    ngOnInit() {
        let address = JSON.parse(localStorage.getItem('auth'))['address'];
        if (address && !this.wallet.address) {
            this.wallet.address = address;
        }
        this.getInfo();
        this.getETHTransactions();
        this.getBBTTransactions();
        this.exchangeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`https://changelly.com/widget/v1?auth=email&from=USD&to=ETH&merchant_id=31f51620dd07&address=${this.wallet.address}&amount=100&ref_id=31f51620dd07&color=f6a821`);
    }

    sortETHTransaction(orderByName, $event) {
        $event.preventDefault();
        if (this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc;
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        }
        localStorage.setItem('myOrderBy', JSON.stringify(this.orderBy));
        this.changeState = !this.changeState;
        this.runSort('ETH');
    }

    sortBBTTransaction(orderByName, $event) {
        $event.preventDefault();
        if (this.orderBy.name == orderByName)
            this.orderBy.desc = !this.orderBy.desc;
        else {
            this.orderBy.name = orderByName;
            this.orderBy.desc = false;
        }
        localStorage.setItem('myOrderBy', JSON.stringify(this.orderBy));
        this.changeState = !this.changeState;
        this.runSort('BBT');
    }

    runSort(currency) {
        let $this = this;
        if (currency === 'ETH') {
            this.ETHtransactions = this.ETHtransactions.sort((a: any, b: any) => {
                if ($this.orderBy.desc) {
                    return $this.globalService.sortBackwards(a, b, $this.orderBy.name);
                }
                else {
                    return $this.globalService.sort(a, b, $this.orderBy.name);
                }
            });
        }
        else {
            this.BBTtransactions = this.BBTtransactions.sort((a: any, b: any) => {
                if ($this.orderBy.desc) {
                    return $this.globalService.sortBackwards(a, b, $this.orderBy.name);
                }
                else {
                    return $this.globalService.sort(a, b, $this.orderBy.name);
                }
            });
        }


    }

    openChangelly() {
        this.http.openChangelly(this.globalService.wallet.address);
    }

    checkAddress(name, address) {
        this.invalidValue[name] = !eth.isAddress(address);
    }

    getETHTransactions() {
        this.http.getAllMyETHTransactions(this.globalService.wallet['address']).subscribe(
            (res: any) => {
                this.ETHtransactions = res.ETHTransaction.result;
                for (var i = 0; i < this.ETHtransactions.length; i++) {
                    this.ETHtransactions[i]['value'] = this.globalService.toEth(this.ETHtransactions[i]['value']);
                }
            })
    }

    getBBTTransactions() {
        this.http.getAllMyBBTTransactions(this.globalService.wallet['address']).subscribe(
            (res: any) => {
                this.BBTtransactions = res.BBTTransaction.result;
                for (var i = 0; i < this.BBTtransactions.length; i++) {
                    this.BBTtransactions[i]['value'] = this.globalService.toBBT(this.BBTtransactions[i]['value']);
                }

            })
    }

    getInfo() {
        this.refreshRates();
        this.http.getBalance(this.globalService.wallet['address']).subscribe(
            balance => {
                if (balance['result'] == 'ok') {
                    this.globalService.wallet['balance'] = balance['balance'].toString();
                    this.globalService.wallet['balanceEth'] = this.globalService.toEth(balance['balance']);

                }
                this.globalService.updateBalance.emit(this.globalService.wallet.balanceEth);
                this.wallet = this.globalService.wallet;
                if (!this.wallet || !this.wallet.balanceEth)
                    this.wallet['balanceEth'] = 0;
            },
            err => {

            },
            () => {
            }
        )
        this.http.getDecimalsBBT().subscribe(decimals => {
            this.decimalsBBT = decimals['decimals'];
            this.http.getBalanceBBT(this.globalService.wallet['address']).subscribe(
                balance => {
                    this.balanceBBT = balance['balance'];
                    if (decimals['result'] == 'ok') {
                        this.balanceBBT = this.balanceBBT / Math.pow(10, decimals['decimals'])
                    }
                    if (!this.balanceBBT) this.balanceBBT = 0;
                }
            )
        })

    }
    refreshRates() {
        this.http.currencyBTC_ETH().subscribe(
            result => {
                let res = result.filter(item => item.from === 'btc' && item.to === 'eth')[0];
                this.currency.BTC_ETH = res.rate;
                this.currency.ETH_BTC = 1 / res.rate;
                this.currency.time = Date.now();
                this.advancedRefill.time = Date.now();
                this.advancedRefill.minimum = res.min;
                this.advancedRefill.maximum = res.max;
                this.currencyInfo = res;
            },
            err => {
                this.notifications.showMessage('Couldn\'t get BTC/ETH exchange rate', 'Error');
            }
        );
    }
    simpleRefillTrigger(amount) {
        this.simpleRefill.amount = amount;
        this.simpleRefill.state = "processing";
        if (this.timeInterval) clearInterval(this.timeInterval);
        this.http.getExchangeInstructions(amount).subscribe(
            res => {
                if (res.error) {
                    this.notifications.showMessage('ChangeNow error.');
                } else {
                    this.simpleRefill.state = "refill";
                    this.simpleRefill.address = res.payoutAddress;
                    this.startCountdown(600000 + Date.now());
                }
            },
            err => {
                this.notifications.showMessage('Unable to get data from ChangeNow.');
            }
        )
    }
    advancedRefillTrigger() {
        this.visual.simpleRefill = false;
        this.http.getExchangeInstructions(this.advancedRefill.value).subscribe(
            res => {
                if (res.error) {
                    this.notifications.showMessage('ChangeNow error.');
                } else {
                    this.advancedRefill.deposit = res.payinAddress;
                    this.advancedRefill.orderId = res.id;
                    this.advancedRefill.withdrawal = res.payoutAddress;
                }
            },
            err => {
                this.notifications.showMessage('Unable to get data from ChangeNow.');
            }
        )
    }
    getTimeRemaining(endtime) {
        var t = endtime - Date.now();
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }
    startCountdown(endtime) {
        this.timeInterval = setInterval(() => {
            let t = this.getTimeRemaining(endtime);
            this.timer = ("0" + t.minutes).slice(-2) + ":" + ("0" + t.seconds).slice(-2);
            if (t.total <= 0) {
                this.timer = "Time is up.";
                clearInterval(this.timeInterval);
            }
        }, 1000);
    }
    ethToBtc(amount) {
        return amount * this.currency.ETH_BTC;
    }
    setMin() {
        this.advancedRefill.value = this.currency.BTC_ETH * this.advancedRefill.minimum;
    }
    setMax() {
        this.advancedRefill.value = this.currency.BTC_ETH * this.advancedRefill.maximum;
    }
    reset() {
        this.advancedRefill = {
            ethAmount: null,
            btcAmount: null,
            exchangeAddress: '',
            deposit: '',
            orderId: '',
            returnAddress: '',
            withdrawal: '',
            pending: false
        };
        this.refreshRates();
       // this.advancedRefillTrigger();
    }
    resetSimple() {
        this.simpleRefill = {
            amount: 0,
            instructions: false,
            state: 'none'
        };
    }
    getExchangeInstructions() {
        //do some checkings
        this.advancedRefill.pending = true;
        this.advancedRefillTrigger();
    }
    valueChanged($event) {

    }
    toClipboard() {
        document.execCommand('copy')
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


    withdrawSetMax() {

        var currentGas: any = parseFloat(localStorage.getItem('gas')) * 0.001;
        if (!currentGas || !isNaN(currentGas * 1)) { }
        currentGas = this.gasService.gasHTTP.getValue();
        this.withdrawAmount = this.wallet.balanceEth - currentGas;
        if (this.withdrawAmount >= this.wallet.balanceEth) {
            this.globalService.confirmation.emit('no_enough_eth');
            let subsciption = this.globalService.confirmation.subscribe(answer => {
                if (answer === 'yes') {
                    subsciption.unsubscribe();
                }
            })
        }
    }

    checkAmount() {
        if (this.withdrawAmount >= parseFloat(this.wallet.balanceEth)) {
            this.globalService.confirmation.emit('no_enough_eth');
            let subsciption = this.globalService.confirmation.subscribe(answer => {
                if (answer === 'yes') {
                    subsciption.unsubscribe();
                }
            })

        }
        else {
            this.withdrawFunc();
        }
    }

    withdrawFunc() {
        this.globalService.confirmation.emit('pop');
        let subscripition = this.globalService.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();
                this.http.sendMoney(this.advancedRefill.withdraw, this.globalService.fromEth(this.withdrawAmount)).subscribe(res => {
                    this.notifications.showMessage('WALLET.WITHDRAW_INITIATED');
                    this.globalService.updateBalance.emit();
                    this.router.navigateByUrl('/wallet');
                }, err => {
                    this.notifications.showMessage('COMMON.ERROR');
                })
                // this.notifications.showMessage('WALLET.WITHDRAW_INITIATED');
                this.withdrawAmount = 1;
            }
        });
    }

    _sendBBT() {
        this.globalService.confirmation.emit('pop');
        let subscripition = this.globalService.confirmation.subscribe(answer => {
            if (answer == 'yes') {
                subscripition.unsubscribe();

                this.http.sendMoneyBBT(this.sendBBT.withdraw, this.withdrawAmountBBT * Math.pow(10, this.decimalsBBT)).subscribe(res => {

                    this.notifications.showMessage('WALLET.SEND_BBT_SUCCESS');
                    this.globalService.updateBalance.emit();
                    this.router.navigateByUrl('/wallet');
                }, err => {
                    this.notifications.showMessage('COMMON.ERROR');
                })
                this.withdrawAmountBBT = 1;
            }
        });
    }

    cancelWithdraw() {
        this.visual.withdraw = false;
        this.notifications.showMessage('WALLET.WITHDRAW_CANCELLED')
    }
}
