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
