import { ChatService } from './../chat.service';
import { GlobalService } from './../../utils/global.service';
import { SocketService } from './../../utils/socket.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery'
// a wrapper for a chat
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
    public goodsAddress;
    public address;
    public chatID;
    public chat;
    constructor(
        public chatService: ChatService,
        private gs: GlobalService,
        private route: ActivatedRoute
    ) {

    }
    ngOnInit() {
        this.route.params
            .subscribe((params: any) => {
              this.address = params['address'];
              this.goodsAddress = params['goodsAddress'];
              this.chatID = this.chatService.findChatID(this.address, this.goodsAddress);
              this.chat = this.chatService.chats.getValue()[this.chatID];
            });

    }
}
