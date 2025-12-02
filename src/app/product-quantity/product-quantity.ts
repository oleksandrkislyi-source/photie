import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-product-quantity',
  imports: [],
  templateUrl: './product-quantity.html',
  styleUrl: './product-quantity.css'
})
export class ProductQuantity {
  @Input() quantity: number = 1;
  @Input() minQuantity: number = 1;
  @Output() quantityChange = new EventEmitter<number>();

  increment() {
    this.quantity++;
    this.quantityChange.emit(this.quantity);
  }

  decrement() {
    if (this.quantity > this.minQuantity) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }
}
