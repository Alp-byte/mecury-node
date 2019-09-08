import { ShippingAddress } from "./shippingAddress";

export interface ShippingParcel {
  description: string;
  box_type: string;
  weight: {
    value: number;
    unit: 'kg' | 'lb' | 'oz' | 'g';
  };
  dimension: {
    width: number;
    height: number;
    depth: number;
    unit: 'cm' | 'in' | 'mm' | 'm' | 'ft' | 'yd'
  };
  items: ParcelItem[];
}

export interface ParcelItem {
  description: string;
  quantity: number;
  price: {
    amount: number;
    currency: string;
  };
  weight: {
    value: number;
    unit: 'kg' | 'lb' | 'oz' | 'g';
  };
}
