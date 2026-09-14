import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { WorkordersService } from '../../core/services/workorders.service';
import { CatalogService } from '../../core/services/catalog.service';
import { WorkOrderDto } from '../../shared/models/work-order.models';
import { RepuestoDto } from '../../shared/models/catalog.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule],
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

    <section *ngIf="auth.role === 'Admin'" class="mt-8 grid gap-6 lg:grid-cols-2">
      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between"><h2 class="text-lg font-semibold">Órdenes pendientes</h2><a href="/workorders" class="text-sm text-blue-600">Ver todas</a></div>
        <div *ngIf="adminPendingOrders.length === 0" class="text-sm text-slate-500">No hay órdenes pendientes.</div>
        <div *ngFor="let order of adminPendingOrders" class="flex items-center justify-between gap-3 border-b py-3 last:border-0">
          <div><p class="font-medium">#{{order.id}} · {{order.servicio}}</p><p class="text-xs text-slate-500">{{order.clienteEmail}}</p></div>
          <span class="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">{{order.estado}}</span>
        </div>
      </mat-card>
      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between"><h2 class="text-lg font-semibold">Stock crítico</h2><a href="/catalog" class="text-sm text-blue-600">Gestionar catálogo</a></div>
        <div *ngIf="lowStockItems.length === 0" class="text-sm text-slate-500">No hay repuestos bajo el mínimo.</div>
        <div *ngFor="let item of lowStockItems" class="flex items-center justify-between gap-3 border-b py-3 last:border-0">
          <div><p class="font-medium">{{item.nombre}}</p><p class="text-xs text-slate-500">SKU: {{item.sku}}</p></div>
          <span class="font-semibold text-red-600">{{item.stock}} / {{item.stockMinimo}}</span>
        </div>
      </mat-card>
    </section>

    <!-- Vista Supervisor -->
    <div *ngIf="auth.role === 'Supervisor'" class="grid md:grid-cols-3 gap-4">
      <mat-card class="p-4 border-l-4 border-amber-500"><p class="text-sm text-slate-500">Por asignar</p><p class="text-2xl font-bold">{{kpis.porAsignar}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">En desplazamiento</p><p class="text-2xl font-bold">{{kpis.desplazamiento}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-violet-600"><p class="text-sm text-slate-500">En ejecución</p><p class="text-2xl font-bold">{{kpis.ejecucion}}</p></mat-card>
    </div>

    <section *ngIf="auth.role === 'Supervisor'" class="mt-8 grid gap-6 lg:grid-cols-2">
      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between"><h2 class="text-lg font-semibold">Cola de asignación</h2><a href="/workorders" class="text-sm text-blue-600">Gestionar órdenes</a></div>
        <div *ngIf="supervisorPendingOrders.length === 0" class="text-sm text-slate-500">No hay órdenes por asignar.</div>
        <div *ngFor="let order of supervisorPendingOrders" class="flex items-center justify-between gap-3 border-b py-3 last:border-0">
          <div><p class="font-medium">#{{order.id}} · {{order.servicio}}</p><p class="text-xs text-slate-500">{{order.clienteEmail}}</p></div>
          <span class="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">{{order.estado}}</span>
        </div>
      </mat-card>
      <mat-card class="p-4">
        <h2 class="mb-3 text-lg font-semibold">Resumen operativo</h2>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-slate-50 p-3"><span class="text-slate-500">Asignadas</span><p class="text-xl font-semibold">{{kpis.asignadas}}</p></div>
          <div class="rounded bg-slate-50 p-3"><span class="text-slate-500">Cerradas</span><p class="text-xl font-semibold">{{kpis.cerradas}}</p></div>
          <div class="rounded bg-slate-50 p-3"><span class="text-slate-500">Canceladas</span><p class="text-xl font-semibold">{{kpis.canceladas}}</p></div>
          <div class="rounded bg-slate-50 p-3"><span class="text-slate-500">Stock crítico</span><p class="text-xl font-semibold">{{kpis.stockCritico}}</p></div>
        </div>
      </mat-card>
    </section>

    <!-- Vista Cliente -->
    <div *ngIf="auth.role === 'Cliente'" class="grid md:grid-cols-2 gap-4">
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">Mis órdenes activas</p><p class="text-2xl font-bold">{{kpis.misOrdenes}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-emerald-500"><p class="text-sm text-slate-500">Órdenes cerradas</p><p class="text-2xl font-bold">{{closedOrders}}</p></mat-card>
    </div>

    <section *ngIf="auth.role === 'Cliente'" class="mt-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">Seguimiento de mis órdenes</h2>
          <p class="text-sm text-slate-500">Consulta el estado actual y avanza la orden según el flujo permitido.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <input [(ngModel)]="newServicio" placeholder="Servicio" class="border rounded px-2 py-1 text-sm" />
          <input [(ngModel)]="newDescripcion" placeholder="Descripción" class="border rounded px-2 py-1 text-sm" />
          <button mat-raised-button color="primary" (click)="createClientOrder()"><mat-icon>add</mat-icon> Crear orden</button>
        </div>
      </div>

      <div *ngIf="clientLoading" class="text-sm text-slate-500">Cargando tus órdenes...</div>
      <div *ngIf="clientError" class="mb-3 rounded bg-amber-50 p-3 text-sm text-amber-800">{{clientError}}</div>
      <div *ngIf="!clientLoading && clientOrders.length === 0" class="rounded border border-dashed p-6 text-center text-sm text-slate-500">Aún no tienes órdenes registradas.</div>

      <div class="grid gap-4 lg:grid-cols-2">
        <mat-card *ngFor="let order of clientOrders" class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-slate-500">Orden #{{order.id}}</p>
              <h3 class="font-semibold text-slate-900">{{order.servicio}}</h3>
            </div>
            <span class="rounded-full border px-2 py-1 text-xs font-medium" [ngClass]="statusClass(order.estado)">{{order.estado}}</span>
          </div>
          <p *ngIf="order.descripcion" class="mt-2 text-sm text-slate-600">{{order.descripcion}}</p>
          <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-slate-500">Técnico</span><p class="font-medium">{{order.tecnicoAsignado || 'Pendiente de asignación'}}</p></div>
            <div><span class="text-slate-500">Progreso</span><p class="font-medium">{{statusProgress(order.estado)}} / 4</p></div>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded bg-slate-100"><div class="h-full bg-blue-600 transition-all" [style.width.%]="statusProgress(order.estado) * 25"></div></div>
          <div class="mt-4 flex justify-end">
            <button mat-stroked-button *ngIf="canAdvance(order)" (click)="advanceClientOrder(order)"><mat-icon>arrow_forward</mat-icon> {{nextStatusLabel(order.estado)}}</button>
            <span *ngIf="!canAdvance(order)" class="text-xs text-slate-400">Sin acciones pendientes</span>
          </div>
        </mat-card>
      </div>
    </section>
  </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private wo = inject(WorkordersService);
  private cat = inject(CatalogService);
  kpis = { total: 0, porAsignar: 0, asignadas: 0, desplazamiento: 0, ejecucion: 0, cerradas: 0, canceladas: 0, stockCritico: 0, misOrdenes: 0 };
  clientOrders: WorkOrderDto[] = [];
  clientLoading = false;
  clientError: string | null = null;
  newServicio = '';
  newDescripcion = '';
  adminPendingOrders: WorkOrderDto[] = [];
  supervisorPendingOrders: WorkOrderDto[] = [];
  lowStockItems: RepuestoDto[] = [];

  get closedOrders(): number { return this.clientOrders.filter(order => order.estado === 'CERRADA').length; }

  ngOnInit(): void {
    this.wo.list().subscribe({ next: list => {
      this.kpis.total = list.length;
      this.kpis.porAsignar = list.filter(w=>w.estado==='CREADA').length;
      this.kpis.asignadas = list.filter(w=>w.estado==='ASIGNADA').length;
      this.kpis.desplazamiento = list.filter(w=>w.estado==='EN_DESPLAZAMIENTO').length;
      this.kpis.ejecucion = list.filter(w=>w.estado==='EN_EJECUCION').length;
      this.kpis.cerradas = list.filter(w=>w.estado==='CERRADA').length;
      this.kpis.canceladas = list.filter(w=>w.estado==='CANCELADA').length;
      this.adminPendingOrders = list.filter(w=>!['CERRADA', 'CANCELADA'].includes(w.estado)).slice(0, 6);
      this.supervisorPendingOrders = list.filter(w=>w.estado === 'CREADA').slice(0, 6);
      const email = this.auth.user?.email;
      this.clientOrders = email ? list.filter(w=>w.clienteEmail===email) : list;
      this.kpis.misOrdenes = this.clientOrders.filter(w=>w.estado !== 'CERRADA' && w.estado !== 'CANCELADA').length;
    }, error: ()=>{}});
    this.cat.stockBajo().subscribe({ next: l=> { this.kpis.stockCritico = l.length; this.lowStockItems = l; }, error: ()=>{} });
  }

  statusProgress(status: string): number {
    return ({ CREADA: 1, ASIGNADA: 2, EN_DESPLAZAMIENTO: 3, EN_EJECUCION: 4, CERRADA: 4, CANCELADA: 0 } as Record<string, number>)[status] || 0;
  }

  statusClass(status: string): string {
    return ({ CREADA: 'bg-amber-50 text-amber-700', ASIGNADA: 'bg-blue-50 text-blue-700', EN_DESPLAZAMIENTO: 'bg-cyan-50 text-cyan-700', EN_EJECUCION: 'bg-violet-50 text-violet-700', CERRADA: 'bg-emerald-50 text-emerald-700', CANCELADA: 'bg-red-50 text-red-700' } as Record<string, string>)[status] || 'bg-slate-50 text-slate-700';
  }

  canAdvance(order: WorkOrderDto): boolean {
    return ['CREADA', 'ASIGNADA', 'EN_DESPLAZAMIENTO', 'EN_EJECUCION'].includes(order.estado);
  }

  nextStatusLabel(status: string): string {
    return ({ CREADA: 'Asignar', ASIGNADA: 'Iniciar desplazamiento', EN_DESPLAZAMIENTO: 'Iniciar ejecución', EN_EJECUCION: 'Cerrar orden' } as Record<string, string>)[status] || 'Avanzar';
  }

  advanceClientOrder(order: WorkOrderDto): void {
    const next = ({ CREADA: 'ASIGNADA', ASIGNADA: 'EN_DESPLAZAMIENTO', EN_DESPLAZAMIENTO: 'EN_EJECUCION', EN_EJECUCION: 'CERRADA' } as Record<string, string>)[order.estado];
    if (!next) return;
    const payload: { estado: string; tecnico?: string } = { estado: next };
    if (next === 'ASIGNADA') payload.tecnico = 'tecnico.' + (this.auth.user?.email || 'cliente') + '@digitalfix.cl';
    this.wo.changeStatus(order.id, payload).subscribe({
      next: updated => { Object.assign(order, updated); this.kpis.misOrdenes = this.clientOrders.filter(w=>w.estado !== 'CERRADA' && w.estado !== 'CANCELADA').length; },
      error: err => this.clientError = err.error?.message || err.error?.error || err.message
    });
  }

  createClientOrder(): void {
    this.clientLoading = true;
    this.wo.create({ clienteEmail: this.auth.user?.email || '', servicio: this.newServicio || 'Servicio nuevo', descripcion: this.newDescripcion || undefined }).subscribe({
      next: order => { this.clientOrders = [order, ...this.clientOrders]; this.newServicio = ''; this.newDescripcion = ''; this.kpis.misOrdenes++; this.clientLoading = false; },
      error: err => { this.clientError = err.error?.message || err.message; this.clientLoading = false; }
    });
  }
}
