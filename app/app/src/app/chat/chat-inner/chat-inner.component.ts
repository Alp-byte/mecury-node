import { ChatService } from "./../chat.service";
import * as $ from "jquery";
import { Component, OnInit, Input, EventEmitter, OnDestroy } from "@angular/core";

@Component({
  selector: "chat-inner",
  templateUrl: "./chat-inner.component.html",
  styleUrls: ["./chat-inner.component.scss"]
})
export class ChatInnerComponent implements OnInit, OnDestroy {
  disposer;

  //in case of embedded chat
  @Input() address: string;
  @Input() goodsAddress: string;
  @Input() goodsTitle: string;
  @Input() embed: boolean;
  @Input() type: string;
  @Input() goInit: EventEmitter<any>;
  @Input() sender: string;

  //in case of chat page
  @Input() chatID: number = -1;

  public messages = [];
  public encrypted = true;
  public message = "";
  public chat;
  public updateUnread: EventEmitter<any> = new EventEmitter<any>();
  constructor(private chatService: ChatService) { }
  ngOnInit() {

    if (this.goInit)
      this.goInit.subscribe((args: any) => {
        this.address = args.address;
        this.goodsAddress = args.goodsAddress;
        this.goodsTitle = args.goodsTitle;
        this.type = args.type;
        this.sender = args.sender;
        this.initChat();
      });
    else {
      // in case of running chat not from the embed page, include info from the chat object

      let chats = this.chatService.chats.getValue();
      let chat = chats[this.chatID];
      this.address = chat.address;
      this.goodsAddress = chat.goods.address;
      this.goodsTitle = chat.goods.title;
      this.type = chat.type;
      this.sender = chat.goods.sender;
      this.initChat();
    }
  }

  initChat() {

    let chats = this.chatService.chats.getValue();
    if (this.chatID == -1)

    this.chatID = this.chatService.findChatID(
      this.address,
      this.goodsAddress
    );
    if (this.chatID != -1) {

      chats[this.chatID].unread = false;
      this.chatService.chats.next(chats);
      this.messages = chats[this.chatID].messages;
      this.chatService.openChat(chats[this.chatID]);
    }

    this.disposer = this.chatService.chats.subscribe(chats => {
      if (this.chatID == -1)
        this.chatID = this.chatService.findChatID(
          this.address,
          this.goodsAddress
        );
      if (this.chatID != -1) {
        this.messages = chats[this.chatID].messages;
      }
      this.scrollMessages();
    });
  }

  sendMessage() {
    let message = {
      subject: this.address,
      message: this.message,
      goods: {
        address: this.goodsAddress,
        title: this.goodsTitle,
        sender: this.sender
      },
      type: this.type
    };
    this.chatService.sendMessage(message, this.chatID);
    this.message = "";
  }

  scrollMessages() {
    setTimeout(() => {
      document.getElementById(
        "messages"
      ) ? document.getElementById("messages").scrollTop = document.getElementById(
        "messages"
      ).scrollHeight : null;
    }, 50);
  }

  today(td) {
    var now = new Date();
    var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return td > startOfDay.getTime();
  }

  ngOnDestroy() {
    this.chatService.closeChat();
    if (this.disposer) this.disposer.unsubscribe();
  }
}
