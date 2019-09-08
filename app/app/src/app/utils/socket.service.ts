// deprecated in favor of ChatService

import { GlobalService } from './global.service';
import { Observable } from 'rxjs';
import { Injectable, EventEmitter, OnInit } from "@angular/core";
import * as Socket from 'socket.io-client';
const algorithm = 'aes-256-ctr';
import { UUID } from 'angular2-uuid';

const URL = "http://138.197.44.207:4200";
// const URL = "http://127.0.0.1:4200";
const NOTIFICATION_CODE = "";
const REVIEW_CODE = "";
@Injectable()
export class SocketService implements OnInit {
    private socket;

    constructor(
        private gs: GlobalService
    ) {

    }

    ngOnInit() {

    }
    //TODO: switch to real encrypted chat solution
    encrypt(text, password) {

        // var cipher = crypto.createCipher(algorithm, password)
        // var crypted = cipher.update(text, 'utf8', 'hex')
        // crypted += cipher.final('hex');
        // return crypted;
        return text;
    }

    decrypt(text, password) {
        // var decipher = crypto.createDecipher(algorithm, password)
        // var dec = decipher.update(text, 'hex', 'utf8')
        // dec += decipher.final('utf8');
        // return dec;
        return text;
    }


    init(address) {
        this.socket = Socket(URL);
        this.subscribeMessage();
        this.joinByAddress(address);

    }

    disconnect() {
        if (this.socket) this.socket.disconnect();
    }

    joinByAddress(address) {
        this.socket.emit('join', { address: address });
    }

    subscribeMessage() {
        this.socket.on('message', res => {

            let pass = this.gs.getAddressEncryption(res.sender);
            let tempArr = res.message.split('e?>>');

            if (tempArr[1]) {
                let pass = tempArr[0];
                let enc = this.gs.addAddressEncryption(res.sender, pass);
                res.message = this.decrypt(tempArr[1], pass);
            } else if (pass) {
                res.message = this.decrypt(res.message, pass);
            }


            if (res.message == 'Encryption evolved') {
                localStorage.removeItem('encrypted_' + res.sender);
            }


            this.gs.newMessage.emit(res);

            this.gs.manageBadges(this.gs.notificationsList());
        })


    }
    //TODO: do something when one of users clears cache
    sendMessage(message, subject) {
        let pass: any = this.gs.getAddressEncryption(subject);
        // if(!pass) {
        //     pass = UUID.UUID();
        //     let enc = this.gs.addAddressEncryption(subject, pass);
        //     message = pass+'e?>>'+this.encrypt(message, pass);
        // } else
        message = this.encrypt(message, pass);
        this.socket.emit('message', {
            message: message, subject: subject, meta: {
                pass: pass,
                item: 'itemID333'
            }
        })
    }

}
