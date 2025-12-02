import { Injectable } from '@angular/core';
import { Database, ref, get, set } from '@angular/fire/database';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private database: Database) { }

  getCategories(): Observable<Category[]> {
    const categoriesRef = ref(this.database, 'categories');
    return from(get(categoriesRef)).pipe(
      switchMap(snapshot => {
        console.log('Categories snapshot exists:', snapshot.exists());
        console.log('Categories snapshot val:', snapshot.val());
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Data keys:', Object.keys(data));
          const categories = Object.keys(data).map(key => {
            console.log(`Processing key: ${key}, value:`, data[key]);
            return {
              key: key,
              name: data[key].name || data[key]  // Fallback if no name property
            };
          });
          console.log('Final mapped categories:', categories);
          return of(categories);
        } else {
          console.log('No categories found in DB, initializing...');
          const defaultCategories: Record<string, { name: string }> = {
            backgrounds: { name: 'Backgrounds' },
            buildings: { name: 'Buildings' },
            business: { name: 'Business' },
            digital_arts: { name: 'Digital Arts' },
            nature: { name: 'Nature' },
            people: { name: 'People' },
            textures: { name: 'Textures' }
          };
          return from(set(categoriesRef, defaultCategories)).pipe(
            map(() => {
              return Object.keys(defaultCategories).map(key => ({
                key: key,
                name: defaultCategories[key].name
              }));
            }),
            catchError(setError => {
              console.error('Error setting default categories:', setError);
              return of([]);
            })
          );
        }
      }),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }
}
