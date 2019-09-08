import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { RouterModule } from '@angular/router';
import { ChatModule } from './../chat/chat.module';
import { AppCommonModule } from './../common/common.module';
import { DashboardModule } from './../dashboard/dashboard.module';
import { UtilsModule } from './../utils/utils.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewAllComponent } from './view-all/view-all.component';
import { SingleItemComponent } from './single-item/single-item.component';
import { CategoriesComponent } from './categories/categories.component';
import { ItemListComponent } from './item-list/item-list.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { ShippingModule } from '../shipping/shipping.module';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ViewItemsService } from './view-items.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    UtilsModule,
    DashboardModule,
    ChatModule,
    RouterModule,
    ShippingModule,
    NguiAutoCompleteModule,
    AngularMultiSelectModule,
  ],
  declarations: [ViewAllComponent, SingleItemComponent, CategoriesComponent, ItemListComponent, CategoryDetailComponent],
  providers: [ViewItemsService]
})
export class ViewItemsModule { }
