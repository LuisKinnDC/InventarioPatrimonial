-- =====================================================================
-- 0002 · Institución y catálogos (niveles, categorías, ubicaciones)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Institución: metadata del encabezado del Anexo 05 (fila única)
-- ---------------------------------------------------------------------
create table if not exists institucion (
  id              uuid primary key default gen_random_uuid(),
  dre             text,                       -- Dirección Regional de Educación
  ugel            text,                       -- Unidad de Gestión Educativa Local
  nombre_ie       text not null,              -- Ej. "SAN RAMON"
  codigo_modular  text,                       -- Ej. 0424580
  responsable     text,                       -- Usuario responsable (director/a)
  cargo           text,                       -- Ej. DIRECTORA
  departamento    text,
  provincia       text,
  distrito        text,
  localidad       text,
  pisos           text,                       -- Ej. "1, 2 y 3"
  logo_url        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_institucion_updated
  before update on institucion
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Niveles educativos (catálogo)
-- ---------------------------------------------------------------------
create table if not exists niveles_educativos (
  id      smallint primary key,
  nombre  text not null unique
);

insert into niveles_educativos (id, nombre) values
  (1, 'INICIAL'),
  (2, 'PRIMARIA'),
  (3, 'SECUNDARIA'),
  (4, 'ADMINISTRACION')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Categorías de bien (catálogo, para filtros de impresión)
-- ---------------------------------------------------------------------
create table if not exists categorias (
  id      smallserial primary key,
  nombre  text not null unique
);

insert into categorias (nombre) values
  ('COMPUTO'),
  ('MOBILIARIO'),
  ('LABORATORIO'),
  ('INSTRUMENTOS MUSICALES'),
  ('EQUIPO ELECTRONICO'),
  ('HERRAMIENTAS / TALLER'),
  ('DEPORTIVO'),
  ('OTROS')
on conflict (nombre) do nothing;

-- ---------------------------------------------------------------------
-- Ubicaciones / Ambientes físicos
-- ---------------------------------------------------------------------
create table if not exists ubicaciones (
  id               uuid primary key default gen_random_uuid(),
  nombre_ambiente  text not null unique,      -- AIP I, S.D. ADM., TALLER CARPINTERIA...
  nivel_id         smallint references niveles_educativos(id),
  piso             text,
  responsable      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger trg_ubicaciones_updated
  before update on ubicaciones
  for each row execute function set_updated_at();

create index if not exists idx_ubicaciones_nivel on ubicaciones(nivel_id);
