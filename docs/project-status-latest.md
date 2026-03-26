# MeDashboard — Estado Actual (Mar 2026)

## Resumen Ejecutivo

La app esta funcional en todos los modulos principales (Notes, Finances, Calendar, Videos, Notifications, Settings, Home, Games), con PWA activa y sincronizacion con Google Calendar implementada.

En esta ultima iteracion se agregaron:

- Analitica visual en Finances con Canvas API nativo (sin librerias externas).
- Tracking de pagos por cuota en deudas.
- Vista read-only de detalle de nota en `/notes/[id]`.

---

## Stack y arquitectura

- Next.js 16.1.6 (App Router, Turbopack)
- React 19.2.3
- TypeScript strict
- Tailwind CSS v4
- Supabase SSR (`@supabase/ssr`)
- TipTap v3
- Vercel (target deploy)

Patron aplicado en todo el proyecto:

- `page.tsx` como Server Component para fetch y render inicial.
- Interactividad aislada en Client Components.
- Mutaciones en `lib/actions/*.ts` (`"use server"`).
- Queries de lectura en `lib/data/*.ts`.
- `Promise.all()` para fetch paralelo.

---

## Cambios recientes implementados

## 1) PWA

### Hecho

- `public/manifest.json` completo y valido.
- Metadata PWA en `app/layout.tsx`:
  - `manifest`
  - `appleWebApp`
  - `viewport.themeColor`
  - icono apple touch
- Ajuste en `proxy.ts` para excluir `manifest.json` del matcher (evita redireccion y error de parseo).
- Enriquecimiento de manifest:
  - `id`, `scope`, `lang`, `categories`, `shortcuts`

### Estado

- PWA instalable y funcionando en navegador.
- Sin service worker (intencional por alcance actual).

---

## 2) Google Calendar (OAuth + Sync)

### Hecho

- `lib/actions/google-calendar.ts`:
  - `connectGoogleCalendar()`
  - `disconnectGoogleCalendar()`
  - `getGoogleCalendarStatus()`
  - `refreshGoogleToken(userId)` (helper interno)
  - `syncGoogleCalendarEvents()` (fetch + upsert idempotente)
- `app/auth/google-calendar/callback/route.ts`:
  - intercambio de `code` por tokens
  - upsert en `google_tokens`
  - redirect con estado a settings
- UI de conexion/sync:
  - `app/(dashboard)/settings/GoogleCalendarSection.tsx`
  - boton de sync en `app/(dashboard)/calendar/SyncGoogleCalendarButton.tsx`
  - integracion en `app/(dashboard)/calendar/page.tsx` y `app/(dashboard)/settings/page.tsx`

### Estado

- Conexion/desconexion operativa.
- Sync manual operativa (sin duplicados por `onConflict: google_event_id`).

---

## 3) Notes (Tags + detalle)

### Hecho

- Soporte de tags en tipos y acciones:
  - `lib/supabase/database.types.ts`
  - `lib/actions/notes.ts`
- Selector reutilizable de tags:
  - `app/(dashboard)/notes/TagSelector.tsx`
- Integracion en alta/edicion de notas:
  - `app/(dashboard)/notes/new/page.tsx`
  - `app/(dashboard)/notes/[id]/edit/EditNoteClient.tsx`
- Render de tags y filtro:
  - `app/(dashboard)/notes/NoteCard.tsx`
  - `app/(dashboard)/notes/NoteListClient.tsx`
- Vista read-only de detalle:
  - `app/(dashboard)/notes/[id]/page.tsx`
  - con `Card`, `Badge`, botones Back/Edit y render HTML con clases `prose`
  - redirect a `/notes` cuando no existe

### Estado

- Flujo completo create/edit/view/filter con tags.

---

## 4) Finances (Charts + cuotas)

### Hecho

- Nuevo componente:
  - `app/(dashboard)/finances/SpendingChart.tsx`
- Integracion:
  - `app/(dashboard)/finances/page.tsx`
- Grficos Canvas API:
  - Barras horizontales de gastos por categoria (mes actual, top 8).
  - Linea de tendencia de balance neto (ultimos 6 meses desde `monthly_summary`).
  - Responsivo con `ResizeObserver`.
- Cuotas de deudas:
  - SQL entregado para tabla `debt_payments` (manual en Supabase).
  - Tipos agregados en `lib/supabase/database.types.ts`.
  - Query `getDebtPayments(debtId)` en `lib/data/debts.ts`.
  - Action `recordInstallmentPayment(...)` en `lib/actions/debts.ts`.
  - `DebtCard` actualizado con:
    - boton "Pay installment"
    - formulario inline (monto + nota)
    - historial mini (ultimos 3 pagos)
    - progreso calculado con historial real de pagos

### Importante

- Para que el tracking de cuotas funcione en runtime, hay que ejecutar la migracion SQL de `debt_payments` en Supabase.

---

## Estado por modulo

- Notes: **completo y estable**
- Finances: **completo**, pendiente solo ejecutar SQL de cuotas en DB (si no esta aplicada)
- Calendar: **completo**, sync Google manual operativo
- Videos: **estable**
- Notifications: **estable**
- Settings: **estable** (incluye Google Calendar)
- Home: **estable**
- Games/Minesweeper: **estable** con ajustes responsive aplicados

---

## Pendientes recomendados (prioridad)

## P1 (cierre funcional)

1. Automatizar sync Google Calendar (cron/background) en vez de solo manual.
2. Confirmar migracion `debt_payments` aplicada en todos los entornos (dev/prod).

## P2 (polish final)

3. Agregar screenshots al manifest para eliminar warnings de install UX.
4. Refinar iconos maskable para evitar recorte en algunos launchers Android.

## P3 (mejora futura, no bloqueante)

5. Notificaciones push reales (actualmente agregacion in-app).
6. Visualizaciones extra en finanzas (ej: tendencia por categoria anual).

---

## Checklist rapido de validacion

- PWA:
  - `http://localhost:3000/manifest.json` responde JSON valido.
  - Install prompt visible en Chrome.
- Google Calendar:
  - Connect -> callback -> estado connected.
  - Sync now crea/actualiza eventos sin duplicar.
- Notes:
  - Crear/editar con tags.
  - Filtro por tag en lista.
  - `/notes/[id]` render read-only correcto.
- Debts:
  - Registrar cuota desde DebtCard.
  - Barra de progreso y remaining actualizan con pagos.

---

## Archivos claves tocados en las ultimas iteraciones

- `app/layout.tsx`
- `proxy.ts`
- `public/manifest.json`
- `lib/actions/google-calendar.ts`
- `app/auth/google-calendar/callback/route.ts`
- `app/(dashboard)/settings/GoogleCalendarSection.tsx`
- `app/(dashboard)/calendar/page.tsx`
- `app/(dashboard)/calendar/SyncGoogleCalendarButton.tsx`
- `app/(dashboard)/finances/SpendingChart.tsx`
- `app/(dashboard)/finances/page.tsx`
- `app/(dashboard)/finances/DebtCard.tsx`
- `lib/data/debts.ts`
- `lib/actions/debts.ts`
- `app/(dashboard)/notes/[id]/page.tsx`
- `lib/actions/notes.ts`
- `app/(dashboard)/notes/TagSelector.tsx`
- `app/(dashboard)/notes/new/page.tsx`
- `app/(dashboard)/notes/[id]/edit/EditNoteClient.tsx`
- `app/(dashboard)/notes/NoteCard.tsx`
- `app/(dashboard)/notes/NoteListClient.tsx`
- `lib/supabase/database.types.ts`

