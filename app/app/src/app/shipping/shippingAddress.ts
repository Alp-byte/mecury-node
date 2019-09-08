export interface ShippingAddress {
  contact_name: string;
  street1: string;
  city: string;
  state: string;
  country: string;
  postal_code?: number;
  phone: number;
  email: string;
  type: "residential" | "business";
}
