-- 02-desafio-modalidad.sql
-- Solución del desafío: agregar la columna "modalidad" a la tabla alumnos.
-- Ejecutar en Supabase: SQL Editor > New query > pegar > Run.

alter table public.alumnos
  add column modalidad text not null default 'presencial'
  check (modalidad in ('presencial', 'virtual', 'hibrida'));

-- El permiso de INSERT de la tabla y la política ya existentes siguen valiendo:
-- no hace falta cambiarlos. El valor por defecto hace que la versión anterior
-- del formulario (sin modalidad) siga funcionando.

-- Solo si la API todavía no reconoce la columna nueva
-- (error "Could not find the 'modalidad' column ... in the schema cache"):
notify pgrst, 'reload schema';
