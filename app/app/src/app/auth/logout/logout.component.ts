import { SocketService } from './../../utils/socket.service';
import { Router } from '@angular/router';
import { HttpService } from './../../utils/http.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {
    constructor(
        private http: HttpService,
        private router: Router,
        private socket: SocketService,
        private _location: Location,
    ) {

    }
    logout($event) {
        $event.preventDefault();
        this.socket.disconnect();
        this.http.postLogout()
            .subscribe(
            res => {
                this.http.logout();
                
            },
            err => {

            })
    }

    cancelLogout($event) {
        $event.preventDefault();
        this._location.back();
    }
}