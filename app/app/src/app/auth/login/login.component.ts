import { ChatService } from './../../chat/chat.service';
import { SocketService } from './../../utils/socket.service';
import { NotificationsService } from './../../utils/notifications.service';
import { GlobalService } from './../../utils/global.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, NgZone } from '@angular/core';
import * as $ from 'jquery';
export const MONTH = 2678400000;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    private password: string = '';
    private error: string = '';
    private key: string;
    private _2fa: boolean = true;
    private _cheat: boolean = false;
    private showCheatCode: boolean = false;
    private cheatcode: string = "";
    

    constructor(
        private translate: TranslateService,
        private http: HttpService,
        private router: Router,
        private globalService: GlobalService,
        private notifications: NotificationsService,
        private socket: SocketService,
        private zone: NgZone,
        private chatService: ChatService
    ) {
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(this.globalService.lang);
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(this.globalService.lang);
    }

    _showCheatCode() {
        if(!this.showCheatCode) this.showCheatCode = true;
        else this.showCheatCode = false;
    }

    submit($event: any = false) {
        if ($event) $event.preventDefault();
        let p1 = new Promise((resolve, reject) => {
            if (this.showCheatCode)
                this.http.checkCheatCode(this.cheatcode).subscribe(res => {
                    if (!res) {
                        this.notifications.showMessage('', 'ERROR.INVALID_CHEATCODE')
                        reject();
                    } else {
                        this._cheat = true;
                        resolve()
                    }
                })
            else resolve()
        }).then(() => this.http.postLogin(this.password, this.qr_text, this._2fa, this._cheat)
            .subscribe(
                res => {
                    this._cheat = false;
                    if (res['result'] == "ok") {
                        this.http.login(res['wallet']);
//                        this.globalService.big(true);
                        this.chatService.disconnect();
                        this.chatService.connect(res['wallet']['address']);
                        if (this._2fa && !this.cheat) {
                            localStorage.setItem('prev_key', this.key);
                            localStorage.setItem('prev_code', Date.now().toString());
                        }
                        this.router.navigateByUrl('notifications');
                    } else if (res['result'] == "error" && res['error'].indexOf('passphrase') != -1) {
                        this.notifications.showMessage('', 'ERROR.INVALID_PASSWORD');
                    } else if (res['result'] == "error" && res['error'].indexOf('code') != -1) {
                        this.notifications.showMessage('', 'ERROR.INVALID_CODE');
                    } else {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                },
                    err => {
                        this.notifications.showMessage('', 'ERROR.WHATEVER');
                    }
                )
            )
    }
    skipStep() {
        this.router.navigateByUrl('/buy/view-all');
    }

    cheat() {
        this._cheat = true;
        this.submit();
    }

    ngOnInit() {
        if (this.globalService.authorized) {
            this.router.navigateByUrl('/logout');
        }
        this.http.getSettings('pref2fa').subscribe(res => {
            if (res && res['value']) {
                switch (res['value']) {
                    case 'always':
                        this._2fa = true;
                        break;
                    case 'timeout':
                        let prev_key = localStorage.getItem('prev_code');
                        if (prev_key && (Date.now() - parseInt(prev_key) < MONTH)) {
                            this._2fa = false;
                        } else {
                            localStorage.removeItem('prev_code');
                            localStorage.removeItem('prev_key');
                            this._2fa = true;
                        }
                        break;
                    case 'never':
                        this._2fa = false;
                        break;
                    case 'disabled':
                        this._cheat = true;
                        break;
                    default:
                        this._2fa = false;
                        break;
                }

                let prev_key = localStorage.getItem('prev_code');
            }
        })

        setTimeout(function() {
            $('#password').focus()
         }, 100);

        this.http.checkWallet().subscribe(
            res => {
                this.zone.run(() => this.qr = res['qr']);
                if (res['key'] && res['qr'])
                    this.key = res['key'];
                if (res['result'] == 'ok' && !res['haveWallet']) {
                    this.router.navigateByUrl('/password');
                }

            },
            err => {
                this.router.navigateByUrl('/password');
            }
        )
    }

    clearCache() {
        localStorage.clear();
        this.http.saveSettings([{ key: 'pref2fa', value: 'always' }]).subscribe();
    }

    private qr: string = '';
    private qr_text: string = '';

}
