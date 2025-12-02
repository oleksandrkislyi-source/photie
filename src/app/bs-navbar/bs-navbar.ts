import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth';
import { Database, ref, get } from '@angular/fire/database';
import { AppUser } from '../models/app-user';
import { ShoppingCartService, ShoppingCart } from '../services/shopping-cart.service';

@Component({
  selector: 'bs-navbar',
  imports: [RouterLink, NgbDropdownModule],
  templateUrl: './bs-navbar.html',
  styleUrl: './bs-navbar.css',
  standalone: true
})
export class BsNavbar implements OnInit, OnDestroy {
  user: User | null = null;
  appUser: AppUser | null = null;
  isLoading: boolean = true;
  cartItemCount: number = 0;
  badgeClass: string = '';
  private userSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router, private database: Database, private shoppingCartService: ShoppingCartService) {
    // Firebase Auth automatically persists login state across page refreshes
    // No additional code needed here as AuthService handles persistence
  }

  ngOnInit() {
    this.loadingSubscription = this.authService.getLoading().subscribe(isLoading => {
      this.isLoading = isLoading;
    });

    this.userSubscription = this.authService.getUser().subscribe(user => {
      this.user = user;
      if (user) {
        this.getAppUser(user.uid).then(appUser => {
          this.appUser = appUser;
        });
        this.loadCart(user.uid);
      } else {
        this.appUser = null;
        this.cartItemCount = 0;
      }
    });

    // Removed isCheckOutPage logic to always show user dropdown if logged in
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  private loadCart(userId: string) {
    this.cartSubscription = this.shoppingCartService.getCart(userId).subscribe({
      next: (cart) => {
        const newCount = cart && cart.items ? Object.values(cart.items).reduce((total, item) => total + item.quantity, 0) : 0;
        if (newCount !== this.cartItemCount) {
          this.cartItemCount = newCount;
          this.triggerBadgeAnimation();
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartItemCount = 0;
      }
    });
  }

  private triggerBadgeAnimation() {
    this.badgeClass = 'updated';
    setTimeout(() => {
      this.badgeClass = '';
    }, 500);
  }

  private getAppUser(uid: string): Promise<AppUser | null> {
    const userRef = ref(this.database, `users/${uid}`);
    return get(userRef).then(snapshot => {
      if (snapshot.exists()) {
        return snapshot.val() as AppUser;
      } else {
        return null;
      }
    }).catch(error => {
      console.error('Error getting user data:', error);
      return null;
    });
  }
}
