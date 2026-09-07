-- =====================================================================
-- 0005 · Perfiles de usuario (roles) y configuración de firmas
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfiles: extiende auth.users con rol y datos institucionales
-- ---------------------------------------------------------------------
create table if not exists perfiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nombre       text,
  rol          rol_usuario not null default 'LECTOR',
  activo       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_perfiles_updated
  before update on perfiles
  for each row execute function set_updated_at();

-- Al crear un usuario en auth, generar su perfil automáticamente
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: obtener el rol del usuario autenticado (usado en políticas RLS)
create or replace function rol_actual()
returns rol_usuario
language sql
stable
security definer set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- Firmas y sellos institucionales para reportes
-- ---------------------------------------------------------------------
create table if not exists firmas_config (
  id                  uuid primary key default gen_random_uuid(),
  cargo               text not null,        -- Director/a, Responsable Patrimonio, Comisión
  nombre_responsable  text not null,
  firma_url           text,                 -- PNG transparente (Supabase Storage)
  orden               smallint not null default 1,
  activo              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger trg_firmas_updated
  before update on firmas_config
  for each row execute function set_updated_at();
