-- =====================================================================
-- 0006 · Row Level Security (RLS) y políticas de acceso
-- Modelo: usuarios autenticados leen todo; ADMIN/OPERADOR escriben;
--         solo ADMIN administra usuarios, firmas e institución.
-- =====================================================================

-- Habilitar RLS en todas las tablas de datos
alter table institucion         enable row level security;
alter table niveles_educativos  enable row level security;
alter table categorias          enable row level security;
alter table ubicaciones         enable row level security;
alter table bienes              enable row level security;
alter table movimientos         enable row level security;
alter table perfiles            enable row level security;
alter table firmas_config       enable row level security;

-- Helpers de rol
create or replace function es_admin() returns boolean
  language sql stable as $$ select rol_actual() = 'ADMIN' $$;
create or replace function puede_escribir() returns boolean
  language sql stable as $$ select rol_actual() in ('ADMIN', 'OPERADOR') $$;

-- ---------------------------------------------------------------------
-- Catálogos y datos operativos: lectura para todo autenticado
-- ---------------------------------------------------------------------
create policy "leer niveles"     on niveles_educativos for select to authenticated using (true);
create policy "leer categorias"  on categorias         for select to authenticated using (true);
create policy "leer ubicaciones" on ubicaciones        for select to authenticated using (true);
create policy "leer bienes"      on bienes             for select to authenticated using (true);
create policy "leer movimientos" on movimientos        for select to authenticated using (true);
create policy "leer institucion" on institucion        for select to authenticated using (true);
create policy "leer firmas"      on firmas_config      for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- Escritura de datos operativos: ADMIN u OPERADOR
-- ---------------------------------------------------------------------
create policy "escribir bienes" on bienes for all to authenticated
  using (puede_escribir()) with check (puede_escribir());

create policy "escribir movimientos" on movimientos for all to authenticated
  using (puede_escribir()) with check (puede_escribir());

create policy "escribir ubicaciones" on ubicaciones for all to authenticated
  using (puede_escribir()) with check (puede_escribir());

create policy "escribir categorias" on categorias for all to authenticated
  using (puede_escribir()) with check (puede_escribir());

-- ---------------------------------------------------------------------
-- Administración: solo ADMIN (institución, firmas)
-- ---------------------------------------------------------------------
create policy "admin institucion" on institucion for all to authenticated
  using (es_admin()) with check (es_admin());

create policy "admin firmas" on firmas_config for all to authenticated
  using (es_admin()) with check (es_admin());

-- ---------------------------------------------------------------------
-- Perfiles: cada quien ve/edita el suyo; ADMIN ve y administra todos
-- ---------------------------------------------------------------------
create policy "ver perfil propio o admin" on perfiles for select to authenticated
  using (id = auth.uid() or es_admin());

create policy "admin gestiona perfiles" on perfiles for all to authenticated
  using (es_admin()) with check (es_admin());
