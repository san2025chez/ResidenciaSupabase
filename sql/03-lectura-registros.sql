-- 03-lectura-registros.sql
-- Permite mostrar en la página la lista de registros guardados.
-- Ejecutar en Supabase: SQL Editor > New query > pegar > Run.

-- Permiso de tabla SOLO sobre algunas columnas: el email NO se puede leer
-- desde el navegador. Si alguien pide select("*") o select("email"),
-- PostgreSQL responde "permission denied".
grant select (id, nombre, curso, created_at) on public.alumnos to anon;

-- Si ya hiciste el desafío (columna modalidad), ejecutá también:
--   grant select (modalidad) on public.alumnos to anon;

-- Política RLS de lectura: cualquier visitante puede ver todas las filas
-- (pero solo las columnas permitidas arriba).
-- Riesgo: cualquiera con la clave publicable ve nombres y cursos.
-- Solo para práctica con datos ficticios.
create policy "practica: leer alumnos como anon"
  on public.alumnos
  for select
  to anon
  using (true);

-- Para quitar la lectura al terminar:
--   drop policy "practica: leer alumnos como anon" on public.alumnos;
--   revoke select on public.alumnos from anon;
