import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { WorkordersComponent } from './features/workorders/workorders.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [MsalGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'workorders',
        component: WorkordersComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Supervisor'] } // Solo Supervisor y Admin ven órdenes
      },
      {
        path: 'catalog',
        component: CatalogComponent,
        canActivate: [roleGuard],
        data: { roles: ['Supervisor'] } // Gestión exclusiva del Supervisor
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];