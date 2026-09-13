import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth/auth.service';

interface CatalogItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  type: 'SERVICIO' | 'REPUESTO';
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div><h1 class="text-2xl font-bold text-slate-900">Catálogo</h1><p class="text-sm text-slate-500">/api/catalog/* • Servicios técnicos y repuestos • Admin/Supervisor gestionan, Cliente ve</p></div>
      <button *ngIf="auth.role==='Admin'" mat-raised-button color="primary"><mat-icon>add</mat-icon> Nuevo item</button>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <mat-card *ngFor="let item of items" class="p-4 border hover:shadow-lg transition">
        <div class="flex justify-between items-start">
          <span class="text-xs px-2 py-1 rounded-full" [ngClass]="item.type==='SERVICIO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">{{item.type}}</span>
          <span class="text-xs" [ngClass]="item.stock < 5 ? 'text-red-600 font-bold' : 'text-emerald-600'">{{item.stock}} en stock</span>
        </div>
        <h3 class="font-semibold mt-2">{{item.name}}</h3>
        <p class="text-lg font-bold text-slate-900">\${{item.price | number}}</p>
        <div class="mt-3 flex gap-2">
          <button mat-stroked-button class="flex-1 text-xs" *ngIf="auth.role==='Admin' || auth.role==='Supervisor'">Editar</button>
          <button mat-stroked-button class="flex-1 text-xs" [disabled]="item.stock===0">Solicitar</button>
        </div>
        <p *ngIf="item.stock < 5" class="text-xs text-red-600 mt-2">⚠ Stock crítico - Al asignar orden disminuye</p>
      </mat-card>
    </div>

    <div class="mt-6 bg-white p-4 rounded-xl shadow text-sm">
      <h3 class="font-semibold">Regla stock:</h3>
      <p class="text-slate-600">Al asignar una orden (CREADA → ASIGNADA) el stock del repuesto disminuye en 1. Validado en ms-workorders coordinado con ms-catalog vía BFF.</p>
    </div>
  </div>
  `
})
export class CatalogComponent {
  auth = inject(AuthService);
  items: CatalogItem[] = [
    { id: 1, name: 'Reparación Notebook - Diagnóstico', price: 25000, stock: 15, type: 'SERVICIO' },
    { id: 2, name: 'Disco SSD 512GB', price: 45000, stock: 3, type: 'REPUESTO' },
    { id: 3, name: 'Memoria RAM 16GB', price: 35000, stock: 12, type: 'REPUESTO' },
    { id: 4, name: 'Instalación Red Corporativa', price: 80000, stock: 20, type: 'SERVICIO' },
    { id: 5, name: 'Teclado Mecánico', price: 30000, stock: 2, type: 'REPUESTO' },
    { id: 6, name: 'Mantención Preventiva PC', price: 18000, stock: 30, type: 'SERVICIO' },
  ];
}
