import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order';

@Component({
  selector: 'app-my-orders',
  imports: [],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = false;
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      if (user) {
        this.loadOrders(user.uid);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private async loadOrders(userId: string) {
    this.isLoading = true;
    try {
      this.orders = await this.orderService.getOrdersByUserId(userId);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading orders:', error);
      this.orders = [];
    } finally {
      this.isLoading = false;
    }
  }

  getOrderItems(order: Order): { product: any; quantity: number }[] {
    return Object.values(order.items);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }
}
