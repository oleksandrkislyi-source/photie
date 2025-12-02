import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShoppingCartService, ShoppingCart } from '../services/shopping-cart.service';
import { AuthService } from '../auth';
import { OrderService } from '../services/order.service';
import { Subscription } from 'rxjs';
import { Order } from '../models/order';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShippingForm } from './shipping-form/shipping-form';

@Component({
  selector: 'app-check-out',
  imports: [CommonModule, ReactiveFormsModule, ShippingForm],
  templateUrl: './check-out.html',
  styleUrl: './check-out.css'
})
export class CheckOut implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cart: ShoppingCart | null = null;
  private userSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private shoppingCartService: ShoppingCartService,
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private modalService: NgbModal
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      paymentMethod: ['credit-card', Validators.required]
    });
  }

  async ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      if (user) {
        this.loadCart(user.uid);
        this.initializeStripe();
      } else {
        this.router.navigate(['/login']);
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
        if (!cart || !cart.items || Object.keys(cart.items).length === 0) {
          this.router.navigate(['/shopping-cart']);
        }
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

  private async initializeStripe() {
    // Replace with your actual Stripe publishable key
    this.stripe = await loadStripe('pk_test_your_stripe_publishable_key_here');
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card');
      this.cardElement.mount('#card-element');
    }
  }

  private showSuccessModal() {
    alert('Payment successful! Your order has been placed.');
  }

  async onSubmit() {
    if (this.checkoutForm.valid && this.cart && this.stripe && this.cardElement) {
      this.isProcessing = true;

      try {
        const { error, paymentMethod } = await this.stripe.createPaymentMethod({
          type: 'card',
          card: this.cardElement,
          billing_details: {
            name: this.checkoutForm.value.name,
            email: this.checkoutForm.value.email,
          },
        });

        if (error) {
          alert(error.message);
          this.isProcessing = false;
          return;
        }

        // Here you would typically send the paymentMethod.id to your backend
        // For now, we'll simulate a successful payment
        console.log('Payment method created:', paymentMethod);

        // Save order to RT DB
        const user = await this.authService.getUser().toPromise();
        if (user) {
          const order: Order = {
            userId: user.uid,
            datePlaced: new Date().getTime(),
            shippingInfo: this.checkoutForm.value,
            items: this.cart.items,
            total: this.getTotalPrice()
          };

          await this.orderService.saveOrder(order);
          console.log('Order saved to RT DB:', order);

          // Show success message
          this.showSuccessModal();

          // Clear the cart after successful order
          this.shoppingCartService.clearCart().subscribe({
            next: () => {
              console.log('Cart cleared after order');
              this.router.navigate(['/order-success']);
            },
            error: (error) => {
              console.error('Error clearing cart:', error);
              alert('Order placed but failed to clear cart. Please contact support.');
              this.router.navigate(['/order-success']);
            }
          });
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      } finally {
        this.isProcessing = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
    }
  }
}
