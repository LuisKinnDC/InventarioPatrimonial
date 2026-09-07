# Sistema de Control Patrimonial e Inventario (Anexo 05)

Aplicación para la gestión del inventario de bienes patrimoniales de una I.E. Pública,
con cumplimiento del formato oficial **Anexo 05 (DRE/UGEL)**.

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Backend / BD:** Supabase (PostgreSQL cloud)
- **Gestor de paquetes:** pnpm
- **Empaquetado de escritorio:** Tauri (fase final)

## Estructura

```
├── contexto/              Documentos fuente (propuesta técnica, Excel Anexo 05)
├── docs/                  ROADMAP.md (tareas) y MODELO_DATOS.md
├── supabase/migrations/   Esquema SQL versionado (tablas, RLS, vistas, seed)
├── .github/workflows/     Keep-Alive de Supabase (cron)
└── src/                   Aplicación React
    ├── auth/              Contexto de autenticación
    ├── components/        Layout y UI compartida
    ├── lib/               Cliente Supabase
    ├── pages/             Un archivo por módulo/pantalla
    └── types/             Tipos del modelo de datos
```

## Puesta en marcha

### 1. Base de datos (Supabase)

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratuito).
2. Aplicar las migraciones. Con la CLI de Supabase enlazada al proyecto:
   ```bash
   pnpm dlx supabase link --project-ref <TU-REF>
   pnpm dlx supabase db push
   ```
   O bien, ejecutar en orden los archivos de `supabase/migrations/` desde el
   **SQL Editor** del panel de Supabase.

### 2. Frontend

```bash
pnpm install
cp .env.example .env      # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
pnpm dev
```

Abrir http://localhost:5173

### 3. Crear el primer usuario ADMIN

1. En Supabase → **Authentication → Users → Add user** (con email y contraseña).
2. En **SQL Editor**, elevar el rol:
   ```sql
   update perfiles set rol = 'ADMIN' where id = (
     select id from auth.users where email = 'tu-correo@ejemplo.com'
   );
   ```

## Scripts

| Comando          | Descripción                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Servidor de desarrollo (Vite)      |
| `pnpm build`     | Compilar para producción           |
| `pnpm preview`   | Previsualizar el build             |
| `pnpm typecheck` | Verificación de tipos              |

## Despliegue en Vercel

El proyecto incluye `vercel.json` (framework Vite, build con pnpm, rewrites SPA para
React Router). Pasos:

1. En [vercel.com](https://vercel.com) → **Add New → Project** e importa el repo
   `LuisKinnDC/InventarioPatrimonial`.
2. En **Settings → Environment Variables** agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy**. Vercel sirve el sitio por **HTTPS**, por lo que el **escáner por
   cámara** funciona en producción (requiere HTTPS).

> Nota: `contexto/` y `.env` están en `.gitignore` y no se publican.

## Roadmap

Ver [`docs/ROADMAP.md`](docs/ROADMAP.md). Estado actual: **Fase 1 (BD) completa**,
scaffold de la app listo; en curso los módulos de la Fase 2.
