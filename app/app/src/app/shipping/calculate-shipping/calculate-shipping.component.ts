import { ParcelItem, ShippingParcel } from "./../parcel";
import { ShippingAddress } from "./../shippingAddress";
import { ShippingService } from "./../shipping.service";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-calculate-shipping",
  templateUrl: "./calculate-shipping.component.html",
  styleUrls: ["./calculate-shipping.component.css"]
})
export class CalculateShippingComponent implements OnInit {
  @Output() calculated: EventEmitter<any> = new EventEmitter<any>();

  //TODO: wire up with reactive forms on the component's template for user to input all the data
  public shippingAccounts: any[] = [];
  public to: ShippingAddress;
  public from: ShippingAddress;
  public item: ParcelItem;



  constructor(private shippingService: ShippingService) {}

  ngOnInit() {
    // TODO: put in your own testing API key
    this.shippingService.authorize("3a52f3c1-9185-45c7-b0c8-38720e2e09d2");
    this.shippingService.getShipperAccounts().subscribe((accounts: any) => {

      this.shippingAccounts = accounts.data.shipper_accounts;
    });
  }

  public calculate() {
    //TODO: make this request 100% working and retriving the data

    let item: ParcelItem = {
      description: "Food Bar",
      quantity: 2,
      price: {
        amount: 3,
        currency: "JPY"
      },
      weight: {
        value: 0.6,
        unit: "kg"
      }
    };
    let from: ShippingAddress = {
      contact_name: "Yin Ting Wong",
      street1: "Flat A, 29/F, Block 17\nLaguna Verde",
      city: "Hung Hom",
      state: "Kowloon",
      country: "HKG",
      phone: 96679797,
      email: "test@test.test",
      type: "residential"
    };
    let to: ShippingAddress = {
      contact_name: "Mike Carunchia",
      street1: "9504 W Smith ST",
      city: "Yorktown",
      state: "Indiana",
      postal_code: 47396,
      country: "USA",
      phone: 7657168649,
      email: "test@test.test",
      type: "residential"
    };
    this.shippingService.calculateFees(
      this.shippingAccounts[0]["id"],
      [this.shippingService.formParcel('someItem', 1, 30, 20, 15, [item])],
      from,
      to
    ).subscribe((calculated: any) => {
      //TODO: check the response and adapt it for what we need to input into the item, then emit into singleItem's view to show prices to the buyer

      this.calculated.emit(calculated);
    }, err => {
      //TODO: catch the error and show it on the FE

    })
  }
}
