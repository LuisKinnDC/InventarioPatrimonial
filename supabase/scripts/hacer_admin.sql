-- =====================================================================
-- Convertir un usuario en ADMIN
-- Ejecutar en: Supabase → SQL Editor.
-- Reemplaza el correo por el de TU usuario (el que usas para entrar).
-- =====================================================================

-- Crea el perfil si no existe y lo eleva a ADMIN (upsert robusto).
insert into public.perfiles (id, nombre, rol, activo)
select u.id, coalesce(u.raw_user_meta_data->>'nombre', u.email), 'ADMIN', true
from auth.users u
where u.email = 'tu-correo@ejemplo.com'   -- <<< CAMBIA ESTE CORREO POR EL TUYO
on conflict (id) do update
  set rol = 'ADMIN', activo = true;

-- Verificar el resultado:
select p.id, p.nombre, p.rol, p.activo, u.email
from public.perfiles p
join auth.users u on u.id = p.id;
