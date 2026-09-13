import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth/auth.service';

interface WorkOrder {
  id: string;
  client: string;
  service: string;
  status: 'CREADA' | 'ASIGNADA' | 'EN_DESPLAZAMIENTO' | 'EN_EJECUCIÓN' | 'CERRADA' | 'CANCELADA';
  technician?: string;
}

@Component({
  selector: 'app-workorders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatInputModule, MatChipsModule],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div><h1 class="text-2xl font-bold text-slate-900">Órdenes de trabajo</h1><p class="text-sm text-slate-500">Módulo principal • /api/workorders/* • Cliente crea, Supervisor/Admin cambia estados</p></div>
      <button mat-raised-button color="primary" (click)="createOrder()"><mat-icon>add</mat-icon> Nueva orden</button>
    </div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-900 text-white">
            <tr><th class="p-3 text-left">ID</th><th class="p-3 text-left">Cliente</th><th class="p-3 text-left">Servicio</th><th class="p-3 text-left">Estado</th><th class="p-3 text-left">Técnico</th><th class="p-3 text-left">Acción</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders" class="border-b hover:bg-slate-50">
              <td class="p-3 font-mono">{{o.id}}</td>
              <td class="p-3">{{o.client}}</td>
              <td class="p-3">{{o.service}}</td>
              <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium border"
                  [ngClass]="{
                    'badge-creada': o.status==='CREADA',
                    'badge-asignada': o.status==='ASIGNADA',
                    'badge-desplazamiento': o.status==='EN_DESPLAZAMIENTO',
                    'badge-ejecucion': o.status==='EN_EJECUCIÓN',
                    'badge-cerrada': o.status==='CERRADA',
                    'badge-cancelada': o.status==='CANCELADA'
                  }">{{o.status}}</span>
              </td>
              <td class="p-3">{{o.technician || '-'}}</td>
              <td class="p-3">
                <button mat-stroked-button *ngIf="canChangeStatus(o)" (click)="nextStatus(o)" class="text-xs">Avanzar</button>
                <span *ngIf="!canChangeStatus(o)" class="text-xs text-slate-400">{{ auth.role==='Cliente' ? 'Solo lectura' : 'Sin acción' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-800">
        <strong>Regla negocio:</strong> No se puede pasar a EN_EJECUCIÓN sin ASIGNAR. Al asignar disminuye stock del repuesto (ver /catalog).
      </div>
    </div>

    <div class="mt-4 text-xs text-slate-500">Rol actual: {{auth.role}} • Cliente ve solo sus órdenes, Supervisor/Admin ven todas y cambian estado.</div>
  </div>
  `
})
export class WorkordersComponent {
  auth = inject(AuthService);
  orders: WorkOrder[] = [
    { id: 'WF-1023', client: 'cliente@digitalfix.cl', service: 'Reparación Notebook', status: 'EN_DESPLAZAMIENTO', technician: 'Técnico A' },
    { id: 'WF-1024', client: 'cliente@digitalfix.cl', service: 'Instalación Red', status: 'CREADA' },
    { id: 'WF-1025', client: 'juan@test.cl', service: 'Mantención Impresora', status: 'ASIGNADA', technician: 'Técnico B' },
    { id: 'WF-1026', client: 'juan@test.cl', service: 'Cambio Disco SSD', status: 'EN_EJECUCIÓN', technician: 'Técnico A' },
  ];

  canChangeStatus(o: WorkOrder): boolean {
    if (this.auth.role === 'Cliente') return false;
    if (this.auth.role === 'Admin' || this.auth.role === 'Supervisor') return o.status !== 'CERRADA' && o.status !== 'CANCELADA';
    return false;
  }

  nextStatus(o: WorkOrder) {
    const flow: Record<string, WorkOrder['status']> = {
      'CREADA': 'ASIGNADA',
      'ASIGNADA': 'EN_DESPLAZAMIENTO',
      'EN_DESPLAZAMIENTO': 'EN_EJECUCIÓN',
      'EN_EJECUCIÓN': 'CERRADA'
    };
    const next = flow[o.status];
    if (next) {
      if (o.status === 'CREADA') o.technician = 'Técnico A (stock -1)';
      o.status = next;
    }
  }

  createOrder() {
    const id = `WF-${1027 + this.orders.length}`;
    this.orders.unshift({ id, client: this.auth.user?.email || 'cliente@digitalfix.cl', service: 'Servicio nuevo', status: 'CREADA' });
  }
}
