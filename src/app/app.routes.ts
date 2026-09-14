import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { WorkordersComponent } from './features/workorders/workorders.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [MsalGuard] 
  },
  { 
    path: 'workorders', 
    component: WorkordersComponent, 
    canActivate: [MsalGuard] 
  },
  { 
    path: 'catalog', 
    component: CatalogComponent, 
    canActivate: [MsalGuard, roleGuard],
    data: { roles: ['Admin', 'Supervisor'] } // Cliente NO tiene acceso directo a gestión de catálogo
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];