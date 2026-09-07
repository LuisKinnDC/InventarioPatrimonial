-- =====================================================================
-- 0001 · Extensiones y tipos ENUM
-- Sistema de Control Patrimonial e Inventario (Anexo 05)
-- =====================================================================

-- Extensión para UUIDs (gen_random_uuid ya viene con pgcrypto en Supabase)
create extension if not exists "pgcrypto";

-- Búsqueda por texto con similitud (índices trigram para denominación/marca/serie)
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------
-- Tipos ENUM del dominio
-- ---------------------------------------------------------------------

-- Estado de conservación oficial (columna EST. del Anexo 05)
--   B = Bueno · R = Regular · M = Malo · Y = Chatarra / de baja
do $$ begin
  create type estado_conservacion as enum ('B', 'R', 'M', 'Y');
exception when duplicate_object then null; end $$;

-- NOTA: La columna PROCEDENCIA del Anexo 05 real contiene texto libre muy variado
-- (D, C, APAFA, GOBIERNO REGIONAL, G.R. AYAC., OBRA, DONADO, COMPRADO...). Por eso
-- se almacena como TEXT (crudo, fiel al Excel) en lugar de un ENUM estricto que
-- rechazaría la carga masiva. La normalización se hace en la capa de importación.

-- Estado del registro patrimonial (activo en padrón vs dado de baja)
do $$ begin
  create type estado_registro as enum ('ACTIVO', 'BAJA');
exception when duplicate_object then null; end $$;

-- Tipo de movimiento patrimonial
do $$ begin
  create type tipo_movimiento as enum ('ALTA', 'BAJA');
exception when duplicate_object then null; end $$;

-- Roles de usuario del sistema
do $$ begin
  create type rol_usuario as enum ('ADMIN', 'OPERADOR', 'LECTOR');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Función utilitaria: actualizar updated_at automáticamente
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
