import { HttpClient } from '@angular/common/http';
import { GlobalService } from './../utils/global.service';
import { HttpService, API } from './../utils/http.service';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NewItemService {
    public isIpfs;
    constructor(
        private httpService: HttpService,
        private http: HttpClient,
        private globalService: GlobalService
    ) {

    }

    newItemIpfs(data, id = null) {
        // let callName = 'listItem';
        let callName = 'ipfsStoreSell';
        let args = {
            "requestType": callName,
            "goods": data,
            "options": {},
            // "pubKey": this.globalService.wallet['pubKey'],
            // "pubkey": this.globalService.wallet['pubKey']
        };


        let actionId = this.httpService.createAction_({
            text: 'Listing a new Item',
            item: data.title,
            itemObj: data,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'newitem'
        })

        return new Observable((observer) => {
            if (this.httpService.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.httpService.actionInProgress = true;
            if (this.httpService.isElectron) {
                this.httpService.ipcRenderer.send('api', args)
                this.httpService.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    this.httpService.actionInProgress = false;
                    if (res.result == 'ok') {
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'newitem', data: res, itemObj: data })
                    }
                    else {
                        this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: res })
                    }


                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map((res: any) => res.json()).subscribe(res => {
                    this.httpService.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'newitem', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: res })

                    observer.next(res);
                })
            }
        });

    }

    newItemETH(data, id = null) {
        // let callName = 'listItem';
        let callName = 'listItem';
        let args = {
            "requestType": callName,
            "goods": data,
            "pubKey": this.globalService.wallet['pubKey'],
            "pubkey": this.globalService.wallet['pubKey']
        };


        let actionId = this.httpService.createAction_({
            text: 'Listing a new Item',
            item: data.title,
            itemObj: data,
            status: 'COMMON.RESPONSE_NOT_FOUND',
            code: 'newitem'
        })

        return new Observable((observer) => {
            if (this.httpService.actionInProgress) {
                this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: { result: "error", error: "Another action in progress" } })
                observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
            } else this.httpService.actionInProgress = true;
            if (this.httpService.isElectron) {
                this.httpService.ipcRenderer.send('api', args)
                this.httpService.ipcRenderer.once(callName, (event, arg) => {
                    let res = JSON.parse(arg);
                    this.httpService.actionInProgress = false;
                    if (res.result == 'ok') {
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'newitem', data: res, itemObj: data })
                    }
                    else {
                        this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: res })
                    }


                    observer.next(res);

                })
            } else {
                this.http.post(API, args).map((res: any) => res.json()).subscribe(res => {
                    this.httpService.actionInProgress = false;
                    if (res.result == 'ok')
                        this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'newitem', data: res })
                    else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'newitem', data: res })

                    observer.next(res);
                })
            }
        });

    }


    newItem(data) {
        let ipfsPreference = this.globalService.ipfsPreference.value;

        if(ipfsPreference) return this.newItemIpfs(data);
        else return this.newItemETH(data);
    }
}