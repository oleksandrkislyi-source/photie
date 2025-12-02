import { Injectable } from '@angular/core';
import { Database, ref, query, orderByChild, equalTo, get, push, set } from '@angular/fire/database';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private database: Database) {}

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const ordersRef = ref(this.database, 'orders');
    const snapshot = await get(ordersRef);
    const ordersData = snapshot.val();
    if (ordersData) {
      const allOrders = Object.keys(ordersData).map(key => ({
        ...ordersData[key],
        id: key
      }));
      return allOrders.filter(order => order.userId === userId).sort((a, b) => b.datePlaced - a.datePlaced); // Sort by date descending
    } else {
      return [];
    }
  }

  async saveOrder(order: Order): Promise<void> {
    const ordersRef = ref(this.database, 'orders');
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, order);
  }
}
