import { Component, OnInit, OnDestroy } from "@angular/core";
import * as $ from "jquery";
import { ChatService, Chat } from "./../chat.service";
import { Router } from "@angular/router";

@Component({
  selector: "chat-list",
  templateUrl: "./chat-list.component.html",
  styleUrls: ["./chat-list.component.scss"]
})
export class ChatListComponent implements OnInit {
  public chats: Array<Chat>;
  constructor(public chatService: ChatService, private router: Router) {}
  ngOnInit() {
    this.chats = this.chatService.chats.getValue();

    this.chatService.chats.subscribe(chats => {

      this.chats = chats;
    });
  }

  openChat(chat) {
    this.router.navigateByUrl("/chat/" + chat["address"] + "/" + chat["goods"]["address"]);
  }
}
