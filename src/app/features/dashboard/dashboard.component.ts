import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
    <p class="text-slate-500 mb-6">Bienvenido {{ auth.user?.name }} - Rol: <span class="font-semibold text-blue-600">{{ auth.role }}</span></p>

    <!-- Vista Admin -->
    <div *ngIf="auth.role === 'Admin'" class="grid md:grid-cols-3 gap-4">
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">Órdenes totales</p><p class="text-2xl font-bold">128</p><p class="text-xs text-emerald-600">+12% vs mes anterior</p></mat-card>
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Stock crítico</p><p class="text-2xl font-bold">7 repuestos</p><p class="text-xs text-red-600">Requiere reposición</p></mat-card>
      <mat-card class="p-4 border-l-4 border-emerald-500"><p class="text-sm text-slate-500">Técnicos activos</p><p class="text-2xl font-bold">12</p><p class="text-xs text-slate-500">En terreno: 4</p></mat-card>
      <div class="md:col-span-3 bg-white p-4 rounded-xl shadow text-sm"><strong>Visión Admin:</strong> KPIs globales, gestión de catálogo y operación completa.</div>
    </div>

    <!-- Vista Supervisor -->
    <div *ngIf="auth.role === 'Supervisor'" class="grid md:grid-cols-3 gap-4">
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Por asignar</p><p class="text-2xl font-bold">8</p><p class="text-xs text-amber-600">CREADA</p></mat-card>
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">En desplazamiento</p><p class="text-2xl font-bold">3</p><p class="text-xs text-blue-600">EN_DESPLAZAMIENTO</p></mat-card>
      <mat-card class="p-4 border-l-4 border-violet-600"><p class="text-sm text-slate-500">En ejecución</p><p class="text-2xl font-bold">5</p><p class="text-xs text-violet-600">EN_EJECUCIÓN</p></mat-card>
      <div class="md:col-span-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm"><strong>Supervisor:</strong> Órdenes pendientes de asignar, asignar técnico disminuye stock. No se puede pasar a EN_EJECUCIÓN sin ASIGNAR.</div>
    </div>

    <!-- Vista Cliente -->
    <div *ngIf="auth.role === 'Cliente'" class="grid md:grid-cols-2 gap-4">
      <mat-card class="p-4"><p class="text-sm text-slate-500">Mis órdenes</p><p class="text-2xl font-bold">2 activas</p><button class="text-blue-600 text-sm mt-2">Ver seguimiento →</button></mat-card>
      <mat-card class="p-4"><p class="text-sm text-slate-500">Última orden</p><p class="font-medium">#WF-1023 - EN_DESPLAZAMIENTO</p><p class="text-xs text-slate-500">Técnico en camino</p></mat-card>
      <div class="md:col-span-2 bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm"><strong>Cliente:</strong> Crea y sigue tus órdenes. Solo ves tus propias órdenes.</div>
    </div>

    <div class="mt-8 grid md:grid-cols-2 gap-4 text-sm">
      <div class="bg-white p-4 rounded-xl shadow"><h3 class="font-semibold flex items-center gap-2"><mat-icon class="text-blue-600">shield</mat-icon> Autenticación EP1</h3><ul class="list-disc ml-5 mt-2 text-slate-600"><li>Entra ID + MSAL (mockAuth=true para demo local)</li><li>AuthGuard protege /dashboard, /workorders, /catalog</li><li>MsalInterceptor → Authorization: Bearer token a API Gateway</li></ul></div>
      <div class="bg-white p-4 rounded-xl shadow"><h3 class="font-semibold flex items-center gap-2"><mat-icon class="text-amber-600">sync_alt</mat-icon> Flujo BFF</h3><p class="text-slate-600 mt-2">Angular → Gateway valida JWT (issuer/audience/firma) → BFF re-valida JWT + rol → ms-workorders / ms-catalog → regla stock al ASIGNAR</p></div>
    </div>
  </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
}
