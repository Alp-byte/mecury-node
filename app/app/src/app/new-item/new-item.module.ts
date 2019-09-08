import { NewItemService } from './new-item.service';
import { ShippingModule } from './../shipping/shipping.module';
import { UtilsModule } from './../utils/utils.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewItemComponent } from './new-item/new-item.component';
import { NewItemWizardComponent } from './new-item-wizard/new-item-wizard.component';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ImageCropperModule,
    UtilsModule,
    ShippingModule
  ],
  declarations: [NewItemComponent, NewItemWizardComponent],
  providers: [NewItemService]
})
export class NewItemModule { }
