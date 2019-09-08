import { NewsModule } from './../news/news.module';
import { UtilsModule } from './../utils/utils.module';
import { ChatModule } from './../chat/chat.module';
import { SharedModule } from './../shared.module';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkItemsComponent } from './bookmark-items/bookmark-items.component';
import { NotificationTypeListItemComponent } from "./notification-type-list-item/notification-type-list-item.component";
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewedComponent } from './viewed/viewed.component';
import { SuggestComponent } from './suggest/suggest.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ChatModule,
    UtilsModule,
    NewsModule
  ],
  exports: [SuggestComponent],
  declarations: [BookmarkItemsComponent, DashboardComponent, ViewedComponent, SuggestComponent, NotificationTypeListItemComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DashboardModule { }
