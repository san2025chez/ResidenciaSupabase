-- 04-eliminar-registros.sql
-- Permite borrar registros desde la página (botón "Eliminar").
-- Ejecutar en Supabase: SQL Editor > New query > pegar > Run.
-- Requiere haber ejecutado antes 03-lectura-registros.sql: para borrar
-- "where id = 5", PostgreSQL necesita poder leer la columna id.

-- Permiso de tabla: el rol "anon" puede borrar filas.
grant delete on public.alumnos to anon;

-- Política RLS de borrado: cualquier visitante puede borrar cualquier fila.
-- Riesgo: cualquiera con la clave publicable puede vaciar la tabla.
-- Solo para práctica con datos ficticios. En un sistema real, borrar
-- requiere inicio de sesión y una política que limite qué filas.
create policy "practica: eliminar alumnos como anon"
  on public.alumnos
  for delete
  to anon
  using (true);

-- Para quitar el borrado al terminar:
--   drop policy "practica: eliminar alumnos como anon" on public.alumnos;
--   revoke delete on public.alumnos from anon;
