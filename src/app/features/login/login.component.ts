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
        <p class="text-sm text-slate-500">Órdenes de mantención • Microsoft Entra ID</p>
        <p class="text-xs text-amber-600 mt-1 font-medium">Modo mock activo - Seleccione un rol</p>
      </div>

      <button mat-raised-button color="primary" class="w-full mb-3" (click)="loginMsal()">
        <mat-icon>login</mat-icon> Iniciar sesión con Microsoft
      </button>
      <p class="text-xs text-center text-slate-400 mb-4">Usará Entra ID cuando configure environment.msal</p>

      <mat-divider class="my-4"></mat-divider>
      <p class="text-sm font-medium text-slate-700 mb-2">Acceso rápido por rol (mock):</p>

      <div class="grid gap-2">
        <button mat-stroked-button class="justify-start" (click)="loginAs('admin')">
          <mat-icon>admin_panel_settings</mat-icon> Admin - Gestiona servicios y repuestos
        </button>
        <button mat-stroked-button class="justify-start border-amber-200 bg-amber-50" (click)="loginAs('supervisor')">
          <mat-icon>supervisor_account</mat-icon> Supervisor - Asigna y cierra trabajos
        </button>
        <button mat-stroked-button class="justify-start" (click)="loginAs('cliente')">
          <mat-icon>person</mat-icon> Cliente - Crea y sigue órdenes
        </button>
      </div>

      <div class="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
        <p class="font-semibold mb-1">Flujo EP1:</p>
        <p>MSAL → API Gateway (JWT) → BFF (re-valida JWT + rol) → ms-workorders / ms-catalog</p>
        <p class="mt-2 text-[11px]">Configure tenant, clientId y authority en <code>environment.ts</code> y ponga <code>mockAuth=false</code> para probar Entra ID real.</p>
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
