import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
    <mat-card class="w-full max-w-md p-8 shadow-2xl">
      <div class="text-center mb-6">
        <div class="mx-auto w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
          <mat-icon class="text-white text-3xl">build</mat-icon>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">DigitalFix</h1>
      </div>

      <button mat-raised-button color="primary" class="w-full mb-6" (click)="loginMsal()">
        <mat-icon>login</mat-icon> Iniciar sesión con Microsoft
      </button>

      <div class="grid gap-2">
        <button mat-stroked-button class="justify-start" (click)="loginAs('admin')">
          <mat-icon>admin_panel_settings</mat-icon> Admin
        </button>
        <button mat-stroked-button class="justify-start" (click)="loginAs('supervisor')">
          <mat-icon>supervisor_account</mat-icon> Supervisor
        </button>
        <button mat-stroked-button class="justify-start" (click)="loginAs('cliente')">
          <mat-icon>person</mat-icon> Cliente
        </button>
      </div>
    </mat-card>
  </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loginAs(role: 'admin' | 'supervisor' | 'cliente') {
    this.auth.loginAs(role);
    this.router.navigate(['/dashboard']);
  }

  async loginMsal() {
    await this.auth.loginWithMsal();
    this.router.navigate(['/dashboard']);
  }
}
