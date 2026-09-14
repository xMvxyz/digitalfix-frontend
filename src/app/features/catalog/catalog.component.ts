import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth/auth.service';
import { CatalogService } from '../../core/services/catalog.service';

interface CatalogItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  type: 'SERVICIO' | 'REPUESTO';
  responsable?: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <div><h1 class="text-2xl font-bold text-slate-900">Catálogo</h1>
      <p class="text-sm text-slate-500">Gestión exclusiva del Supervisor sobre sus items asignados.</p></div>
      <button *ngIf="auth.role==='Supervisor'" mat-raised-button color="primary" (click)="startCreate()"><mat-icon>add</mat-icon> Nuevo item</button>
    </div>
    <label class="mb-4 inline-flex items-center gap-2 text-sm text-slate-600">
      <input type="checkbox" [(ngModel)]="onlyMine" class="accent-blue-600" /> Solo mis asignados
    </label>

    <div *ngIf="formOpen" class="mb-6 rounded-lg border bg-slate-50 p-4">
      <div class="mb-3 flex items-center justify-between"><h2 class="font-semibold">{{editing ? 'Editar item' : 'Nuevo item'}}</h2><button mat-icon-button (click)="closeForm()" aria-label="Cerrar"><mat-icon>close</mat-icon></button></div>
      <div class="grid gap-3 md:grid-cols-3">
        <select [(ngModel)]="form.type" [disabled]="!!editing" class="rounded border bg-white px-2 py-2"><option value="SERVICIO">Servicio</option><option value="REPUESTO">Repuesto</option></select>
        <input [(ngModel)]="form.name" placeholder="Nombre" class="rounded border px-2 py-2" />
        <input [(ngModel)]="form.price" type="number" min="1" placeholder="Precio / tarifa" class="rounded border px-2 py-2" />
        <input *ngIf="form.type === 'REPUESTO'" [(ngModel)]="form.sku" placeholder="SKU" class="rounded border px-2 py-2" />
        <input *ngIf="form.type === 'REPUESTO'" [(ngModel)]="form.stock" type="number" min="0" placeholder="Stock" class="rounded border px-2 py-2" />
        <input *ngIf="form.type === 'REPUESTO'" [(ngModel)]="form.stockMinimo" type="number" min="0" placeholder="Stock mínimo" class="rounded border px-2 py-2" />
        <input [(ngModel)]="form.description" placeholder="Descripción" class="rounded border px-2 py-2 md:col-span-2" />
        <input [(ngModel)]="form.responsable" placeholder="Responsable (email supervisor, vacío = auto-asignarme)" class="rounded border px-2 py-2 md:col-span-2" />
        <button mat-raised-button color="primary" (click)="saveItem()">{{editing ? 'Guardar cambios' : 'Crear item'}}</button>
      </div>
      <p *ngIf="formError" class="mt-2 text-sm text-red-700">{{formError}}</p>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <mat-card *ngFor="let item of visibleItems" class="p-4 border hover:shadow-lg transition">
        <div class="flex justify-between items-start">
          <span class="text-xs px-2 py-1 rounded-full" [ngClass]="item.type==='SERVICIO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">{{item.type}}</span>
          <span class="text-xs" [ngClass]="item.stock < 5 ? 'text-red-600 font-bold' : 'text-emerald-600'">{{item.stock}} en stock</span>
        </div>
        <h3 class="font-semibold mt-2">{{item.name}}</h3>
        <p class="text-lg font-bold text-slate-900">\${{item.price | number}}</p>
        <p class="text-xs mt-1" [ngClass]="item.responsable ? 'text-slate-500' : 'text-amber-600'">{{item.responsable ? 'Asignado: ' + item.responsable : 'Sin asignar'}}</p>
        <div class="mt-3 flex gap-2">
          <button mat-stroked-button class="flex-1 text-xs" *ngIf="canManage(item)" (click)="editItem(item)"><mat-icon>edit</mat-icon> Editar</button>
          <button mat-stroked-button class="flex-1 text-xs" *ngIf="canManage(item)" (click)="deleteItem(item)"><mat-icon>delete</mat-icon> Eliminar</button>
          <button mat-stroked-button class="flex-1 text-xs" *ngIf="item.type==='REPUESTO' && canManage(item)" (click)="adjustStock(item, 1)"><mat-icon>add</mat-icon> Stock</button>
        </div>
        <p *ngIf="item.stock < 5" class="text-xs text-red-600 mt-2">Stock crítico</p>
      </mat-card>
    </div>

  </div>
  `
})
export class CatalogComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(CatalogService);
  items: CatalogItem[] = [];
  onlyMine = false;
  loading=false; error:string|null=null;
  formOpen = false;
  editing: CatalogItem | null = null;
  formError: string | null = null;
  form = { type: 'SERVICIO' as CatalogItem['type'], name: '', price: 1, description: '', sku: '', stock: 0, stockMinimo: 0, responsable: '' };
  ngOnInit(): void { this.load(); }

  get visibleItems(): CatalogItem[] {
    if (!this.onlyMine) return this.items;
    const email = (this.auth.user?.email || '').toLowerCase();
    return this.items.filter(i => (i.responsable || '').toLowerCase() === email);
  }

  canManage(item: CatalogItem): boolean {
    if (this.auth.role !== 'Supervisor') return false;
    if (!item.responsable) return true;
    return item.responsable.toLowerCase() === (this.auth.user?.email || '').toLowerCase();
  }
  load(): void {
    this.loading=true;
    // Intenta BFF, fallback mock
    this.api.listRepuestos().subscribe({
      next: reps => {
        this.api.listServicios().subscribe({
          next: servs => { this.items = [...servs.map(s=>({id:s.id,name:s.nombre,price:Number(s.tarifa),stock:999,type:'SERVICIO' as const,responsable:s.responsable})), ...reps.map(r=>({id:r.id,name:r.nombre,price:Number(r.precio),stock:r.stock,type:'REPUESTO' as const,responsable:r.responsable}))]; this.loading=false; },
          error: ()=>{ this.items = reps.map(r=>({id:r.id,name:r.nombre,price:Number(r.precio),stock:r.stock,type:'REPUESTO' as const,responsable:r.responsable})); this.loading=false; }
        });
      },
      error: err => { this.error = err.error?.message || err.message; this.loading=false; this.items=[
        { id: 1, name: 'Reparación Notebook - Diagnóstico', price: 25000, stock: 15, type: 'SERVICIO' },
        { id: 2, name: 'Disco SSD 512GB', price: 45000, stock: 3, type: 'REPUESTO' },
        { id: 3, name: 'Memoria RAM 16GB', price: 35000, stock: 12, type: 'REPUESTO' },
      ];}
    });
  }

  startCreate(): void { this.editing = null; this.form = { type: 'SERVICIO', name: '', price: 1, description: '', sku: '', stock: 0, stockMinimo: 0, responsable: '' }; this.formError = null; this.formOpen = true; }

  editItem(item: CatalogItem): void { this.editing = item; this.form = { type: item.type, name: item.name, price: item.price, description: '', sku: '', stock: item.stock, stockMinimo: 0, responsable: item.responsable || '' }; this.formError = null; this.formOpen = true; }

  closeForm(): void { this.formOpen = false; this.editing = null; }

  saveItem(): void {
    if (!this.form.name.trim() || this.form.price <= 0) { this.formError = 'Nombre y precio válido son obligatorios.'; return; }
    const responsable = this.form.responsable.trim() || undefined; // vacío = auto-asignarme en backend
    const request = this.form.type === 'SERVICIO'
      ? { nombre: this.form.name, descripcion: this.form.description || undefined, tarifa: this.form.price, categoria: 'GENERAL', activo: true, responsable }
      : { nombre: this.form.name, descripcion: this.form.description || undefined, sku: this.form.sku || this.form.name.toUpperCase().replace(/\s+/g, '-'), precio: this.form.price, stock: this.form.stock, stockMinimo: this.form.stockMinimo, responsable };
    const operation: Observable<unknown> = this.editing
      ? (this.form.type === 'SERVICIO' ? this.api.updateServicio(this.editing.id, request) : this.api.updateRepuesto(this.editing.id, request))
      : (this.form.type === 'SERVICIO' ? this.api.createServicio(request) : this.api.createRepuesto(request));
    operation.subscribe({ next: () => { this.closeForm(); this.load(); }, error: err => this.formError = err.error?.message || err.message });
  }

  deleteItem(item: CatalogItem): void {
    if (!confirm(`¿Eliminar ${item.name}?`)) return;
    const operation = item.type === 'SERVICIO' ? this.api.deleteServicio(item.id) : this.api.deleteRepuesto(item.id);
    operation.subscribe({ next: () => this.load(), error: err => this.error = err.error?.message || err.message });
  }

  adjustStock(item: CatalogItem, quantity: number): void {
    this.api.reponer(item.id, quantity).subscribe({ next: updated => { item.stock = updated.stock; }, error: err => this.error = err.error?.message || err.message });
  }
}
