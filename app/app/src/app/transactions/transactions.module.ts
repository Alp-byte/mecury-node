import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionsListComponent } from './transactions-list/transactions-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [TransactionsComponent, TransactionsListComponent]
})
export class TransactionsModule { }
