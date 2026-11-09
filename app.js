// app.js: PUNTO DE PARTIDA para la clase.
// Ya está listo lo que no es el tema de hoy: las referencias al formulario
// y la función mostrarMensaje(). En vivo completamos los PASOS 1 a 5.
// La versión terminada está en respaldo/app.final.js.

const formulario = document.getElementById("form-alumno");
const boton = document.getElementById("btn-guardar");
const mensaje = document.getElementById("mensaje");

// Muestra un aviso en pantalla. El tipo puede ser "info", "ok" o "error".
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
  mensaje.hidden = false;
}

// PASO 1: crear el cliente de Supabase (URL del proyecto + clave publicable)
// Los valores se leen del archivo .env (Vite solo expone las variables que empiezan con VITE_).
// El "?." evita un error si import.meta.env no existe (por ejemplo, al abrir con Live Server).
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY; // empieza con sb_publishable_ ; NUNCA la clave secreta
if (!SUPABASE_URL || !SUPABASE_KEY) {
  mostrarMensaje("Faltan las variables del .env. Levantá el proyecto con: npm run dev", "error");
  throw new Error("Faltan VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Usá npm run dev (no Live Server).");
}
const { createClient } = supabase;
//createClient no hace ningún pedido todavía; solo guarda a dónde y 
//con qué clave se van a hacer los pedidos. 
//La clave publicable puede estar en el navegador; la secreta, nunca.
const cliente = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("conexion",cliente)


// PASO 2: escuchar el evento submit del formulario
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // evita que el formulario recargue la página
  console.log("se envió el formulario");

  // PASO 3: leer los valores que escribió la persona
  const nombre = formulario.elements.nombre.value.trim();
  const email = formulario.elements.email.value.trim();
  const curso = formulario.elements.curso.value;
  console.log({ nombre, email, curso });

  // PASO 4: enviar el INSERT a Supabase


  const { data, error, status } = await cliente
    .from("alumnos")
    .insert([{ nombre, email, curso }]);


  // PASO 5: interpretar la respuesta (error o éxito) y mostrar un mensaje
  console.log("data:", data, "| error:", error, "| status:", status);
  if (error) {
    mostrarMensaje("No se pudo guardar: " + error.message, "error");
    return;
  }
  mostrarMensaje("Registro guardado (estado " + status + ").", "ok");
  formulario.reset();
  cargarRegistros(); // volvemos a leer la tabla para ver la fila nueva
});

// PASO 6: leer los registros de la tabla y mostrarlos en la página.
// select() pide solo las columnas que tienen permiso de lectura (sin email).
// Necesita haber ejecutado sql/03-lectura-registros.sql.
const listaAlumnos = document.getElementById("lista-alumnos");
const estadoLista = document.getElementById("estado-lista");

async function cargarRegistros() {
  const { data, error } = await cliente
    .from("alumnos")
    .select("id, nombre, curso, created_at")
    .order("created_at", { ascending: false }) // los más nuevos primero
    .limit(20);

  console.log("registros:", data, "| error:", error);

  if (error) {
    estadoLista.textContent = "No se pudieron leer los registros: " + error.message;
    return;
  }

  if (data.length === 0) {
    estadoLista.textContent = "Todavía no hay registros.";
    listaAlumnos.innerHTML = "";
    return;
  }

  estadoLista.textContent = "Últimos " + data.length + " registros:";
  listaAlumnos.innerHTML = ""; // vaciamos la lista antes de volver a llenarla

  // Por cada fila creamos un <li>. Usamos textContent (y no innerHTML)
  // para que si alguien escribe código HTML en el nombre, se vea como texto.
  for (const alumno of data) {
    const item = document.createElement("li");

    const nombre = document.createElement("strong");
    nombre.textContent = alumno.nombre;

    const detalle = document.createElement("div");
    detalle.className = "curso";
    const fecha = new Date(alumno.created_at).toLocaleString("es-AR");
    detalle.textContent = alumno.curso + " · " + fecha;

    // Botón para borrar esta fila. Guardamos el id del alumno para saber cuál borrar.
    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn-eliminar";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => eliminarRegistro(alumno.id, alumno.nombre));

    const datos = document.createElement("div");
    datos.append(nombre, detalle);

    item.append(datos, botonEliminar);
    listaAlumnos.append(item);
  }
}

// PASO 7: borrar un registro de la tabla.
// delete() + eq("id", id) -> "DELETE FROM alumnos WHERE id = ..."
// ¡Sin el eq() se intentaría borrar TODAS las filas!
// Necesita haber ejecutado sql/04-eliminar-registros.sql.
async function eliminarRegistro(id, nombre) {
  if (!confirm("¿Eliminar el registro de " + nombre + "?")) {
    return;
  }

  // count: "exact" pide que Supabase diga cuántas filas borró.
  const { error, count } = await cliente
    .from("alumnos")
    .delete({ count: "exact" })
    .eq("id", id);

  console.log("eliminar id", id, "| error:", error, "| filas borradas:", count);

  if (error) {
    mostrarMensaje("No se pudo eliminar: " + error.message, "error");
    return;
  }

  // Si falta la política RLS de borrado, no hay error pero no se borra nada.
  if (count === 0) {
    mostrarMensaje("No se eliminó ninguna fila (¿falta la política de borrado?).", "error");
    return;
  }

  mostrarMensaje("Registro eliminado.", "ok");
  cargarRegistros(); // volvemos a leer la tabla para actualizar la lista
}

// Al abrir la página, mostramos lo que ya hay guardado.
cargarRegistros();
