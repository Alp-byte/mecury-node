import { PricingService } from './pricing.service';
import { PriceComponent } from './price/price.component';
import { SharedModule } from "../../shared.module";

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
      CommonModule,
      SharedModule
    ],
    exports: [PriceComponent],
    declarations: [PriceComponent],
    providers: [PricingService]
  }) 
  export class PricingModule { }