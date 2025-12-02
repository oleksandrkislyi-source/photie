import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Product } from '../models/product';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { ProductQuantity } from '../product-quantity/product-quantity';

@Component({
  selector: 'app-product-card',
  imports: [ProductQuantity],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;
  @Input() quantity: number = 0;
  @Output() cartUpdated = new EventEmitter<void>();
  quantityToAdd: number = 1;

  constructor(private shoppingCartService: ShoppingCartService) {}

  onQuantityChange(newQuantity: number) {
    this.quantityToAdd = newQuantity;
  }

  onAddToCart() {
    if (!this.product.key) {
      console.error('Product key is missing');
      return;
    }
    this.shoppingCartService.addToCart(this.product.key, this.quantityToAdd).subscribe({
      next: (result) => {
        console.log('Product added to cart successfully');
        this.quantityToAdd = 1; // Reset quantity to 1 after adding
        this.cartUpdated.emit();
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Please log in to add items to cart.');
      }
    });
  }
}
