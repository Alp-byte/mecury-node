import { PricingModule } from './pricing/pricing.module';
import { DecimalsPipe } from './decimals.pipe';
import { DecimalsDirective } from './decimals.directive';
import { StylesheetService } from './stylesheet.service';
import { NotificationsService } from './notifications.service';
import { HttpService } from './http.service';
import { GlobalService } from './global.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared.module';
import { ImageCropperModule } from './ng2-img-cropper/src/imageCropperModule';
import { ImageCropperComponent } from './ng2-img-cropper/src/imageCropperComponent';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridPipe } from './grid.pipe';
import { DropdownMenuComponent } from './dropdown-menu/dropdown-menu.component';
import { TruncatePipe } from './truncate.pipe';
import { SenderComponent } from './sender/sender.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ThemesComponent } from './themes/themes.component';
import { ClearerComponent } from './clearer.component';

@NgModule({
  imports: [
    CommonModule,
    ImageCropperModule,
    SharedModule,
    FormsModule,
    BrowserModule,
    PricingModule
  ],
  exports: [SenderComponent, DropdownMenuComponent, TruncatePipe, ConfirmationComponent, ClearerComponent, PricingModule],
  declarations: [GridPipe, DropdownMenuComponent, TruncatePipe, SenderComponent, ConfirmationComponent, ThemesComponent, ClearerComponent, DecimalsDirective, DecimalsPipe],
  providers: [HttpService, GlobalService, NotificationsService, StylesheetService]
}) 
export class UtilsModule { }
