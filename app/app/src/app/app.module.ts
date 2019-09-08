import { AuthGuardUnauthorizedService } from './auth/auth-guard-unauthorized.service';
import { AuthGuardService } from './auth/auth-guard.service';
import { NotificationsService } from './utils/notifications.service';
import { SocketService } from './utils/socket.service';
import { NewsModule } from './news/news.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UtilsModule } from './utils/utils.module';
import { ViewItemsModule } from './view-items/view-items.module';
import { NewItemModule } from './new-item/new-item.module';
import { MyItemsModule } from './my-items/my-items.module';
import { ImageCropperModule } from './utils/ng2-img-cropper/src/imageCropperModule';
import { EshopModule } from './eshop/eshop.module';
import { AppCommonModule } from './common/common.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GlobalErrorHandler } from './utils/globalErrorHandler';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
// import { Http, HttpModule, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarSearchComponent } from './navbar-search/navbar-search.component';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { routes } from './app.routes';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TourNgxBootstrapModule } from 'ngx-tour-ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Http, HttpModule } from '@angular/http';
import { SyncModule } from './sync/sync.module';

class CustomLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return Observable.of({ "KEY": "Value" });
  }
}
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    HomeComponent,
    SidebarComponent,
    NavbarSearchComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NguiAutoCompleteModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],

      }
    }),    
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot(),
    AuthModule,
    ChatModule,
    DashboardModule,
    AppCommonModule,
    EshopModule,
    MyItemsModule,
    NewItemModule,
    ViewItemsModule,
    UtilsModule,
    TranslateModule,
    TransactionsModule,
    ReviewsModule,
    OrdersModule,
    NewsModule,
    SyncModule,
    HttpClientModule,
    PopoverModule.forRoot(),
    TourNgxBootstrapModule.forRoot()
  ],
  providers: [
    // {
    //   provide: ErrorHandler,
    //   useClass: GlobalErrorHandler
    // }
    SocketService,
    NotificationsService,
    AuthGuardService,
    AuthGuardUnauthorizedService,
    TranslateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
