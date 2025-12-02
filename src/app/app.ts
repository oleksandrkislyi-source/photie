import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BsNavbar } from "./bs-navbar/bs-navbar";
import { AuthService } from './auth';
import { AuthGuard } from './auth-guard';
import { AdminAuthGuard } from './admin-auth-guard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BsNavbar
  ],
  template: `
    <bs-navbar></bs-navbar>
    <div class="container mt-5 pt-4">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.css',
  providers: [
    AuthService,
    AuthGuard,
    AdminAuthGuard
  ]
})
export class App {
  protected readonly title = signal('Photie');
}
