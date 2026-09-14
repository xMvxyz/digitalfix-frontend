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
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatInputModule, MatChipsModule],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div><h1 class="text-2xl font-bold text-slate-900">Órdenes de trabajo</h1></div>
      <div class="flex gap-2">
        <input [(ngModel)]="newServicio" placeholder="Servicio" class="border rounded px-2 py-1 text-sm"/>
        <input [(ngModel)]="newDescripcion" placeholder="Descripción" class="border rounded px-2 py-1 text-sm"/>
        <input *ngIf="auth.role==='Admin' || auth.role==='Supervisor'" [(ngModel)]="selectedTechnician" placeholder="Técnico para asignar" class="border rounded px-2 py-1 text-sm"/>
        <button mat-raised-button color="primary" (click)="createOrder()"><mat-icon>add</mat-icon> Nueva orden</button>
      </div>
    </div>
    <div *ngIf="loading" class="text-sm text-slate-500">Cargando...</div>
    <div *ngIf="error" class="text-sm text-amber-700 bg-amber-50 p-2 rounded mb-2">{{error}} (mostrando mock)</div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-900 text-white">
            <tr><th class="p-3 text-left">ID</th><th class="p-3 text-left">Cliente</th><th class="p-3 text-left">Servicio</th><th class="p-3 text-left">Detalle</th><th class="p-3 text-left">Estado</th><th class="p-3 text-left">Técnico</th><th class="p-3 text-left">Acción</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders" class="border-b hover:bg-slate-50">
              <td class="p-3 font-mono">{{o.id}}</td>
              <td class="p-3">{{o.client}}</td>
              <td class="p-3">{{o.service}}</td>
              <td class="p-3 max-w-xs truncate">{{o.raw?.descripcion || '-'}}</td>
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
                <button mat-stroked-button *ngIf="canCancel(o)" (click)="cancelOrder(o)" class="ml-1 text-xs">Cancelar</button>
                <button mat-icon-button *ngIf="auth.role==='Admin' && canDelete(o)" (click)="deleteOrder(o)" aria-label="Eliminar orden"><mat-icon>delete</mat-icon></button>
                <span *ngIf="!canChangeStatus(o) && !canCancel(o)" class="text-xs text-slate-400">Sin acción</span>
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
  loading = false; error: string | null = null;
  newServicio = ''; newDescripcion=''; newRepuestoId?: number; selectedTechnician = '';

  ngOnInit(): void { this.load(); }

  private mapDto(d: WorkOrderDto): WorkOrder {
    const st = (d.estado?.replace('EN_EJECUCION','EN_EJECUCIÓN') as WorkOrder['status']) || 'CREADA';
    return { id: String(d.id), client: d.clienteEmail, service: d.servicio, status: st, technician: d.tecnicoAsignado, raw: d };
  }

  load(): void {
    this.loading=true; this.error=null;
    this.api.list().subscribe({
      next: list => { this.orders = list.map(d=>this.mapDto(d)); this.loading=false; },
      error: err => { this.error = err.error?.message || err.message; this.loading=false; // fallback mock si BFF no disponible
        if (this.orders.length===0) this.orders=[
          { id: 'WF-1023', client: 'cliente@digitalfix.cl', service: 'Reparación Notebook', status: 'EN_DESPLAZAMIENTO', technician: 'Técnico A' },
          { id: 'WF-1024', client: 'cliente@digitalfix.cl', service: 'Instalación Red', status: 'CREADA' },
        ];
      }
    });
  }

  canChangeStatus(o: WorkOrder): boolean {
    if (this.auth.role === 'Admin' || this.auth.role === 'Supervisor' || this.auth.role === 'Cliente') return o.status !== 'CERRADA' && o.status !== 'CANCELADA';
    return false;
  }

  canCancel(o: WorkOrder): boolean {
    return (this.auth.role === 'Admin' || this.auth.role === 'Supervisor' || this.auth.role === 'Cliente') && o.status !== 'CERRADA' && o.status !== 'CANCELADA';
  }

  canDelete(o: WorkOrder): boolean {
    return o.status !== 'CERRADA';
  }

  cancelOrder(o: WorkOrder): void {
    const idNum = Number(o.id) || Number(o.raw?.id);
    if (!idNum || !confirm(`¿Cancelar la orden ${o.id}?`)) return;
    this.api.changeStatus(idNum, { estado: 'CANCELADA' }).subscribe({
      next: dto => Object.assign(o, this.mapDto(dto)),
      error: err => alert('No se pudo cancelar: ' + (err.error?.message || err.message))
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

  nextStatus(o: WorkOrder) {
    const flow: Record<string, WorkOrder['status']> = { 'CREADA':'ASIGNADA','ASIGNADA':'EN_DESPLAZAMIENTO','EN_DESPLAZAMIENTO':'EN_EJECUCIÓN','EN_EJECUCIÓN':'CERRADA' };
    const next = flow[o.status];
    if (!next) return;
    const payload: { estado: string; tecnico?: string } = { estado: next.replace('EN_EJECUCIÓN','EN_EJECUCION') };
    if (next==='ASIGNADA') {
      payload.tecnico = (this.auth.role === 'Admin' || this.auth.role === 'Supervisor')
        ? this.selectedTechnician.trim()
        : 'cliente.' + (this.auth.user?.email || 'usuario');
      if (!payload.tecnico) { alert('Selecciona o escribe un técnico antes de asignar.'); return; }
    }
    const idNum = Number(o.id) || Number(o.raw?.id);
    if (!idNum) { o.status=next; return; }
    this.api.changeStatus(idNum, payload).subscribe({
      next: dto => Object.assign(o, this.mapDto(dto)),
      error: err => alert('Transición rechazada: ' + (err.error?.message || err.error?.error || err.message))
    });
  }

  createOrder() {
    const body = { clienteEmail: this.auth.user?.email || 'cliente@digitalfix.cl', servicio: this.newServicio || 'Servicio nuevo', descripcion: this.newDescripcion || undefined, repuestoId: this.newRepuestoId || undefined };
    this.api.create(body).subscribe({
      next: dto => { this.orders.unshift(this.mapDto(dto)); this.newServicio=''; this.newDescripcion=''; },
      error: err => alert('Error crear: '+(err.error?.message||err.message))
    });
  }
}
