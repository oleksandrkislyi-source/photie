export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: Date;
  isAdmin: boolean;
}
