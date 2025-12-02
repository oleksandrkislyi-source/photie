import { Auth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from 'firebase/auth';
import { Database, ref, set, get } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  constructor(private auth: Auth, private database: Database) {
    setPersistence(this.auth, browserLocalPersistence).then(() => {
      onAuthStateChanged(this.auth, user => {
        this.userSubject.next(user);
        this.loadingSubject.next(false);
      });
    });
  }

  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  async login() {
    try {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      this.userSubject.next(result.user); // Set user immediately for navbar update
      await this.saveUserToRealtimeDatabase(result.user);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      this.userSubject.next(result.user);
      await this.saveUserToRealtimeDatabase(result.user);
      return result;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  }

  async registerWithEmail(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      this.userSubject.next(result.user);
      await this.saveUserToRealtimeDatabase(result.user);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    return signOut(this.auth);
  }

  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  private async saveUserToRealtimeDatabase(user: User) {
    const userRef = ref(this.database, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: Date.now(),
      isAdmin: false
    };

    // Check if user already exists
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      // New user, set default data
      await set(userRef, userData);
    } else {
      // Existing user, update last login
      await set(userRef, {
        ...snapshot.val(),
        lastLogin: Date.now()
      });
    }
  }
}
