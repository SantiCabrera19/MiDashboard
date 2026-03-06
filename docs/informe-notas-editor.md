# Informe de Desarrollo — Módulo de Notas & Editor TipTap

> **Proyecto:** MeDashboard  
> **Período:** 1 Mar 2026 — 4 Mar 2026  
> **Estado actual:** En progreso (editor TipTap funcional, pendiente verificación final)

---

## 1. Contexto General

MeDashboard es una aplicación personal construida con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase**. El módulo de Notas permite crear, editar, eliminar y fijar notas. Originalmente usaba un **modal popup** (`NoteForm.tsx`) para crear/editar notas con un `<textarea>` simple.

El objetivo de esta fase fue **reemplazar el modal por un editor de texto enriquecido (rich text) usando TipTap**, con páginas dedicadas para creación y edición.

---

## 2. Secuencia Cronológica

### Fase previa (completada antes de esta tarea)
- ✅ CRUD de notas funcionando (crear, leer, editar, eliminar)
- ✅ Pin/unpin de notas
- ✅ Vista de detalle en `/notes/[id]`
- ✅ Búsqueda inteligente (filtrado client-side por título/contenido)
- ✅ Sistema de toasts para feedback
- ✅ Header cleanup (iconos clicables, texto "Dashboard" eliminado)
- ✅ Sidebar colapsable responsive
- ✅ Empty states mejorados

---

### Sesión 1 — 1 Mar 2026: Implementación del Editor TipTap

#### 2.1 Instalación de dependencias
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

#### 2.2 Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `components/editor/TipTapEditor.tsx` | Componente del editor con toolbar (Bold, Italic, Strike, H1, H2, Listas, Blockquote) |
| `app/(dashboard)/notes/new/page.tsx` | Página dedicada para crear notas nuevas (reemplaza el modal) |
| `app/(dashboard)/notes/[id]/edit/page.tsx` | Página dedicada para editar notas existentes |

#### 2.3 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `app/(dashboard)/notes/NewNoteButton.tsx` | Cambiado de abrir modal → `<Link href="/notes/new">` |
| `app/(dashboard)/notes/[id]/NoteDetailActions.tsx` | Botón "Edit" → `<Link href="/notes/[id]/edit">` + import de `Link` agregado |
| `app/(dashboard)/notes/NoteCard.tsx` | Eliminado import de `NoteForm`, botón edit cambiado a Link, contenido renderiza HTML con `dangerouslySetInnerHTML` |
| `app/(dashboard)/notes/[id]/page.tsx` | Guard `id === "new"`, renderizado HTML condicional (`dangerouslySetInnerHTML`)  |

---

### Sesión 2 — 2 Mar 2026: Resolución de errores

Se encontraron **4 errores encadenados** que detuvieron el avance:

---

#### 🔴 Error 1: UUID inválido — `"new"` interpretado como ID

```
Error fetching note: "invalid input syntax for type uuid: \"new\""
at getNoteById (lib/data/notes.ts:53:17)
at NoteDetailPage (app/(dashboard)/notes/[id]/page.tsx:40:18)
```

**Causa:** Next.js App Router trata las rutas estáticas (`/notes/new`) con prioridad sobre las dinámicas (`/notes/[id]`), pero durante el desarrollo con Turbopack a veces la ruta dinámica capturaba `"new"` como si fuera un UUID.

**Solución:** Se agregó un guard explícito en `/notes/[id]/page.tsx`:
```tsx
if (id === "new") {
    notFound();
}
```
Y también en `generateMetadata()`:
```tsx
if (id === "new") {
    return { title: "New Note" };
}
```

---

#### 🔴 Error 2: `FormData` incompatible con Server Actions tipados

```
La propiedad "content" falta en el tipo "FormData", pero es obligatoria en el tipo 
"Pick<TablesInsert<"notes">, "title" | "content" | "is_markdown">"
```

**Causa:** Las páginas `new` y `edit` enviaban un `FormData` a las Server Actions (`createNote`, `updateNote`), pero estas funciones esperan un **objeto TypeScript tipado**, no un FormData crudo.

**Solución:** Reemplazado `FormData` por objeto directo:
```tsx
// ❌ Antes
const formData = new FormData();
formData.append("title", title);
const result = await createNote(formData);

// ✅ Después
const payload = { title, content, is_markdown: false };
const result = await createNote(payload);
```

---

#### 🔴 Error 3: SSR Hydration Mismatch de TipTap

```
Tiptap Error: SSR has been detected, please set `immediatelyRender` 
explicitly to `false` to avoid hydration mismatches.
```

**Causa:** TipTap por defecto intenta renderizar el editor inmediatamente, pero en Next.js el componente también se ejecuta en el servidor (SSR), causando un mismatch de hidratación.

**Solución:** Se agregó `immediatelyRender: false` en la config de `useEditor`:
```tsx
const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,  // ← Agregado
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
});
```

---

#### 🔴 Error 4: Variable duplicada — `showDeleteConfirm` declarada 2 veces

```
the name `setShowDeleteConfirm` is defined multiple times
at NoteCard.tsx:28:31
```

**Causa:** Al eliminar el state `showEditForm` de `NoteCard.tsx` (porque ya no se usa modal), el reemplazo automático generó una **línea duplicada** de `showDeleteConfirm` en vez de simplemente eliminar la línea de `showEditForm`.

**Solución:** Eliminada la línea 28 duplicada en `NoteCard.tsx` (4 Mar 2026).

---

## 3. Estado Actual del Módulo de Notas

| Feature | Estado |
|---------|--------|
| CRUD básico (crear, leer, editar, eliminar) | ✅ |
| Pin/Unpin | ✅ |
| Vista detalle `/notes/[id]` | ✅ |
| Búsqueda inteligente (client-side) | ✅ |
| Toast notifications (create/edit/delete/pin) | ✅ |
| Editor TipTap — componente | ✅ |
| Página `/notes/new` con TipTap | ✅ |
| Página `/notes/[id]/edit` con TipTap | ✅ |
| Renderizado HTML en cards y detalle | ✅ |
| Eliminación de modal `NoteForm` de cards/detail | ✅ |
| Guard contra ruta `"new"` en `[id]` | ✅ |
| Fix SSR hydration (`immediatelyRender: false`) | ✅ |
| Fix variable duplicada en NoteCard | ✅ |
| **Verificación visual en browser** | ⏳ Pendiente |

---

## 4. Archivos Clave del Módulo

```
app/(dashboard)/notes/
├── page.tsx                  # Lista de notas (Server Component)
├── NoteCard.tsx              # Card individual (Client Component)
├── NoteListClient.tsx        # Búsqueda client-side
├── NewNoteButton.tsx         # Link a /notes/new
├── NoteForm.tsx              # ⚠️ Modal legacy (ya no se usa en cards/detail)
├── new/
│   └── page.tsx              # Crear nota con TipTap
└── [id]/
    ├── page.tsx              # Vista detalle
    ├── NoteDetailActions.tsx  # Acciones (edit/delete/pin)
    └── edit/
        └── page.tsx          # Editar nota con TipTap

components/editor/
└── TipTapEditor.tsx          # Editor rich text reutilizable

lib/
├── actions/notes.ts          # Server Actions (createNote, updateNote, etc.)
└── data/notes.ts             # Data fetching (getNotes, getNoteById)
```

---

## 5. Próximos Pasos

1. **Verificar visualmente** que `/notes/new` y `/notes/[id]/edit` funcionan sin errores en el browser.
2. **Evaluar si eliminar `NoteForm.tsx`** completamente (ya no se importa en NoteCard ni NoteDetailActions).
3. Continuar con **Tarea 4 — Finanzas** (reemplazar popup por página dedicada, agregar charts, selector de moneda).
4. Continuar con **Tarea 5 — Calendario** (reemplazar popup, mejorar navegación).

---

*Generado el 4 de marzo de 2026*
