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
import { RepuestoDto, ServicioDto } from '../../shared/models/catalog.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold text-slate-900">{{ auth.role === 'Cliente' ? 'DigitalFix' : 'Dashboard' }}</h1>
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

    <!-- Vista Cliente: catálogo (para el Cliente, dashboard y catálogo son lo mismo).
         Sin órdenes a la vista y sin cambio de estados: solo solicitar servicios. -->
    <div *ngIf="auth.role === 'Cliente'" class="grid md:grid-cols-2 gap-4">
      <mat-card class="p-4 border-l-4 border-blue-600"><p class="text-sm text-slate-500">Servicios disponibles</p><p class="text-2xl font-bold">{{servicios.length}}</p></mat-card>
      <mat-card class="p-4 border-l-4 border-emerald-500"><p class="text-sm text-slate-500">Repuestos en catálogo</p><p class="text-2xl font-bold">{{repuestos.length}}</p></mat-card>
    </div>

    <section *ngIf="auth.role === 'Cliente'" class="mt-8">
      <div class="mb-4">
        <h2 class="text-xl font-semibold text-slate-900">Catálogo de servicios</h2>
        <p class="text-sm text-slate-500">Selecciona un servicio para solicitar una orden de mantención.</p>
      </div>

      <div *ngIf="catLoading" class="text-sm text-slate-500">Cargando catálogo...</div>
      <div *ngIf="clientError" class="mb-3 rounded bg-amber-50 p-3 text-sm text-amber-800">{{clientError}}</div>
      <div *ngIf="clientOk" class="mb-3 rounded bg-emerald-50 p-3 text-sm text-emerald-800">{{clientOk}}</div>
      <div *ngIf="!catLoading && servicios.length === 0" class="rounded border border-dashed p-6 text-center text-sm text-slate-500">No hay servicios disponibles por el momento.</div>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <label class="text-sm text-slate-600">Repuesto (opcional, descuenta stock al asignar):</label>
        <select [(ngModel)]="selectedRepuestoId" class="border rounded px-2 py-1 text-sm bg-white">
          <option [ngValue]="undefined">Sin repuesto</option>
          <option *ngFor="let r of repuestos" [ngValue]="r.id">{{r.nombre}} (stock {{r.stock}})</option>
        </select>
        <a href="/workorders" class="text-sm text-blue-600">Mis órdenes ({{myOrders.length}})</a>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <mat-card *ngFor="let s of servicios" class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-slate-500">{{s.categoria || 'Servicio'}}</p>
              <h3 class="font-semibold text-slate-900">{{s.nombre}}</h3>
            </div>
            <span class="font-semibold text-emerald-700">\${{s.tarifa}}</span>
          </div>
          <p *ngIf="s.descripcion" class="mt-2 text-sm text-slate-600">{{s.descripcion}}</p>
          <div class="mt-4 flex justify-end">
            <button mat-raised-button color="primary" (click)="requestService(s)" [disabled]="clientLoading"><mat-icon>add</mat-icon> Solicitar</button>
          </div>
        </mat-card>
      </div>

      <mat-card class="p-4 mt-6">
        <h2 class="mb-3 text-lg font-semibold">Repuestos</h2>
        <div *ngIf="repuestos.length === 0" class="text-sm text-slate-500">No hay repuestos registrados.</div>
        <div *ngFor="let item of repuestos" class="flex items-center justify-between gap-3 border-b py-3 last:border-0">
          <div><p class="font-medium">{{item.nombre}}</p><p class="text-xs text-slate-500">SKU: {{item.sku}}</p></div>
          <span class="font-semibold" [ngClass]="item.stockBajo ? 'text-red-600' : 'text-slate-700'">Stock: {{item.stock}}</span>
        </div>
      </mat-card>
    </section>
  </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private wo = inject(WorkordersService);
  private cat = inject(CatalogService);
  kpis = { total: 0, porAsignar: 0, asignadas: 0, desplazamiento: 0, ejecucion: 0, cerradas: 0, canceladas: 0, stockCritico: 0, misOrdenes: 0 };
  servicios: ServicioDto[] = [];
  repuestos: RepuestoDto[] = [];
  catLoading = false;
  clientLoading = false;
  clientError: string | null = null;
  clientOk: string | null = null;
  adminPendingOrders: WorkOrderDto[] = [];
  supervisorPendingOrders: WorkOrderDto[] = [];
  lowStockItems: RepuestoDto[] = [];
  myOrders: WorkOrderDto[] = [];
  selectedRepuestoId?: number;

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
      this.myOrders = list.slice(0, 6);
    }, error: ()=>{}});
    this.cat.stockBajo().subscribe({ next: l=> { this.kpis.stockCritico = l.length; this.lowStockItems = l; }, error: ()=>{} });
    this.catLoading = true;
    this.cat.listServicios(true).subscribe({
      next: l => { this.servicios = l; this.catLoading = false; },
      error: () => { this.catLoading = false; }
    });
    this.cat.listRepuestos().subscribe({ next: l => { this.repuestos = l; }, error: ()=>{} });
  }

  statusProgress(status: string): number {
    return ({ CREADA: 1, ASIGNADA: 2, EN_DESPLAZAMIENTO: 3, EN_EJECUCION: 4, CERRADA: 4, CANCELADA: 0 } as Record<string, number>)[status] || 0;
  }

  statusClass(status: string): string {
    return ({ CREADA: 'bg-amber-50 text-amber-700', ASIGNADA: 'bg-blue-50 text-blue-700', EN_DESPLAZAMIENTO: 'bg-cyan-50 text-cyan-700', EN_EJECUCION: 'bg-violet-50 text-violet-700', CERRADA: 'bg-emerald-50 text-emerald-700', CANCELADA: 'bg-red-50 text-red-700' } as Record<string, string>)[status] || 'bg-slate-50 text-slate-700';
  }

  // Vista Cliente: solo solicitar servicios del catálogo. El cambio de estados y la
  // asignación de técnicos es responsabilidad de Supervisor/Admin
  // (ver WorkordersComponent), por eso no hay acciones de avance aquí.
  requestService(s: ServicioDto): void {
    this.clientLoading = true;
    this.clientError = null;
    this.clientOk = null;
    this.wo.create({ clienteEmail: this.auth.user?.email || '', servicio: s.nombre, repuestoId: this.selectedRepuestoId }).subscribe({
      next: order => { this.clientOk = `Orden #${order.id} solicitada para ${s.nombre}`; this.clientLoading = false; },
      error: err => { this.clientError = err.error?.message || err.message; this.clientLoading = false; }
    });
  }
}
