import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth/auth.service';
import { WorkordersService } from '../../core/services/workorders.service';
import { WorkOrderDto } from '../../shared/models/work-order.models';

interface WorkOrder {
  id: string;
  client: string;
  service: string;
  status: 'CREADA' | 'ASIGNADA' | 'EN_DESPLAZAMIENTO' | 'EN_EJECUCIÓN' | 'CERRADA' | 'CANCELADA';
  technician?: string;
  raw?: WorkOrderDto;
}

@Component({
  selector: 'app-workorders',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSelectModule, 
    MatInputModule, 
    MatChipsModule
  ],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Órdenes de trabajo</h1>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <input [(ngModel)]="newServicio" placeholder="Servicio" class="border rounded px-2 py-1 text-sm bg-white"/>
        <input [(ngModel)]="newDescripcion" placeholder="Descripción" class="border rounded px-2 py-1 text-sm bg-white"/>
        <input *ngIf="isManager()" [(ngModel)]="selectedTechnician" placeholder="Técnico a asignar" class="border rounded px-2 py-1 text-sm bg-white"/>
        <button mat-raised-button color="primary" (click)="createOrder()"><mat-icon>add</mat-icon> Nueva orden</button>
      </div>
    </div>

    <div *ngIf="loading" class="text-sm text-slate-500 mb-2">Cargando órdenes...</div>
    <div *ngIf="error" class="text-sm text-amber-700 bg-amber-50 p-2 rounded mb-2">{{error}}</div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-900 text-white">
            <tr>
              <th class="p-3 text-left">ID</th>
              <th class="p-3 text-left">Cliente</th>
              <th class="p-3 text-left">Servicio</th>
              <th class="p-3 text-left">Detalle</th>
              <th class="p-3 text-left">Estado</th>
              <th class="p-3 text-left">Técnico</th>
              <th class="p-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders" class="border-b hover:bg-slate-50">
              <td class="p-3 font-mono font-semibold">{{o.id}}</td>
              <td class="p-3">{{o.client}}</td>
              <td class="p-3">{{o.service}}</td>
              <td class="p-3 max-w-xs truncate">{{o.raw?.descripcion || '-'}}</td>
              <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium border"
                  [ngClass]="{
                    'bg-slate-100 text-slate-800 border-slate-300': o.status==='CREADA',
                    'bg-blue-100 text-blue-800 border-blue-300': o.status==='ASIGNADA',
                    'bg-amber-100 text-amber-800 border-amber-300': o.status==='EN_DESPLAZAMIENTO',
                    'bg-purple-100 text-purple-800 border-purple-300': o.status==='EN_EJECUCIÓN',
                    'bg-emerald-100 text-emerald-800 border-emerald-300': o.status==='CERRADA',
                    'bg-rose-100 text-rose-800 border-rose-300': o.status==='CANCELADA'
                  }">{{o.status}}</span>
              </td>
              <td class="p-3">{{o.technician || '-'}}</td>
              
              <!-- COLUMNA ACCIÓN REFACTORIZADA -->
              <td class="p-3">
                <!-- Selector de estados para Supervisor y Admin -->
                <div *ngIf="canChangeStatus(o)" class="flex items-center gap-2">
                  <select 
                    [ngModel]="toBackendStatus(o.status)" 
                    (ngModelChange)="onStatusChange(o, $event)"
                    class="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer">
                    <option value="CREADA" [disabled]="o.status !== 'CREADA'">CREADA</option>
                    <option value="ASIGNADA" [disabled]="o.status === 'CERRADA' || o.status === 'CANCELADA'">ASIGNADA</option>
                    <option value="EN_DESPLAZAMIENTO" [disabled]="o.status === 'CREADA' || o.status === 'CERRADA' || o.status === 'CANCELADA'">EN DESPLAZAMIENTO</option>
                    <!-- Regla de negocio: No pasar a EN_EJECUCION sin antes ASIGNAR -->
                    <option value="EN_EJECUCION" [disabled]="o.status !== 'ASIGNADA' && o.status !== 'EN_DESPLAZAMIENTO'">EN EJECUCIÓN</option>
                    <option value="CERRADA" [disabled]="o.status === 'CREADA' || o.status === 'CANCELADA'">CERRADA</option>
                    <option value="CANCELADA" [disabled]="o.status === 'CERRADA'">CANCELADA</option>
                  </select>

                  <button mat-icon-button *ngIf="auth.role === 'Admin' && canDelete(o)" (click)="deleteOrder(o)" title="Eliminar orden" class="text-rose-600">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>

                <!-- Si es Cliente o está terminada -->
                <span *ngIf="!canChangeStatus(o)" class="text-xs text-slate-400 italic">Solo lectura</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class WorkordersComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(WorkordersService);
  orders: WorkOrder[] = [];
  loading = false;
  error: string | null = null;
  newServicio = '';
  newDescripcion = '';
  newRepuestoId?: number;
  selectedTechnician = '';

  ngOnInit(): void {
    this.load();
  }

  isManager(): boolean {
    return this.auth.role === 'Admin' || this.auth.role === 'Supervisor';
  }

  private mapDto(d: WorkOrderDto): WorkOrder {
    const st = (d.estado?.replace('EN_EJECUCION', 'EN_EJECUCIÓN') as WorkOrder['status']) || 'CREADA';
    return {
      id: String(d.id),
      client: d.clienteEmail,
      service: d.servicio,
      status: st,
      technician: d.tecnicoAsignado,
      raw: d
    };
  }

  toBackendStatus(status: WorkOrder['status']): string {
    return status === 'EN_EJECUCIÓN' ? 'EN_EJECUCION' : status;
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.list().subscribe({
      next: list => {
        this.orders = list.map(d => this.mapDto(d));
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || err.message;
        this.loading = false;
        if (this.orders.length === 0) {
          this.orders = [
            { id: 'WF-1023', client: 'cliente@digitalfix.cl', service: 'Reparación Notebook', status: 'EN_DESPLAZAMIENTO', technician: 'Técnico A' },
            { id: 'WF-1024', client: 'cliente@digitalfix.cl', service: 'Instalación Red', status: 'CREADA' }
          ];
        }
      }
    });
  }

  canChangeStatus(o: WorkOrder): boolean {
    // Solo Admin y Supervisor pueden modificar estados de órdenes
    return this.isManager() && o.status !== 'CERRADA' && o.status !== 'CANCELADA';
  }

  canDelete(o: WorkOrder): boolean {
    return o.status !== 'CERRADA';
  }

  onStatusChange(o: WorkOrder, nextStatus: string): void {
    if (nextStatus === this.toBackendStatus(o.status)) return;

    // Validación defensiva en frontend de la regla de negocio
    if (nextStatus === 'EN_EJECUCION' && o.status !== 'ASIGNADA' && o.status !== 'EN_DESPLAZAMIENTO') {
      alert('Regla de negocio: No se puede pasar a EN_EJECUCIÓN sin haber sido ASIGNADA previamente.');
      return;
    }

    const payload: { estado: string; tecnico?: string } = { estado: nextStatus };

    // Si se transiciona a ASIGNADA, se asocia el técnico ingresado
    if (nextStatus === 'ASIGNADA') {
      const tecnico = this.selectedTechnician.trim() || 'Técnico General';
      payload.tecnico = tecnico;
    }

    const idNum = Number(o.id) || Number(o.raw?.id);
    if (!idNum) {
      o.status = (nextStatus.replace('EN_EJECUCION', 'EN_EJECUCIÓN') as WorkOrder['status']);
      return;
    }

    this.api.changeStatus(idNum, payload).subscribe({
      next: dto => Object.assign(o, this.mapDto(dto)),
      error: err => {
        alert('Transición rechazada: ' + (err.error?.message || err.error?.error || err.message));
        this.load();
      }
    });
  }

  deleteOrder(o: WorkOrder): void {
    const idNum = Number(o.id) || Number(o.raw?.id);
    if (!idNum || !confirm(`¿Eliminar la orden ${o.id}?`)) return;
    this.api.delete(idNum).subscribe({
      next: () => this.orders = this.orders.filter(order => order !== o),
      error: err => alert('No se pudo eliminar: ' + (err.error?.message || err.message))
    });
  }

  createOrder(): void {
    const body = {
      clienteEmail: this.auth.user?.email || 'cliente@digitalfix.cl',
      servicio: this.newServicio || 'Mantenimiento General',
      descripcion: this.newDescripcion || undefined,
      repuestoId: this.newRepuestoId || undefined
    };
    this.api.create(body).subscribe({
      next: dto => {
        this.orders.unshift(this.mapDto(dto));
        this.newServicio = '';
        this.newDescripcion = '';
      },
      error: err => alert('Error al crear orden: ' + (err.error?.message || err.message))
    });
  }
}