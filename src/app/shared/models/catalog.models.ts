export interface ServicioDto {
  id: number;
  nombre: string;
  descripcion?: string;
  tarifa: number;
  categoria?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepuestoDto {
  id: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  stockBajo: boolean;
  createdAt?: string;
}
