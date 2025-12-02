import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValuePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ShoppingCartService, ShoppingCart as CartModel, ShoppingCartItem } from '../services/shopping-cart.service';
import { AuthService } from '../auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.css'
})
export class ShoppingCart implements OnInit, OnDestroy {
  cart: CartModel | null = null;
  private userSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;

  constructor(private shoppingCartService: ShoppingCartService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      if (user) {
        this.loadCart(user.uid);
      } else {
        this.cart = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  private loadCart(userId: string) {
    this.cartSubscription = this.shoppingCartService.getCart(userId).subscribe({
      next: (cart) => {
        this.cart = cart;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }

  getTotalPrice(): number {
    if (!this.cart || !this.cart.items) return 0;
    return Object.values(this.cart.items).reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getTotalItems(): number {
    if (!this.cart || !this.cart.items) return 0;
    return Object.values(this.cart.items).reduce((total, item) => total + item.quantity, 0);
  }

  removeItem(productKey: string) {
    this.shoppingCartService.removeItem(productKey).subscribe({
      next: () => {
        console.log('Item removed from cart');
      },
      error: (error) => {
        console.error('Error removing item:', error);
        alert('Failed to remove item from cart.');
      }
    });
  }

  updateQuantity(productKey: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(productKey);
      return;
    }
    this.shoppingCartService.updateQuantity(productKey, newQuantity).subscribe({
      next: () => {
        console.log('Quantity updated');
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity.');
      }
    });
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.shoppingCartService.clearCart().subscribe({
        next: () => {
          console.log('Cart cleared');
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          alert('Failed to clear cart.');
        }
      });
    }
  }

  continueShopping() {
    // Add any additional logic here, e.g., analytics tracking
    console.log('Continuing shopping...');
    this.router.navigate(['/']);
  }

  proceedToCheckout() {
    this.router.navigate(['/check-out']);
  }
}
