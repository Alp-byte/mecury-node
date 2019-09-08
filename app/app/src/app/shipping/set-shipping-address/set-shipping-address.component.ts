import { Output, EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ShippingAddress } from '../shippingAddress';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-set-shipping-address',
  templateUrl: './set-shipping-address.component.html',
  styleUrls: ['./set-shipping-address.component.css']
})
export class SetShippingAddressComponent implements OnInit {
  // TODO: add shipping reactive Form here and wire it up with the template to let user put in the address here
  // TODO, part 2: let user chose of one of saved addressses
  public shippingAddressForm: FormGroup = new FormGroup({});
  @Output() formFilled: EventEmitter<ShippingAddress> = new EventEmitter<ShippingAddress>();

  constructor() { }

  ngOnInit() {
    //TODO: wire up on shipping address form updates here and update the shippingAddress object through the
    this.shippingAddressForm.valueChanges.subscribe((formValue: ShippingAddress) => {
      // if no errors, emit
      if(!this.formFilled.hasError) this.formFilled.emit(formValue);
    })
  }

}
