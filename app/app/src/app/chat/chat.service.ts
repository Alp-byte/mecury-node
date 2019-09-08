import { Http } from '@angular/http';
import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SocketService } from "../utils/socket.service";
import * as Socket from "socket.io-client";
import { GlobalService } from "../utils/global.service";


// IPs to test chat with
// const URL = "http://127.0.0.1:4200";
// const HttpURL = "http://127.0.0.1:3569";
const URL = "http://62.109.16.138:4200";
const HttpURL = "http://62.109.16.138:3569";
// const URL = "http://54.37.131.238:4200";
// const HttpURL = "http://54.37.131.238:3569";

export interface ChatGoods {
  address: string;
  title: string;
  sender: string;
}
export interface Chat {
  messages: object[];
  address: string;
  unread?: boolean;
  date: number;
  goods: ChatGoods;
  type: string;
}
@Injectable()
export class ChatService {
  private socket;
  public chats: BehaviorSubject<Array<Chat>>;
  private currentOpenedChat: Chat;
  public token: string;
  public secret;
  constructor(
    private socketService: SocketService,
    private gs: GlobalService,
    private router: Router,
    private http: Http
  ) {
    this.chats = new BehaviorSubject<Array<Chat>>([]);
  }

  subscribe() {
    let temp = localStorage.getItem("chat");
    let chats;
    if (temp) chats = JSON.parse(temp);
    else chats = [];
    this.chats.next(chats);
  }

  connect(address) {
    // this.http.post(URL + '/login', { secret: this.secret }).map(res => res.json()).subscribe((res: any) => {

    // this.token = res.token;
    // setTimeout(() => {
    console.log('connecting to the SOCKET');
    this.socket = Socket(URL);
    console.log('thissocket', this.socket);
    // this.socket = Socket(URL, {
    //   query: 'token=' + this.token
    // });

    setTimeout(() => {
      this.socket.emit("join", { address: address });
      console.log('socket emit JOIN', address);

      this.socket.on("message", message => {
        this.newMessage(message);
      }, 150);



    })

  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  findChatID(address, goodsAddress): number {
    let chatNum;
    let chats = this.chats.getValue();
    let found = -1;
    chats.forEach((chat, index) => {
      if (chat.address == address && chat.goods.address == goodsAddress) {
        found = index;
      }
    });
    return found;
  }

  newMessage(message) {
    let chats = this.chats.getValue();
    let chatID = this.findChatID(
      message["sender"],
      message["goods"]["address"]
    );
    if (chatID == -1) {
      chatID = this.findChatID(message["sender"], message['goods']['address']);
    }
    if (chatID == -1) {
      chats.push(this.createChat(message));
      chatID = chats.length - 1;
    }
    chats[chatID].messages.push(message);

    if (
      this.currentOpenedChat &&
      this.currentOpenedChat.address == message["sender"] &&
      this.currentOpenedChat.goods.address == message["goods"]["address"]
    ) {
      chats[chatID].unread = false;
    } else chats[chatID].unread = true;

    this.chats.next(chats);

  }

  sendMessage(message, chatID) {
    this.socket.emit("message", message);
    let chats = this.chats.getValue();
    message["sender"] = "me";
    message["date"] = Date.now();
    if (chatID == -1) {
      chatID = this.findChatID(message["subject"], message['goods']['address']);
    }

    if (chatID == -1) {
      chats.push(this.createChat(message, true));
      chatID = chats.length - 1;
    }
    chats[chatID].messages.push(message);
    this.chats.next(chats);

  }

  createChat(message, mine = false): Chat {
    let address = message["sender"];
    if (mine) address = message["subject"];
    let chat = {
      messages: [],
      goods: {
        address: message["goods"]["address"],
        title: message["goods"]["title"],
        sender: message["goods"]["sender"]
      },
      type: message["type"],
      address: address,
      date: message["date"]
    };
    return chat;
  }

  openChat(chat: Chat) {
    this.currentOpenedChat = chat;
  }

  closeChat() {
    delete this.currentOpenedChat;
  }

  saveChats() {
    localStorage.setItem("chat", JSON.stringify(this.chats.getValue()));
  }

  getType(chat: Chat): string {
    if (chat.goods.sender == this.gs.wallet.address) return "Buyer";
    else return "Seller";
  }
}
