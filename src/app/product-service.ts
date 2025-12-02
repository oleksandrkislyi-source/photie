import { Injectable } from '@angular/core';
import { Database, ref, push, get, set, remove } from '@angular/fire/database';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface Product {
  title: string;
  price: number;
  category: string;
  imageUrl: string;
  key?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private database: Database) { }

  saveProduct(product: Product): Observable<any> {
    const productsRef = ref(this.database, 'products');
    return from(push(productsRef, product));
  }

  getProducts(): Observable<Product[]> {
    const productsRef = ref(this.database, 'products');
    return from(get(productsRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const products: Product[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              products.push({
                ...data[key],
                key: key
              });
            }
          }
          return products;
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }

  getProduct(key: string): Observable<Product | null> {
    const productRef = ref(this.database, `products/${key}`);
    return from(get(productRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          return {
            ...snapshot.val(),
            key: key
          };
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.error('Error fetching product:', error);
        return of(null);
      })
    );
  }

  updateProduct(key: string, product: Product): Observable<any> {
    const productRef = ref(this.database, `products/${key}`);
    return from(set(productRef, product));
  }

  deleteProduct(key: string): Observable<any> {
    const productRef = ref(this.database, `products/${key}`);
    return from(remove(productRef));
  }
}
