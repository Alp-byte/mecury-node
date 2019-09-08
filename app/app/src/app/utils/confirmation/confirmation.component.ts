import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { GlobalService } from '../global.service';
import { SyncService } from '../../sync/sync.service';

@Component({
    selector: 'confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
    private type: string = 'pop';
    private input: string = '';
    public gas;
    public bbt;
    constructor(
        private gs: GlobalService,
        private router: Router,
        private syncService: SyncService
    ) {

    }

    private modal: boolean = false;
    ngOnInit() {
        this.gs.confirmation.subscribe(res => {
            if (res != "no" && res != "yes") {
                this.modal = true
                console.log('confirmation emitter', res);
                if (res && res.gas) {
                    this.type = res.type
                    this.gas = res.gas;
                    this.bbt = res.bbt;
                } else {
                    this.type = res
                }

                if(res == 'wait_for_sync') {
                    this.syncService.syncList.subscribe(syncList => {
                        if(syncList[0].time) this.close();
                    })
                }
            }

        })
    }
    close() {
        this.modal = false;
        this.gas = null;
        this.gs.confirmation.emit('no');
    }
    cancel() {
        this.modal = false;
        this.gas = null;
        this.gs.confirmation.emit('no');
    }
    confirm() {
        this.modal = false;
        this.gas = null;
        this.gs.confirmation.emit('yes');
    }
    submit() {
        this.modal = false;
        this.gs.confirmation.emit({ type: 'input', value: this.input });
    }
    goWallet() {
        this.modal = false;
        this.gas = null;
        this.router.navigateByUrl('wallet');
    }
    goToIpfsDescription() {
        this.modal = false;
        this.router.navigateByUrl('help');
    }
}