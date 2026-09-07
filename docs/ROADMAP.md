# 🗺️ Hoja de Ruta — Sistema de Control Patrimonial e Inventario (Anexo 05)

I.E. Pública · Cumplimiento oficial **Anexo 05 DRE/UGEL** · Stack: **React + Vite + Supabase (PostgreSQL) + pnpm**

> Empaquetado: Web-first con Vite; se envuelve en **Tauri** en la fase final para generar el `.exe` de escritorio.

---

## Estado global

| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 0** | Análisis de contexto + decisiones de arquitectura | ✅ Completado |
| **Fase 1** | Base de datos & Cloud (Supabase) | ✅ Completado (falta aplicar en proyecto real) |
| **Fase 2** | App base: Registro, Altas/Bajas, Import Excel | ✅ Completado |
| **Fase 3** | Dashboard, Impresión Anexo 05, Firma digital | ✅ Completado |
| **Fase 4** | Pruebas, empaquetado Tauri y despliegue | 🚧 Pendiente (verificación con datos reales) |

---

## Fase 1 — Base de Datos & Cloud

- [x] **T1.1** Definir modelo de datos (ver `docs/MODELO_DATOS.md`)
- [x] **T1.2** Migración: extensiones y tipos ENUM (`0001`)
- [x] **T1.3** Migración: institución, ubicaciones, categorías (`0002`)
- [x] **T1.4** Migración: tabla `bienes` + índices (`0003`)
- [x] **T1.5** Migración: `movimientos` (altas/bajas) + trigger de trazabilidad (`0004`)
- [x] **T1.6** Migración: `firmas_config` + perfiles/roles (`0005`)
- [x] **T1.7** Migración: RLS y políticas de seguridad (`0006`)
- [x] **T1.8** Migración: vistas para dashboard y padrón activo (`0007`)
- [x] **T1.9** Migración: datos semilla (institución "San Ramón", ubicaciones) (`0008`)
- [ ] **T1.10** Aplicar migraciones en proyecto Supabase real
- [ ] **T1.11** Keep-Alive: workflow GitHub Actions (cron lunes 00:00)

## Fase 2 — App base

- [x] **T2.1** Scaffold Vite + React + TS + Tailwind + Router + TanStack Query
- [x] **T2.2** Cliente Supabase + tipos + capa de acceso a datos (`src/data/`)
- [x] **T2.3** Autenticación (login) y layout con menú de módulos
- [x] **T2.4** **Módulo 1** — Registro ágil de bienes (form con navegación ENTER/TAB)
- [x] **T2.5** Tabla/listado de bienes con filtros (ubicación, estado, categoría)
- [x] **T2.6** Importación masiva desde Excel Anexo 05 (mapeo + normalización)
- [x] **T2.7** Lectura de código de barras / QR (lector USB-HID + ENTER)
- [x] **T2.8** **Módulo 2** — Altas y Bajas (motivo, Nº resolución, acta)

## Fase 3 — Dashboard, Impresión y Firma

- [x] **T3.1** **Módulo 3** — Dashboard (estado, ambiente, nivel, valorización) con Recharts
- [x] **T3.2** **Módulo 4** — Exportar Excel con formato Anexo 05 (ExcelJS)
- [x] **T3.3** Exportar PDF filtrado (jsPDF + autotable)
- [x] **T3.4** **Módulo 5** — Carga y estampado de firmas/sellos (PNG, Supabase Storage)

## Fase 4 — Pruebas y despliegue

- [ ] **T4.1** Pruebas multi-usuario y de carga real (requiere Supabase conectado)
- [ ] **T4.2** Integración Tauri (build `.exe`)
- [ ] **T4.3** Capacitación y documentación de usuario
- [ ] **T4.4** (Opcional) Escaneo QR por cámara web (`html5-qrcode`)

---

## Decisiones de arquitectura (Fase 0)

1. **Frontend:** Web-first (Vite + React + TypeScript) → Tauri al final.
2. **Backend/BD:** Supabase (PostgreSQL cloud, plan gratuito). Migraciones SQL versionadas en `supabase/migrations/`.
3. **Altas/Bajas:** Tabla `movimientos` (historial completo) + flag `es_baja`/`estado_registro` en `bienes` para trazabilidad de auditoría.
4. **Gestor de paquetes:** pnpm.
