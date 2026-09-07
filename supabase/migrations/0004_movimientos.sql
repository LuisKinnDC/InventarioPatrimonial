-- =====================================================================
-- 0004 · Movimientos patrimoniales (Altas y Bajas) + trazabilidad
-- =====================================================================

create table if not exists movimientos (
  id              uuid primary key default gen_random_uuid(),
  bien_id         uuid not null references bienes(id) on delete cascade,
  tipo            tipo_movimiento not null,          -- ALTA / BAJA
  motivo          text,                              -- Obsolescencia, Deterioro, Hurto, Compra APAFA...
  nro_resolucion  text,                              -- Nº de Resolución / Acta de Baja
  documento_url   text,                              -- escaneo del acta (Supabase Storage)
  fecha           date not null default current_date,
  registrado_por  uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_movimientos_bien on movimientos(bien_id);
create index if not exists idx_movimientos_tipo on movimientos(tipo);
create index if not exists idx_movimientos_fecha on movimientos(fecha);

-- ---------------------------------------------------------------------
-- Trigger: al registrar un movimiento, sincronizar el estado del bien
--   BAJA  -> bienes.estado_registro = 'BAJA'
--   ALTA  -> bienes.estado_registro = 'ACTIVO'
-- ---------------------------------------------------------------------
create or replace function aplicar_movimiento()
returns trigger
language plpgsql
as $$
begin
  if new.tipo = 'BAJA' then
    update bienes set estado_registro = 'BAJA' where id = new.bien_id;
  elsif new.tipo = 'ALTA' then
    update bienes set estado_registro = 'ACTIVO' where id = new.bien_id;
  end if;
  return new;
end;
$$;

create trigger trg_aplicar_movimiento
  after insert on movimientos
  for each row execute function aplicar_movimiento();
