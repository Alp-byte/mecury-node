import { OrdersService } from './orders.service';
import { ChatModule } from './../chat/chat.module';
import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { DisputeComponent } from './dispute/dispute.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ChatModule,
    RouterModule    
  ],
  providers: [OrdersService],
  declarations: [OrdersComponent, OrderDetailComponent, PurchasesComponent, DisputeComponent]
})
export class OrdersModule { }
