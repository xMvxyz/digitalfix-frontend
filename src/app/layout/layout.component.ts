import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
  <mat-toolbar class="bg-slate-900 text-white sticky top-0 z-10" style="background:#0F172A;color:white">
    <span class="font-bold tracking-wide flex items-center gap-2">
      <mat-icon>build</mat-icon> DigitalFix
    </span>
    <span class="flex-1"></span>
    <nav class="hidden md:flex gap-1">
      <a mat-button routerLink="/dashboard" routerLinkActive="bg-white/10" style="color:white"><mat-icon>dashboard</mat-icon> Dashboard</a>
      <a mat-button routerLink="/workorders" routerLinkActive="bg-white/10" style="color:white"><mat-icon>assignment</mat-icon> Órdenes</a>
      <a mat-button routerLink="/catalog" routerLinkActive="bg-white/10" style="color:white"><mat-icon>inventory_2</mat-icon> Catálogo</a>
    </nav>
    <span class="ml-3 hidden text-sm text-white lg:inline">{{ auth.user?.name || 'Usuario' }} ({{ auth.role }})</span>
    <button mat-button class="ml-2" style="color:white" (click)="logout()" aria-label="Cerrar sesión">
      <mat-icon>logout</mat-icon> Cerrar sesión
    </button>
  </mat-toolbar>

  <!-- Mobile nav -->
  <div class="md:hidden flex gap-2 p-2 bg-slate-100 border-b">
    <a mat-stroked-button routerLink="/dashboard" class="flex-1">Dashboard</a>
    <a mat-stroked-button routerLink="/workorders" class="flex-1">Órdenes</a>
    <a mat-stroked-button routerLink="/catalog" class="flex-1">Catálogo</a>
  </div>

  <div class="min-h-[calc(100vh-64px)] bg-slate-50">
    <router-outlet></router-outlet>
  </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
