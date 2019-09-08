// A component for creation of a wallet if there is none found
import { SocketService } from "./../../utils/socket.service";
import { NotificationsService } from "./../../utils/notifications.service";
import { GlobalService } from "./../../utils/global.service";
import { Router } from "@angular/router";
import { HttpService } from "./../../utils/http.service";
import { TranslateService } from "@ngx-translate/core";
import { Component, OnInit, NgZone } from "@angular/core";
import * as $ from "jquery";
@Component({
  selector: "app-password",
  templateUrl: "./password.component.html",
  styleUrls: ["./password.component.scss"]
})
export class PasswordComponent {
  private password: string = "";
  private error: boolean = false;
  private repeatPassword: string = "";
  private repeatError: boolean = false;
  private button: boolean = false;
  private sent: boolean = false;
  private code: string;
  private wallet: any;
  constructor(
    private translate: TranslateService,
    private http: HttpService,
    private router: Router,
    private globalService: GlobalService,
    private notifications: NotificationsService,
    private socket: SocketService,
    private zone: NgZone
  ) {
  }

  submit($event) {
    localStorage.clear();
    $event.preventDefault();
    this.http.createWallet(this.password).subscribe(
      res => {
        if (res["result"] == "ok") {
          this.http.saveSettings([{ key: "pref2fa", value: "timeout" }]);
          localStorage.clear();

          this.http.postLogin(this.password, "").subscribe(postLoginRes => {
            if (res["result"] == "ok") { } else if (
              res["result"] == "error" &&
              res["error"].indexOf("passphrase") != -1
            ) {
              this.notifications.showMessage("", "ERROR.INVALID_PASSWORD");
            } else {
              this.notifications.showMessage("", "ERROR.WHATEVER");
            }
          });

          this.http.createCheatCode().subscribe((code: string) => {
            this.code = code;
            this.wallet = res;
            this.sent = true;
          });
        } else if (
          res["result"] == "error" &&
          res["error"].indexOf("passphrase") != -1
        ) {
          this.notifications.showMessage("", "ERROR.INVALID_PASSWORD");
        } else {
          this.notifications.showMessage("", "ERROR.WHATEVER");
        }
      },
      err => {
        this.notifications.showMessage("", "ERROR.WHATEVER");
      }
    );
  }

  isActive(lang) {
    return lang == this.globalService.lang;
  }

  selectLanguage(lang, $event) {
    this.globalService.setLanguage(lang);
  }

  go() {
//    this.globalService.big(true);
    this.http.login(this.wallet["wallet"]);
    localStorage.removeItem("tour_given");
    this.router.navigateByUrl("notifications");
  }

  input($event) {
    this.zone.run(() => {
      if ($event.length < 6) {
        this.error = true;
        this.button = false;
      } else {
        this.error = false;
        if (this.repeatPassword.length > 0 && this.repeatPassword == $event) {
          this.button = true;
          this.repeatError = false;
        } else if (
          this.repeatPassword.length > 0 &&
          this.repeatPassword != $event
        ) {
          this.repeatError = true;
        }
      }
    });
  }

  inputRepeat($event) {
    this.zone.run(() => {
      if ($event != this.password) {
        this.button = false;
        this.repeatError = true;
      } else {
        this.repeatError = false;
        if (!this.error) {
          this.button = true;
        }
      }
    });
  }
}
