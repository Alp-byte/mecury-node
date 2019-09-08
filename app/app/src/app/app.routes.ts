import { SyncPageComponent } from './sync/sync-page/sync-page.component';
import { NewItemWizardComponent } from './new-item/new-item-wizard/new-item-wizard.component';
import { NewItemComponent } from './new-item/new-item/new-item.component';
import { AuthPlaceholderComponent } from './auth/auth-placeholder/auth-placeholder.component';
import { CategoriesComponent } from './view-items/categories/categories.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ChatComponent } from './chat/chat/chat.component';
import { ChatListComponent } from './chat/chat-list/chat-list.component';
import { ActiveDetailComponent } from './my-items/active-detail/active-detail.component';
import { ActiveComponent } from './my-items/active/active.component';
import { SoldComponent } from './my-items/sold/sold.component';
import { OrdersComponent } from './orders/orders/orders.component';
import { MyReviewsComponent } from './reviews/my-reviews/my-reviews.component';
import { UserReviewsComponent } from './reviews/user-reviews/user-reviews.component';
import { WriteReviewComponent } from './reviews/write-review/write-review.component';
import { ExpiredComponent } from './my-items/expired/expired.component';
import { CategoryDetailComponent } from './view-items/category-detail/category-detail.component';
import { BookmarkItemsComponent } from './dashboard/bookmark-items/bookmark-items.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { AliasComponent } from './common/alias/alias.component';
import { PasswordComponent } from './auth/password/password.component';
import { HelpComponent } from './common/help/help.component';
import { NewsDetailComponent } from './news/news-detail/news-detail.component';
import { TransactionsComponent } from './transactions/transactions/transactions.component';
import { NewsComponent } from './news/news/news.component';
import { WalletComponent } from './common/wallet/wallet.component';
import { PreferencesComponent } from './common/preferences/preferences.component';
import { DisputeComponent } from './orders/dispute/dispute.component';
import { AuthGuardUnauthorizedService } from './auth/auth-guard-unauthorized.service';
import { AuthGuardService } from './auth/auth-guard.service';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { SingleItemComponent } from './view-items/single-item/single-item.component';
import { PurchasesComponent } from './orders/purchases/purchases.component';
import { ViewAllComponent } from './view-items/view-all/view-all.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { Route } from "@angular/router";

export const routes: Route[] = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'home', component: HomeComponent},
    { path: 'login', component: LoginComponent},
    { path: 'buy/view-all', component: ViewAllComponent},
    { path: 'buy/view-all/:tag', component: ViewAllComponent},
    { path: 'buy/purchases', component: PurchasesComponent, canActivate: [AuthGuardService]},
    { path: 'buy/single-item/:id', component: SingleItemComponent, canActivate: [AuthGuardService]},
    { path: 'items/orders/:id', component: OrderDetailComponent, canActivate: [AuthGuardService]},
    { path: 'buy/dispute/:id', component: DisputeComponent, canActivate: [AuthGuardService]},
    { path: 'preferences', component: PreferencesComponent,  canActivate: [AuthGuardService]},
    { path: 'wallet', component: WalletComponent, canActivate: [AuthGuardService]},
    { path: 'news', component: NewsComponent},
    { path: 'news/:id', component: NewsDetailComponent, canActivate: [AuthGuardService]},
    { path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuardService]},
    { path: 'help', component: HelpComponent},
    { path: 'password', component: PasswordComponent},
    { path: 'alias', component: AliasComponent,  canActivate: [AuthGuardService]},
    { path: 'logout', component: LogoutComponent, canActivate: [AuthGuardService]},
    { path: 'bookmarks/items', component: BookmarkItemsComponent, canActivate: [AuthGuardService]},
    { path: 'newitem', component: NewItemComponent, canActivate: [AuthGuardService]},
    { path: 'newitem-wizard', component: NewItemWizardComponent,  canActivate: [AuthGuardService]},
    { path: 'search/category/:code', component: CategoryDetailComponent},
    { path: 'items/expired', component: ExpiredComponent, canActivate: [AuthGuardService]},
    { path: 'writeReview/:name/:address/:person', component: WriteReviewComponent, canActivate: [AuthGuardService]},
    { path: 'userReviews/:address', component: UserReviewsComponent, canActivate: [AuthGuardService]},
    { path: 'myReviews/:address', component: MyReviewsComponent, canActivate: [AuthGuardService]},
    { path: 'myReviews', component: MyReviewsComponent, canActivate: [AuthGuardService]},
    { path: 'items/orders', component: OrdersComponent, canActivate: [AuthGuardService]},
    { path: 'items/sold', component: SoldComponent, canActivate: [AuthGuardService]},
    { path: 'items/active', component: ActiveComponent, canActivate: [AuthGuardService]},
    { path: 'items/active/:id', component: ActiveDetailComponent, canActivate: [AuthGuardService]},
    { path: 'items/expired/:id', component: ExpiredComponent, canActivate: [AuthGuardService]},
    { path: 'chats', component: ChatListComponent, canActivate: [AuthGuardService]},
    { path: 'chat/:address/:goodsAddress', component: ChatComponent, canActivate: [AuthGuardService]},
    { path: 'notifications', component: DashboardComponent, canActivate: [AuthGuardService]},
    { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuardService]},
    { path: 'sync', component: SyncPageComponent, canActivate: [AuthGuardService]},
    { path: 'auth-placeholder', component: AuthPlaceholderComponent, canActivate: [AuthGuardUnauthorizedService]},
    { path: '**', redirectTo: 'login' }
  ];
