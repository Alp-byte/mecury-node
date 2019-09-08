import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat/chat.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatInnerComponent } from './chat-inner/chat-inner.component';
import { ChatService } from './chat.service';
import { UtilsModule } from '../utils/utils.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    UtilsModule
  ],
  exports: [ChatInnerComponent],
  providers: [ChatService],
  declarations: [ChatComponent, ChatListComponent, ChatInnerComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ChatModule { }
