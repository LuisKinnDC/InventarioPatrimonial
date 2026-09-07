-- =====================================================================
-- 0007 · Vistas para el padrón activo y el dashboard directivo
-- Las vistas heredan la RLS de las tablas base (security_invoker).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Padrón activo: bienes vigentes (no dados de baja) para el Anexo 05
-- ---------------------------------------------------------------------
create or replace view v_padron_activo
with (security_invoker = true) as
select
  b.id,
  b.codigo_patrimonial,
  b.codigo_interno,
  b.denominacion,
  b.cantidad,
  u.nombre_ambiente               as ubicacion,
  u.nivel_id,
  n.nombre                        as nivel,
  c.nombre                        as categoria,
  b.marca, b.modelo, b.color, b.serie,
  b.estado_conservacion,
  b.procedencia,
  b.fecha_ingreso,
  b.valor_libro,
  b.observaciones
from bienes b
left join ubicaciones u        on u.id = b.ubicacion_id
left join niveles_educativos n on n.id = u.nivel_id
left join categorias c         on c.id = b.categoria_id
where b.estado_registro = 'ACTIVO';

-- ---------------------------------------------------------------------
-- Dashboard: distribución por estado de conservación (B/R/M/Y)
-- ---------------------------------------------------------------------
create or replace view v_dashboard_estado
with (security_invoker = true) as
select
  coalesce(estado_conservacion::text, 'SIN ESTADO') as estado,
  count(*)                                          as total_bienes,
  sum(cantidad)                                     as total_unidades,
  sum(valor_libro)                                  as valor_total
from bienes
where estado_registro = 'ACTIVO'
group by estado_conservacion;

-- ---------------------------------------------------------------------
-- Dashboard: bienes y valor por ambiente/ubicación
-- ---------------------------------------------------------------------
create or replace view v_dashboard_ubicacion
with (security_invoker = true) as
select
  coalesce(u.nombre_ambiente, 'SIN UBICACIÓN') as ubicacion,
  n.nombre                                     as nivel,
  count(b.id)                                  as total_bienes,
  sum(b.cantidad)                              as total_unidades,
  sum(b.valor_libro)                           as valor_total
from bienes b
left join ubicaciones u        on u.id = b.ubicacion_id
left join niveles_educativos n on n.id = u.nivel_id
where b.estado_registro = 'ACTIVO'
group by u.nombre_ambiente, n.nombre
order by valor_total desc nulls last;

-- ---------------------------------------------------------------------
-- Dashboard: desglose por nivel educativo
-- ---------------------------------------------------------------------
create or replace view v_dashboard_nivel
with (security_invoker = true) as
select
  coalesce(n.nombre, 'SIN NIVEL') as nivel,
  count(b.id)                     as total_bienes,
  sum(b.cantidad)                 as total_unidades,
  sum(b.valor_libro)              as valor_total
from bienes b
left join ubicaciones u        on u.id = b.ubicacion_id
left join niveles_educativos n on n.id = u.nivel_id
where b.estado_registro = 'ACTIVO'
group by n.nombre;

-- ---------------------------------------------------------------------
-- Dashboard: valorización total y contadores globales
-- ---------------------------------------------------------------------
create or replace view v_valorizacion
with (security_invoker = true) as
select
  count(*) filter (where estado_registro = 'ACTIVO')          as bienes_activos,
  count(*) filter (where estado_registro = 'BAJA')            as bienes_baja,
  coalesce(sum(cantidad) filter (where estado_registro = 'ACTIVO'), 0) as unidades_activas,
  coalesce(sum(valor_libro) filter (where estado_registro = 'ACTIVO'), 0) as valor_total_activo
from bienes;
