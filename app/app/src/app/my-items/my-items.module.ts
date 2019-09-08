import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoldComponent } from './sold/sold.component';
import { ExpiredComponent } from './expired/expired.component';
import { ActiveComponent } from './active/active.component';
import { ActiveDetailComponent } from './active-detail/active-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  declarations: [SoldComponent, ExpiredComponent, ActiveComponent, ActiveDetailComponent]
})
export class MyItemsModule { }
