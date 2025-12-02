import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';
import { map, take, switchMap, filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Database, ref, get } from '@angular/fire/database';
import { AppUser } from './models/app-user';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private database: Database) {}

  canActivate(): Observable<boolean> {
    return this.authService.getLoading().pipe(
      filter(loading => !loading),
      take(1),
      switchMap(() => this.authService.getUser().pipe(take(1))),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return of(false);
        }
        return this.getAppUser(user.uid).pipe(
          map(appUser => {
            if (appUser && appUser.isAdmin) {
              return true;
            } else {
              this.router.navigate(['/']);
              return false;
            }
          })
        );
      })
    );
  }

  private getAppUser(uid: string): Observable<AppUser | null> {
    const userRef = ref(this.database, `users/${uid}`);
    return new Observable(subscriber => {
      get(userRef).then(snapshot => {
        if (snapshot.exists()) {
          subscriber.next(snapshot.val() as AppUser);
        } else {
          subscriber.next(null);
        }
        subscriber.complete();
      }).catch(error => {
        console.error('Error getting user data:', error);
        subscriber.next(null);
        subscriber.complete();
      });
    });
  }
}
