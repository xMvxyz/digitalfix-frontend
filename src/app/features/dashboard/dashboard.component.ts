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
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">Órdenes totales</p><p class="text-2xl font-bold">128</p></mat-card>
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Stock crítico</p><p class="text-2xl font-bold">7 repuestos</p></mat-card>
      <mat-card class="p-4 border-l-4 border-emerald-500"><p class="text-sm text-slate-500">Técnicos activos</p><p class="text-2xl font-bold">12</p></mat-card>
    </div>

    <!-- Vista Supervisor -->
    <div *ngIf="auth.role === 'Supervisor'" class="grid md:grid-cols-3 gap-4">
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Por asignar</p><p class="text-2xl font-bold">8</p></mat-card>
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">En desplazamiento</p><p class="text-2xl font-bold">3</p></mat-card>
      <mat-card class="p-4 border-l-4 border-violet-600"><p class="text-sm text-slate-500">En ejecución</p><p class="text-2xl font-bold">5</p></mat-card>
    </div>

    <!-- Vista Cliente -->
    <div *ngIf="auth.role === 'Cliente'" class="grid md:grid-cols-2 gap-4">
      <mat-card class="p-4"><p class="text-sm text-slate-500">Mis órdenes</p><p class="text-2xl font-bold">2 activas</p></mat-card>
      <mat-card class="p-4"><p class="text-sm text-slate-500">Última orden</p><p class="font-medium">#WF-1023 - EN_DESPLAZAMIENTO</p></mat-card>
    </div>
  </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
}
