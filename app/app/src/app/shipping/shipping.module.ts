import { ShippingService } from './shipping.service';
import { NgModule } from '@angular/core';
import { CalculateShippingComponent } from './calculate-shipping/calculate-shipping.component';
import { CreateShipperComponent } from './create-shipper/create-shipper.component';
import { SetShippingAddressComponent } from './set-shipping-address/set-shipping-address.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [
      ReactiveFormsModule
    ],
    exports: [
      CalculateShippingComponent,
      CreateShipperComponent,
      SetShippingAddressComponent
    ],
    providers: [
        ShippingService
    ],
    declarations: [CalculateShippingComponent, CreateShipperComponent, SetShippingAddressComponent]
  })
  export class ShippingModule { }
