import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { FormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ProductService, Product } from '../../product-service';
import { Category } from '../../models/category';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit, OnDestroy {
  categories: Category[] = [];
  product: Product = {
    title: '',
    price: 0,
    category: '',
    imageUrl: ''
  };
  isTypingTitle: boolean = false;
  isTypingPrice: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  validateImageUrl(control: AbstractControl): void {
    if (!control.value) {
      return; // Let required validator handle empty values
    }
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const isValid = urlPattern.test(control.value);
    if (!isValid) {
      control.setErrors({ invalidUrl: true });
    } else {
      // Clear the error if valid
      const errors = control.errors;
      if (errors) {
        delete errors['invalidUrl'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  validateTitle(control: AbstractControl): void {
    if (!control.value) {
      return; // Let required validator handle empty values
    }
    if (control.value.length < 3) {
      control.setErrors({ minLength: true });
    } else {
      // Clear the error if valid
      const errors = control.errors;
      if (errors) {
        delete errors['minLength'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  validatePrice(control: AbstractControl): void {
    if (!control.value) {
      return; // Let required validator handle empty values
    }
    const price = parseFloat(control.value);
    if (isNaN(price) || price <= 0) {
      control.setErrors({ invalidPrice: true });
    } else {
      // Clear the error if valid
      const errors = control.errors;
      if (errors) {
        delete errors['invalidPrice'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    const key = this.route.snapshot.paramMap.get('key');
    if (key) {
      this.productService.getProduct(key).subscribe({
        next: (product) => {
          if (product) {
            this.product = product;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading product:', error);
        }
      });
    }
  }

  getCategoryName(categoryKey: string): string {
    const category = this.categories.find(c => c.key === categoryKey);
    return category ? category.name : '';
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const key = this.route.snapshot.paramMap.get('key');
      if (key) {
        // Update existing product
        this.productService.updateProduct(key, this.product).subscribe({
          next: (result) => {
            console.log('Product updated successfully:', result);
            // Navigate to admin/products
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
          }
        });
      } else {
        // Create new product
        this.productService.saveProduct(this.product).subscribe({
          next: (result) => {
            console.log('Product saved successfully:', result);
            // Navigate to admin/products
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Error saving product:', error);
          }
        });
      }
    } else {
      console.error('Form is invalid. Please fill in all required fields.');
    }
  }

  deleteProduct(): void {
    const key = this.route.snapshot.paramMap.get('key');
    if (key && confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(key).subscribe({
        next: (result) => {
          console.log('Product deleted successfully:', result);
          // Navigate to admin/products
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  isEditMode(): boolean {
    return !!this.route.snapshot.paramMap.get('key');
  }

  onTitleInput(): void {
    this.isTypingTitle = true;
    setTimeout(() => {
      this.isTypingTitle = false;
      this.cdr.detectChanges();
    }, 1000); // Reset after 1 second
  }

  onPriceInput(): void {
    this.isTypingPrice = true;
    setTimeout(() => {
      this.isTypingPrice = false;
      this.cdr.detectChanges();
    }, 1000); // Reset after 1 second
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
