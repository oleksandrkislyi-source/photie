import { Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { AdminAuthGuard } from './admin-auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home').then(m => m.Home),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products').then(m => m.Products),
  },
  {
    path: 'shopping-cart',
    loadComponent: () =>
      import('./shopping-cart/shopping-cart').then(m => m.ShoppingCart),
  },
  {
    path: 'check-out',
    loadComponent: () =>
      import('./check-out/check-out').then(m => m.CheckOut),
    canActivate: [AuthGuard]
  },
  {
    path: 'order-success',
    loadComponent: () =>
      import('./order-success/order-success').then(m => m.OrderSuccess),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(m => m.Login),
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('./admin/admin-products/admin-products').then(m => m.AdminProducts),
    canActivate: [AuthGuard, AdminAuthGuard]
  },
  {
    path: 'admin/products/new',
    loadComponent: () =>
      import('./admin/product-form/product-form').then(m => m.ProductForm),
    canActivate: [AuthGuard, AdminAuthGuard]
  },
  {
    path: 'admin/products/:key',
    loadComponent: () =>
      import('./admin/product-form/product-form').then(m => m.ProductForm),
    canActivate: [AuthGuard, AdminAuthGuard]
  },
  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./admin/admin-orders/admin-orders').then(m => m.AdminOrders),
    canActivate: [AuthGuard, AdminAuthGuard]
  },
  {
    path: 'admin/product-form',
    loadComponent: () =>
      import('./admin/product-form/product-form').then(m => m.ProductForm),
    canActivate: [AuthGuard, AdminAuthGuard]
  },
  {
    path: 'my/orders',
    loadComponent: () =>
      import('./my-orders/my-orders').then(m => m.MyOrders),
    canActivate: [AuthGuard]
  },
];
