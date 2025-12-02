import { Injectable, OnDestroy } from '@angular/core';
import { Database, ref, get, set, update, onValue, off } from '@angular/fire/database';
import { Observable, from, map, catchError, of, switchMap, BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth';
import { User } from 'firebase/auth';
import { Product } from '../models/product';
import { ProductService } from '../product-service';

export interface ShoppingCartItem {
  product: Product;
  quantity: number;
}

export interface ShoppingCart {
  items: { [productKey: string]: ShoppingCartItem };
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService implements OnDestroy {
  private cartSubjects: { [userId: string]: BehaviorSubject<ShoppingCart | null> } = {};

  constructor(private database: Database, private authService: AuthService, private productService: ProductService) { }

  addToCart(productKey: string, quantity: number = 1): Observable<any> {
    return this.productService.getProduct(productKey).pipe(
      switchMap(product => {
        if (!product) throw new Error('Product not found');
        return this.authService.getUser().pipe(
          switchMap(user => {
            if (!user) throw new Error('User not logged in');
            return this.addItemToCart(user, product, quantity);
          })
        );
      })
    );
  }

  private addItemToCart(user: User, product: Product, quantity: number): Observable<any> {
    const cartRef = ref(this.database, `shopping-carts/${user.uid}`);
    return from(get(cartRef)).pipe(
      switchMap(snapshot => {
        let cart: ShoppingCart = { items: {} };
        if (snapshot.exists()) {
          cart = snapshot.val();
        }
        const productKey = product.key!;
        if (cart.items[productKey]) {
          cart.items[productKey].quantity += quantity;
        } else {
          cart.items[productKey] = { product, quantity };
        }
        return from(set(cartRef, cart));
      }),
      catchError(error => {
        console.error('Error adding to cart:', error);
        return of(null);
      })
    );
  }

  getCart(userId: string): Observable<ShoppingCart | null> {
    if (!this.cartSubjects[userId]) {
      this.cartSubjects[userId] = new BehaviorSubject<ShoppingCart | null>(null);
      const cartRef = ref(this.database, `shopping-carts/${userId}`);
      onValue(cartRef, (snapshot) => {
        if (snapshot.exists()) {
          this.cartSubjects[userId].next(snapshot.val());
        } else {
          this.cartSubjects[userId].next({ items: {} });
        }
      }, (error) => {
        console.error('Error fetching cart:', error);
        this.cartSubjects[userId].next(null);
      });
    }
    return this.cartSubjects[userId].asObservable();
  }

  updateQuantity(productKey: string, newQuantity: number): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) throw new Error('User not logged in');
        const cartRef = ref(this.database, `shopping-carts/${user.uid}`);
        return from(get(cartRef)).pipe(
          switchMap(snapshot => {
            if (!snapshot.exists()) throw new Error('Cart not found');
            const cart: ShoppingCart = snapshot.val();
            if (!cart.items[productKey]) throw new Error('Product not in cart');
            if (newQuantity <= 0) {
              delete cart.items[productKey];
            } else {
              cart.items[productKey].quantity = newQuantity;
            }
            return from(set(cartRef, cart));
          })
        );
      }),
      catchError(error => {
        console.error('Error updating quantity:', error);
        return of(null);
      })
    );
  }

  removeItem(productKey: string): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) throw new Error('User not logged in');
        const cartRef = ref(this.database, `shopping-carts/${user.uid}`);
        return from(get(cartRef)).pipe(
          switchMap(snapshot => {
            if (!snapshot.exists()) throw new Error('Cart not found');
            const cart: ShoppingCart = snapshot.val();
            if (!cart.items[productKey]) throw new Error('Product not in cart');
            delete cart.items[productKey];
            return from(set(cartRef, cart));
          })
        );
      }),
      catchError(error => {
        console.error('Error removing item:', error);
        return of(null);
      })
    );
  }

  clearCart(): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) throw new Error('User not logged in');
        const cartRef = ref(this.database, `shopping-carts/${user.uid}`);
        return from(set(cartRef, { items: {} }));
      }),
      catchError(error => {
        console.error('Error clearing cart:', error);
        return of(null);
      })
    );
  }

  ngOnDestroy() {
    // Clean up listeners when service is destroyed
    Object.keys(this.cartSubjects).forEach(userId => {
      const cartRef = ref(this.database, `shopping-carts/${userId}`);
      off(cartRef);
    });
  }
}
