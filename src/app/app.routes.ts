import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { MsalGuard } from '@azure/msal-angular';
import { environment } from '../environments/environment';

const guards = environment.mockAuth ? [authGuard] : [MsalGuard, authGuard];

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: guards,
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'workorders', loadComponent: () => import('./features/workorders/workorders.component').then(m => m.WorkordersComponent) },
      { path: 'catalog', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent), canActivate: [roleGuard], data: { roles: ['Admin','Supervisor'] } },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
