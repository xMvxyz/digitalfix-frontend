import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { WorkordersService } from '../../core/services/workorders.service';
import { CatalogService } from '../../core/services/catalog.service';

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
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">Órdenes totales</p><p class="text-2xl font-bold">{{kpis.total}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Stock crítico</p><p class="text-2xl font-bold">{{kpis.stockCritico}} repuestos</p></mat-card>
      <mat-card class="p-4 border-l-4 border-emerald-500"><p class="text-sm text-slate-500">Por asignar</p><p class="text-2xl font-bold">{{kpis.porAsignar}}</p></mat-card>
    </div>

    <!-- Vista Supervisor -->
    <div *ngIf="auth.role === 'Supervisor'" class="grid md:grid-cols-3 gap-4">
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Por asignar</p><p class="text-2xl font-bold">{{kpis.porAsignar}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">En desplazamiento</p><p class="text-2xl font-bold">{{kpis.desplazamiento}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-violet-600"><p class="text-sm text-slate-500">En ejecución</p><p class="text-2xl font-bold">{{kpis.ejecucion}}</p></mat-card>
    </div>

    <!-- Vista Cliente -->
    <div *ngIf="auth.role === 'Cliente'" class="grid md:grid-cols-2 gap-4">
      <mat-card class="p-4"><p class="text-sm text-slate-500">Mis órdenes</p><p class="text-2xl font-bold">{{kpis.misOrdenes}} activas</p></mat-card>
      <mat-card class="p-4"><p class="text-sm text-slate-500">Órdenes totales</p><p class="font-medium">{{kpis.total}} en sistema</p></mat-card>
    </div>
  </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private wo = inject(WorkordersService);
  private cat = inject(CatalogService);
  kpis = { total: 0, porAsignar: 0, desplazamiento: 0, ejecucion: 0, stockCritico: 0, misOrdenes: 0 };
  ngOnInit(): void {
    this.wo.list().subscribe({ next: list => {
      this.kpis.total = list.length;
      this.kpis.porAsignar = list.filter(w=>w.estado==='CREADA').length;
      this.kpis.desplazamiento = list.filter(w=>w.estado==='EN_DESPLAZAMIENTO').length;
      this.kpis.ejecucion = list.filter(w=>w.estado==='EN_EJECUCION').length;
      const email = this.auth.user?.email;
      this.kpis.misOrdenes = email ? list.filter(w=>w.clienteEmail===email).length : list.length;
    }, error: ()=>{}});
    this.cat.stockBajo().subscribe({ next: l=> this.kpis.stockCritico = l.length, error: ()=>{} });
  }
}
