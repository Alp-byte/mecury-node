import { GlobalService } from './../utils/global.service';
import { HttpService } from './../utils/http.service';
import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
// auth guard for pages which do not require authorization
@Injectable()
export class AuthGuardUnauthorizedService implements CanActivate {
    constructor(
        private router: Router,
        private http: HttpService,
        private globalService: GlobalService
    ) {}
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        let auth = localStorage.getItem('auth');
        if (auth) auth = JSON.parse(auth);
        if (auth) {
            this.router.navigateByUrl('/buy/view-all');            
            return false;
        } else {            
            return true; 
        }
    }
}
