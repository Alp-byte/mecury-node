import { HttpClient } from "@angular/common/http";
import { HttpService } from "./../utils/http.service";
import { ShippingParcel, ParcelItem } from "./parcel";
import { Injectable } from "@angular/core";
import { ShippingAddress } from "./shippingAddress";

@Injectable()
export class ShippingService {
  private postmenKey: string;
  private headers: any;

  constructor(private http: HttpClient) {}

  authorize(key: string = null) {
    if (!key) key = localStorage.getItem('postmenKey');
    if (!key) return false;
    this.postmenKey = key;
    this.headers = {
      "content-type": "application/json",
      "postmen-api-key": key
    };
    localStorage.setItem("postmenKey", key);
    return true;
  }

  logout() {
    this.postmenKey = null;
    this.headers = null;
    localStorage.removeItem("postmenKey");
  }

  getShipperAccounts() {
    return this.http.get('https://sandbox-api.postmen.com/v3/shipper-accounts', { headers: this.headers });
  }

  getShipperAccount(account_id: string) {
    return this.http.post('https://sandbox-api.postmen.com/v3/shipper-accounts/' + account_id, {headers: this.headers});
  }

  formParcel(
    itemName: string,
    weight: number,
    width: number,
    height: number,
    depth: number,
    items: ParcelItem[]
  ) {
    let parcel: ShippingParcel = {
      description: 'BitBoost market shipment of ' + itemName,
      box_type: 'custom',
      weight: {
        value: weight,
        unit: 'kg'
      },
      dimension: {
        width: width,
        height: height,
        depth: depth,
        unit: 'cm'
      },
      items: items
    }
    return parcel;
  }

  formCalculatingRequest(shipperAccount: string, parcels: ShippingParcel[], from: ShippingAddress, to: ShippingAddress) {
    return {
      async: false,
      shipper_accounts: [
        {
          id: shipperAccount
        }
      ],
      shipment: {
        parcels: parcels,
        ship_from: from,
        ship_to: to
      }
    }
  }

  calculateFees(
    shipperAccount: string,
    parcels: ShippingParcel[],
    from: ShippingAddress,
    to: ShippingAddress
  ) {
    return this.http.post('https://sandbox-api.postmen.com/v3/rates', this.formCalculatingRequest(shipperAccount, parcels, from, to), {headers: this.headers});
  }

  autocompleteAddress(addressInput) {
    // TODO: autocomplete address perhaps from google maps
    return addressInput;
  }
}
