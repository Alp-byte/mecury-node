// auth guard for pages which need authorization
import { HttpService } from './../utils/http.service';
import { GlobalService } from './../utils/global.service';
import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';

@Injectable()
export class AuthGuardService implements CanActivate {
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
        if (auth) {            
            return true;
        } else {
            this.router.navigateByUrl('/auth-placeholder');
            return false;
        }
    }
}
