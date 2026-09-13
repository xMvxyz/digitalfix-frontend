import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WorkOrderDto {
  id: number;
  clienteEmail: string;
  servicio: string;
  descripcion?: string;
  estado: string;
  tecnicoAsignado?: string;
  repuestoId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkordersService {
  private http = inject(HttpClient);
  private base = `${environment.apiGatewayUrl}/api/workorders`;

  list(): Observable<WorkOrderDto[]> {
    return this.http.get<WorkOrderDto[]>(this.base);
  }
  get(id: number): Observable<WorkOrderDto> {
    return this.http.get<WorkOrderDto>(`${this.base}/${id}`);
  }
  create(body: { clienteEmail: string; servicio: string; descripcion?: string; repuestoId?: number }): Observable<WorkOrderDto> {
    return this.http.post<WorkOrderDto>(this.base, body);
  }
  changeStatus(id: number, body: { estado: string; tecnico?: string }): Observable<WorkOrderDto> {
    return this.http.patch<WorkOrderDto>(`${this.base}/${id}/status`, body);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
