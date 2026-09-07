-- =====================================================================
-- 0008 · Datos semilla — Institución "San Ramón" y ubicaciones reales
-- (extraídas del archivo ANEXO 5 - 2025). Ajustar según necesidad.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Institución (fila única)
-- ---------------------------------------------------------------------
insert into institucion
  (dre, ugel, nombre_ie, codigo_modular, responsable, cargo,
   departamento, provincia, distrito, localidad, pisos)
select
  'DIRECCIÓN REGIONAL DE EDUCACIÓN DE AYACUCHO',
  'UGEL HUAMANGA',
  'SAN RAMON',
  '0424580',
  '',  -- responsable: completar desde Configuración
  'DIRECTORA',
  'AYACUCHO', 'HUAMANGA', 'AYACUCHO', 'AYACUCHO',
  '1, 2 y 3'
where not exists (select 1 from institucion);

-- ---------------------------------------------------------------------
-- Ubicaciones / ambientes reales (nivel: 3=SECUNDARIA, 4=ADMINISTRACION)
-- ---------------------------------------------------------------------
insert into ubicaciones (nombre_ambiente, nivel_id) values
  -- Aulas de innovación y laboratorios
  ('AIP I', 3), ('AIP II', 3),
  ('L. BIOLOGIA', 3), ('L. FISICA', 3), ('L. QUIMICA', 3),
  -- Talleres
  ('TALLER CARPINTERIA', 3), ('TALLER CORTE CONFECCIÓN', 3),
  ('TALLER ELECTRICIDAD', 3), ('GASTRONOMIA', 3),
  -- Administración
  ('S.D. ADM.', 4), ('ALMACEN ADMINISTRACION', 4), ('ALMACEN', 4),
  ('DIRECCIÓN', 4), ('SECRET.DIREC.', 4), ('COORDINACIÓN LETRAS', 4),
  ('TOE', 4), ('S.D.F.G.', 4),
  -- Otros ambientes
  ('SALA BANDA', 3), ('POLIDEPORTIVO', 3), ('BIBLIOTECA', 3),
  -- Aulas por grado y sección (1° a 5° secundaria)
  ('1A', 3), ('1B', 3), ('1C', 3), ('1D', 3), ('1E', 3), ('1F', 3), ('1G', 3),
  ('2A', 3), ('2B', 3), ('2C', 3), ('2D', 3), ('2E', 3), ('2F', 3), ('2G', 3), ('2H', 3),
  ('3A', 3), ('3B', 3), ('3C', 3), ('3D', 3), ('3E', 3), ('3F', 3), ('3G', 3), ('3H', 3), ('3I', 3),
  ('4A', 3), ('4B', 3), ('4C', 3), ('4D', 3), ('4E', 3), ('4F', 3), ('4G', 3), ('4H', 3),
  ('5A', 3), ('5B', 3), ('5C', 3), ('5D', 3), ('5E', 3), ('5F', 3), ('5G', 3), ('5H', 3)
on conflict (nombre_ambiente) do nothing;

-- ---------------------------------------------------------------------
-- Firmas institucionales (placeholder — cargar imágenes desde la app)
-- ---------------------------------------------------------------------
insert into firmas_config (cargo, nombre_responsable, orden)
select * from (values
  ('DIRECTORA', '', 1),
  ('RESPONSABLE DE PATRIMONIO', '', 2),
  ('COMISIÓN DE INVENTARIO', '', 3)
) as v(cargo, nombre_responsable, orden)
where not exists (select 1 from firmas_config);
