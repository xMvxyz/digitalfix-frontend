import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: ``
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DigitalFix';

  private msal = inject(MsalService, { optional: true });
  private msalBroadcast = inject(MsalBroadcastService, { optional: true });
  private auth = inject(AuthService);
  private destroy$ = new Subject<void>();

  async ngOnInit(): Promise<void> {
    // MSAL exige initialize() antes de cualquier API (getAllAccounts, etc.).
    // Sin este await, el arranque lanza uninitialized_public_client_application.
    try {
      await this.msal?.instance.initialize();
    } catch (e) {
      console.warn('MSAL initialize:', e);
      return;
    }

    // La app actúa como SPA: al arrancar (F5 o vuelta del redirect de Entra ID)
    // se sincroniza la cuenta MSAL en cache hacia el AuthService, sin recarga manual.
    // handleRedirectPromise() procesa la respuesta del redirect de login/logout;
    // sin esto, tras cerrar sesión el flag interaction_in_progress queda pegado
    // y el siguiente login falla con interaction_in_progress.
    await this.handleRedirectAndSync();

    this.msalBroadcast?.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.LOGIN_SUCCESS ||
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
          msg.eventType === EventType.HANDLE_REDIRECT_END
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((msg: EventMessage) => {
        const payloadAccount = (msg.payload as AuthenticationResult | null)?.account;
        const fallback = this.msal?.instance.getAllAccounts()[0];
        const account = payloadAccount ?? fallback;
        if (account) {
          this.auth.syncFromMsalAccount(account);
        } else {
          this.syncActiveAccount();
        }
      });
  }

  private async handleRedirectAndSync(): Promise<void> {
    try {
      const result = await this.msal?.instance.handleRedirectPromise();
      if (result?.account) {
        this.auth.syncFromMsalAccount(result.account);
        return;
      }
    } catch (e) {
      console.warn('MSAL redirect:', e);
    }
    this.syncActiveAccount();
  }

  private syncActiveAccount(): void {
    if (!this.msal) return;
    const accounts = this.msal.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.auth.syncFromMsalAccount(accounts[0]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
