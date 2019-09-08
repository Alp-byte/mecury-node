import { BehaviorSubject } from 'rxjs';
import { HttpService } from './../utils/http.service';
import { GlobalService } from './../utils/global.service';
import { Injectable } from '@angular/core';

@Injectable()
export class GasService {
    public gasTimeout;

    public gasHTTP = new BehaviorSubject<number>(0);
    public gasAPI = new BehaviorSubject<number>(0);;
    public gasManual = new BehaviorSubject<number>(0);;

    constructor(
        private globalService: GlobalService,
        private http: HttpService
    ) {

    }

    cacheGas() {
        localStorage.setItem('gas', this.globalService.gas.getValue().toString());
        localStorage.setItem('gasOption', this.globalService.gasType.getValue().toString());
    }

    manageGas() {
        let subHttp = this.http.getSafelowGasHTTP().subscribe((gasHTTP: any) => {
            let option = localStorage.getItem('gasOption');
            if (gasHTTP && gasHTTP['safeLow']) {
                if (option == 'http') {
                    this.http.setGas(gasHTTP['safeLow'] / 10).subscribe(() => { });
                    localStorage.setItem('gas', (gasHTTP['safeLow'] / 10).toString());
                }
                this.gasHTTP.next(gasHTTP['safeLow'] / 10);
                subHttp.unsubscribe();
            }
        })

        let subSafelow = this.http.getSafelowGasAPI().subscribe((gasAPI: any) => {
            let option = localStorage.getItem('gasOption');
            if (gasAPI && gasAPI['price']) {
                if (option == 'api') {
                    localStorage.setItem('gas', (gasAPI['price'] / Math.pow(10, 9)).toString());
                    this.http.setGas(gasAPI['price'] / Math.pow(10, 9)).subscribe(() => { });
                }
                this.gasAPI.next(gasAPI['price'] / Math.pow(10, 9));
                subSafelow.unsubscribe();
            }
        })


    }

    setGasManual(manualVal = null) {
        if (manualVal) {
            this.gasManual.next(manualVal)
            this.http.setGas(manualVal).subscribe(() => { });
            localStorage.setItem('gasOption', 'manual');
            localStorage.setItem('gas', manualVal);
        }
    }

    setGasOption(option) {
        localStorage.setItem('gasOption', option);
        if (option == 'api') {
            this.http.setGas(this.gasAPI.value).subscribe(() => { });
            this.gasAPI.next(this.gasAPI.value);
        }
        if (option == 'http') {
            this.http.setGas(this.gasHTTP.value).subscribe(() => { });
            this.gasHTTP.next(this.gasHTTP.value);
        }
    }


    getSafelowGasManual() {
        try {
            this.globalService.gas.next(parseInt(localStorage.getItem('gas')));
            this.globalService.gasType.next(parseInt(localStorage.getItem('gasOption')));
        } catch (e) {
            this.globalService.gas.next(0);
            this.globalService.gasType.next('manual');
        }
    }


}