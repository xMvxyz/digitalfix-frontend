import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RepuestoDto, ServicioDto } from '../../shared/models/catalog.models';

export type { RepuestoDto, ServicioDto } from '../../shared/models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = `${environment.apiGatewayUrl}/api/catalog`;

  // servicios
  listServicios(soloActivos?: boolean): Observable<ServicioDto[]> {
    const q = soloActivos ? '?soloActivos=true' : '';
    return this.http.get<ServicioDto[]>(`${this.base}/servicios${q}`);
  }
  createServicio(body: any): Observable<ServicioDto> { return this.http.post<ServicioDto>(`${this.base}/servicios`, body); }
  updateServicio(id: number, body: any): Observable<ServicioDto> { return this.http.put<ServicioDto>(`${this.base}/servicios/${id}`, body); }
  deleteServicio(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/servicios/${id}`); }

  // repuestos
  listRepuestos(): Observable<RepuestoDto[]> { return this.http.get<RepuestoDto[]>(`${this.base}/repuestos`); }
  stockBajo(): Observable<RepuestoDto[]> { return this.http.get<RepuestoDto[]>(`${this.base}/repuestos/stock-bajo`); }
  createRepuesto(body: any): Observable<RepuestoDto> { return this.http.post<RepuestoDto>(`${this.base}/repuestos`, body); }
  updateRepuesto(id: number, body: any): Observable<RepuestoDto> { return this.http.put<RepuestoDto>(`${this.base}/repuestos/${id}`, body); }
  deleteRepuesto(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/repuestos/${id}`); }
  descontar(id: number, cantidad: number): Observable<RepuestoDto> { return this.http.post<RepuestoDto>(`${this.base}/repuestos/${id}/descontar`, { cantidad }); }
  reponer(id: number, cantidad: number): Observable<RepuestoDto> { return this.http.post<RepuestoDto>(`${this.base}/repuestos/${id}/reponer`, { cantidad }); }
}
