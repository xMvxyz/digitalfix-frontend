# DigitalFix Frontend — Caso 6

Angular 18 standalone + MSAL + Material. Login con Microsoft Entra ID y consumo del API Gateway.

## MSAL

`src/environments/environment.ts`:

- clientId `d1b27c5e-...`, authority `.../0c1f677f-...`, redirect `http://localhost:4200/`
- scopes `api://2cd82242-.../access_as_user`
- `apiGatewayUrl=https://sscgh3fxo1.execute-api.us-east-1.amazonaws.com/Stage-API-Prueba`

`app.config.ts`: `MsalGuard` + `MsalInterceptor` (Redirect). `role.guard.ts` lee roles de `idTokenClaims + accessToken`.

## Rutas y roles

- `/login` pública
- `/dashboard` Admin, Supervisor, Cliente (KPIs / cola / catálogo según rol)
- `/workorders` Admin, Supervisor, Cliente (Cliente solo lectura, managers cambian estado + `tecnico` requerido al asignar + `repuestoId` opcional)
- `/catalog` Admin, Supervisor (gestión según `responsable`)

## Probar local

```
npm install
npm start # http://localhost:4200/
```

Tokens para Postman: login por rol → F12 → `Local Storage → df_token` (accessToken). Usar perfil distinto por rol para no mezclar caché MSAL. Validar en `jwt.ms` (`aud`, `roles`, `preferred_username`).

## Colección Postman EP1

https://benjamin-1874968.postman.co/workspace/Benjamin's-Workspace~edccb9a7-d9b0-4dac-8429-645e20bcb7f8/collection/45505473-ff1f78c6-e53c-4f7b-b861-e5387a510074?action=share&creator=45505473

Pruebas: sin token 401, token inválido 401, rol autorizado 200/201, sin permiso 403, regla inválida 409, regla válida 200.
