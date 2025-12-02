import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../product-service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category';
import { ProductCard } from '../product-card/product-card';
import { ShoppingCartService, ShoppingCart } from '../services/shopping-cart.service';
import { AuthService } from '../auth';

@Component({
  selector: 'app-home',
  imports: [ProductCard],
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = '';
  cart: ShoppingCart | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shoppingCartService: ShoppingCartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.loadProducts();
      this.loadCategories();
    });
    this.loadCart();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  getCategoryName(categoryKey: string): string {
    const category = this.categories.find(c => c.key === categoryKey);
    return category ? category.name : 'Unknown';
  }

  filterByCategory(categoryKey: string): void {
    this.selectedCategory = categoryKey;
    this.applyFilter();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryKey || null },
      queryParamsHandling: 'merge'
    });
  }

  loadCart(): void {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.shoppingCartService.getCart(user.uid).subscribe({
          next: (cart) => {
            this.cart = cart;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading cart:', error);
          }
        });
      } else {
        this.cart = null;
        this.cdr.detectChanges();
      }
    });
  }

  onCartUpdated(): void {
    this.loadCart();
  }

  getProductQuantity(productKey: string): number {
    if (!this.cart || !this.cart.items[productKey]) {
      return 0;
    }
    return this.cart.items[productKey].quantity;
  }

  private applyFilter(): void {
    if (this.selectedCategory === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.category === this.selectedCategory);
    }
  }
}
