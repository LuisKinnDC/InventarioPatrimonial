-- =====================================================================
-- 0003 · Tabla principal de bienes patrimoniales (columnas Anexo 05)
-- =====================================================================

create table if not exists bienes (
  id                   uuid primary key default gen_random_uuid(),

  -- Columnas oficiales del Anexo 05
  codigo_patrimonial   text,                              -- COD.PAT. (SBN, 12 dígitos)
  codigo_interno       text,                              -- COD.INT. (correlativo interno)
  denominacion         text not null,                     -- NOMBRE DEL BIEN
  cantidad             integer not null default 1 check (cantidad >= 0),
  ubicacion_id         uuid references ubicaciones(id) on delete set null,
  categoria_id         smallint references categorias(id) on delete set null,
  marca                text,
  modelo               text,
  color                text,
  serie                text,
  estado_conservacion  estado_conservacion,               -- EST. (B/R/M/Y)
  procedencia          text,                              -- PROCEDENCIA (texto libre: D/C/APAFA/GOB.REGIONAL...)
  fecha_ingreso        date,                              -- FECHA DE INGRESO
  valor_libro          numeric(12,2) not null default 0,  -- VALOR EN LIBRO
  observaciones        text,                              -- OBS.

  -- Control de estado del registro
  estado_registro      estado_registro not null default 'ACTIVO',
  es_baja              boolean generated always as (estado_registro = 'BAJA') stored,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_bienes_updated
  before update on bienes
  for each row execute function set_updated_at();

-- Índices para búsquedas y filtros frecuentes
create index if not exists idx_bienes_ubicacion   on bienes(ubicacion_id);
create index if not exists idx_bienes_categoria   on bienes(categoria_id);
create index if not exists idx_bienes_estado_reg  on bienes(estado_registro);
create index if not exists idx_bienes_est_cons    on bienes(estado_conservacion);
create index if not exists idx_bienes_cod_pat     on bienes(codigo_patrimonial);
create index if not exists idx_bienes_cod_int     on bienes(codigo_interno);

-- Búsqueda por texto (denominación / marca / serie) sin distinción de acentos/caso
create index if not exists idx_bienes_denominacion_trgm
  on bienes using gin (denominacion gin_trgm_ops);
