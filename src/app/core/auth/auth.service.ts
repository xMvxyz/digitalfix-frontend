import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';

export type UserRole = 'Admin' | 'Supervisor' | 'Cliente' | null;

export interface MockUser {
  name: string;
  email: string;
  role: UserRole;
}

const MOCK_USERS: Record<string, MockUser> = {
  admin: { name: 'Admin DigitalFix', email: 'admin@digitalfix.cl', role: 'Admin' },
  supervisor: { name: 'Supervisor DigitalFix', email: 'supervisor@digitalfix.cl', role: 'Supervisor' },
  cliente: { name: 'Cliente Prueba', email: 'cliente@digitalfix.cl', role: 'Cliente' },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private msal = inject(MsalService, { optional: true });

  private userSubject = new BehaviorSubject<MockUser | null>(this.loadUser());
  private tokenSubject = new BehaviorSubject<string | null>(this.loadToken());

  user$ = this.userSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  get user(): MockUser | null { return this.userSubject.value; }
  get token(): string | null { return this.tokenSubject.value; }
  get isAuthenticated(): boolean { return !!this.tokenSubject.value; }
  get role(): UserRole { return this.userSubject.value?.role ?? null; }

  private loadUser(): MockUser | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem('df_user');
    return raw ? JSON.parse(raw) as MockUser : null;
  }
  private loadToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('df_token');
  }

  // Mock login - simula MSAL hasta tener Entra ID real
  loginAs(role: 'admin' | 'supervisor' | 'cliente'): void {
    if (!this.isBrowser) return;
    const user = MOCK_USERS[role];
    const fakeJwt = `mock-jwt-${role}-${Date.now()}`;
    localStorage.setItem('df_user', JSON.stringify(user));
    localStorage.setItem('df_token', fakeJwt);
    this.userSubject.next(user);
    this.tokenSubject.next(fakeJwt);
  }

  async loginWithMsal(): Promise<void> {
    if (environment.mockAuth) { this.loginAs('cliente'); return; }
    if (!this.msal) { console.warn('MsalService no disponible'); return; }
    const accounts = this.msal.instance.getAllAccounts();
    if (accounts.length === 0) {
      await this.msal.instance.loginRedirect({ scopes: environment.msal.scopes });
    } else {
      this.syncFromMsalAccount(accounts[0]);
    }
  }

  syncFromMsalAccount(account: AccountInfo): void {
    if (!this.isBrowser) return;

    // Establece la cuenta activa para que MsalInterceptor inyecte el Access Token automáticamente
    if (this.msal) {
      this.msal.instance.setActiveAccount(account);
    }

    const claims = (account.idTokenClaims as any) || {};
    const roles: string[] = claims['roles'] || [];
    let role: UserRole = 'Cliente';
    if (roles.map((r:string)=>r.toLowerCase()).includes('admin')) role = 'Admin';
    else if (roles.map((r:string)=>r.toLowerCase()).includes('supervisor')) role = 'Supervisor';
    const user: MockUser = { 
      name: account.name || account.username || 'Usuario',
      email: account.username || '', 
      role 
    };

    localStorage.setItem('df_user', JSON.stringify(user));
    this.userSubject.next(user);
    // token se obtiene via acquireTokenSilent en interceptor MsalInterceptor; guardamos placeholder
    this.msal?.instance.acquireTokenSilent({ 
      scopes: environment.msal.scopes,
      account 
    }).then(res => {
      localStorage.setItem('df_token', res.accessToken);
      this.tokenSubject.next(res.accessToken);
    }).catch(err => console.warn('Error adquiriendo token silencioso:', err));
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('df_user');
      localStorage.removeItem('df_token');
    }
    this.userSubject.next(null);
    this.tokenSubject.next(null);
    if (!environment.mockAuth && this.msal) {
      this.msal.instance.logoutRedirect({ postLogoutRedirectUri: environment.msal.postLogoutRedirectUri });
    }
  }

  hasRole(roles: UserRole[]): boolean {
    if (!roles || roles.length === 0) return true;
    return roles.includes(this.role);
  }

  getAccessToken(): string | null {
    return this.token;
  }
}
