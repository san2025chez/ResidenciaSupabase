// app.final.js: versión COMPLETA y funcional (respaldo para la clase).
// Para usarla: copiar este contenido en app.js, o cambiar en index.html
// <script src="app.js"> por <script src="respaldo/app.final.js">.

const formulario = document.getElementById("form-alumno");
const boton = document.getElementById("btn-guardar");
const mensaje = document.getElementById("mensaje");

// Muestra un aviso en pantalla. El tipo puede ser "info", "ok" o "error".
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
  mensaje.hidden = false;
}

// PASO 1: crear el cliente de Supabase (URL del proyecto + clave publicable).
// La librería de la CDN ya define una variable global llamada "supabase".
// Por eso nuestro cliente se llama "cliente": si lo llamáramos "supabase"
// daría el error "Identifier 'supabase' has already been declared".
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_KEY = "TU_CLAVE_PUBLICABLE"; // empieza con sb_publishable_ ; NUNCA la clave secreta
const { createClient } = supabase;
const cliente = createClient(SUPABASE_URL, SUPABASE_KEY);

// PASO 2: escuchar el evento submit del formulario
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // evita que la página se recargue

  if (SUPABASE_URL.includes("TU-PROYECTO") || SUPABASE_KEY.includes("TU_CLAVE")) {
    mostrarMensaje("Falta completar SUPABASE_URL y SUPABASE_KEY en app.js.", "error");
    return;
  }

  // PASO 3: leer los valores que escribió la persona
  const nombre = formulario.elements.nombre.value.trim();
  const email = formulario.elements.email.value.trim();
  const curso = formulario.elements.curso.value;

  boton.disabled = true;
  mostrarMensaje("Guardando...", "info");

  // PASO 4: enviar el INSERT a Supabase.
  // from("alumnos")  -> en qué tabla
  // insert([{...}])  -> qué filas agregar (una lista de objetos)
  // Las claves del objeto deben llamarse igual que las columnas de la tabla.
  const { data, error, status } = await cliente
    .from("alumnos")
    .insert([{ nombre, email, curso }]);

  boton.disabled = false;

  // PASO 5: interpretar la respuesta.
  // Si salió bien: error es null y status es 201 (creado). data es null
  // porque no pedimos que devuelva la fila (ver .select() en el material complementario).
  console.log("data:", data, "| error:", error, "| status:", status);

  if (error) {
    mostrarMensaje("No se pudo guardar: " + error.message, "error");
    return;
  }

  mostrarMensaje("Registro guardado (estado " + status + "). Comprobalo en la tabla de Supabase.", "ok");
  formulario.reset();
});
