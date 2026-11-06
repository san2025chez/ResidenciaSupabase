-- 01-crear-tabla.sql
-- Tabla de PRÁCTICA para la clase. Usar solo datos ficticios.
-- Ejecutar en Supabase: SQL Editor > New query > pegar > Run.

create table public.alumnos (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  email      text not null,
  curso      text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: con RLS activado y sin políticas, nadie puede leer ni
-- escribir desde el navegador. (El panel de Supabase sí puede ver la tabla.)
alter table public.alumnos enable row level security;

-- Permisos de tabla para el rol "anon" (visitante sin sesión).
-- Los permisos de tabla se comprueban ANTES que las políticas RLS.
-- Se quita todo y se concede solo INSERT: no se concede SELECT,
-- así que nadie puede leer los registros desde el navegador.
revoke all on public.alumnos from anon;
grant insert on public.alumnos to anon;

-- Política SOLO PARA PRÁCTICA: deja que un visitante sin sesión inserte filas,
-- con límites básicos sobre lo que se acepta.
-- Riesgo: cualquiera que tenga la clave publicable puede enviar registros
-- (spam). Por eso es solo para esta práctica y se elimina al terminar.
create policy "practica: insertar alumnos como anon"
  on public.alumnos
  for insert
  to anon
  with check (
    char_length(nombre) between 1 and 80
    and char_length(curso) between 1 and 40
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- Para limpiar al terminar la práctica:
--   drop policy "practica: insertar alumnos como anon" on public.alumnos;
--   drop table public.alumnos;
