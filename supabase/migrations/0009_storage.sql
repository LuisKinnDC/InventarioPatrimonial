-- =====================================================================
-- 0009 · Storage: bucket de firmas/sellos institucionales
-- =====================================================================

-- Bucket público (las firmas se estampan en reportes; solo ADMIN las sube)
insert into storage.buckets (id, name, public)
values ('firmas', 'firmas', true)
on conflict (id) do nothing;

-- Lectura pública de las firmas (para renderizarlas en reportes)
create policy "firmas lectura publica"
  on storage.objects for select
  using (bucket_id = 'firmas');

-- Solo ADMIN puede subir / actualizar / eliminar firmas
create policy "firmas escritura admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'firmas' and es_admin());

create policy "firmas update admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'firmas' and es_admin());

create policy "firmas delete admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'firmas' and es_admin());
