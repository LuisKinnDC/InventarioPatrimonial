# 🧬 Modelo de Datos — Sistema de Inventario Patrimonial (Anexo 05)

Basado en la estructura real del archivo `ANEXO 5 - 2025 (3).xlsx` (I.E. "San Ramón") y la propuesta técnica.

## Diagrama lógico

```
institucion (1) ────────────────┐
                                 │ (metadata del encabezado Anexo 05)
niveles_educativos (catálogo)    │
categorias (catálogo)            │
ubicaciones ──────┐              │
                  │ FK           │
                  ▼              │
              bienes ◄───────────┘
                  │
                  │ 1:N
                  ▼
             movimientos (altas / bajas)
                  ▲
firmas_config ────┘ (independiente, para reportes)
perfiles / roles (auth Supabase)
```

## Tablas

### `institucion`
Configuración única de la I.E. Alimenta el encabezado oficial del Anexo 05.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| dre | text | Dirección Regional de Educación |
| ugel | text | Unidad de Gestión Educativa Local |
| nombre_ie | text | Ej. "SAN RAMON" |
| codigo_modular | text | Ej. 0424580 |
| responsable | text | Usuario responsable (director/a) |
| cargo | text | Ej. DIRECTORA |
| departamento / provincia / distrito / localidad | text | Ubigeo textual |
| pisos | text | Ej. "1, 2 y 3" |
| logo_url | text | opcional |

### `niveles_educativos` (catálogo)
`INICIAL`, `PRIMARIA`, `SECUNDARIA`, `ADMINISTRACION`.

### `categorias` (catálogo)
Para filtros de impresión: Cómputo, Mobiliario, Laboratorio, Instrumentos, etc.

### `ubicaciones`
Ambientes físicos (AIP I, S.D. ADM., TALLER CARPINTERÍA, Biblioteca…).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre_ambiente | text UNIQUE | |
| nivel_id | fk → niveles_educativos | |
| piso | text | |
| responsable | text | |

### `bienes` (tabla principal — columnas del Anexo 05)

| Campo | Col. Anexo 05 | Tipo | Notas |
|-------|---------------|------|-------|
| id | — | uuid PK | |
| codigo_patrimonial | COD.PAT. (SBN) | text | 12 dígitos, puede ser NULL |
| codigo_interno | COD.INT. | text | correlativo interno |
| denominacion | NOMBRE DEL BIEN | text NOT NULL | |
| cantidad | CANT | int default 1 | |
| ubicacion_id | UBICACIÓN FÍSICA | fk → ubicaciones | |
| categoria_id | — | fk → categorias | derivada/asignada |
| marca / modelo / color / serie | MARCA/MODELO/COLOR/SERIE | text | |
| estado_conservacion | EST. | enum B/R/M/Y | Bueno/Regular/Malo/Chatarra(Y) |
| procedencia | PROCEDENCIA | enum D/C/APAFA/MINEDU/DONACION | |
| fecha_ingreso | FECHA INGRESO | date | |
| valor_libro | VALOR EN LIBRO | numeric(12,2) | |
| observaciones | OBS | text | |
| estado_registro | — | enum ACTIVO/BAJA | reemplaza es_baja, más expresivo |
| es_baja | — | boolean generado | compatibilidad |
| created_at / updated_at | — | timestamptz | |

### `movimientos` (Altas y Bajas)
Historial inmutable para auditoría.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| bien_id | fk → bienes | |
| tipo | enum ALTA / BAJA | |
| motivo | text | Obsolescencia, Deterioro, Hurto, Compra APAFA, Donación… |
| nro_resolucion | text | Resolución / Acta de baja |
| documento_url | text | escaneo del acta (opcional) |
| fecha | date | |
| registrado_por | fk → perfiles | |
| created_at | timestamptz | |

### `firmas_config`
Firmas y sellos institucionales para estampar en reportes.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| cargo | text | Director/a, Responsable Patrimonio, Comisión |
| nombre_responsable | text | |
| firma_url | text | PNG transparente (Supabase Storage) |
| orden | int | posición en el pie de página |

### `perfiles` + roles
Ligado a `auth.users` de Supabase. Roles: `ADMIN`, `OPERADOR`, `LECTOR`.

## Estados de conservación (EST.)
- **B** = Bueno · **R** = Regular · **M** = Malo · **Y** = Chatarra / de baja

## Vistas
- `v_padron_activo` — bienes con `estado_registro = ACTIVO` (para el Anexo 05).
- `v_dashboard_estado` — conteo por estado de conservación.
- `v_dashboard_ubicacion` — conteo y valor por ambiente.
- `v_dashboard_nivel` — conteo por nivel educativo.
- `v_valorizacion` — valor total en libros.
