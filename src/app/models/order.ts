export interface Order {
  id?: string;
  userId: string;
  datePlaced: number;
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    paymentMethod: string;
  };
  items: { [key: string]: { product: any; quantity: number } };
  total: number;
}
