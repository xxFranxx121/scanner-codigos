// ===============================
// DOM
// ===============================
const readerDiv = document.getElementById("reader");
const btnIniciar = document.getElementById("btnIniciar");
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");

// Crear video correctamente
const video = document.createElement("video");
video.setAttribute("playsinline", true); // CLAVE para iOS
video.style.width = "100%";
readerDiv.appendChild(video);

// ===============================
// Configuración
// ===============================
const COOLDOWN_MS = 3000;

// ===============================
// Estado
// ===============================
let codigos = new Set(JSON.parse(localStorage.getItem("codigos")) || []);
let ultimoCodigo = null;
let ultimoTiempo = 0;
let lectorActivo = false;

contador.textContent = codigos.size;
codigos.forEach(c => agregarALaLista(c));

// ===============================
// Funciones
// ===============================
function guardar() {
  localStorage.setItem("codigos", JSON.stringify([...codigos]));
  contador.textContent = codigos.size;
}

function agregarALaLista(code) {
  const li = document.createElement("li");
  li.textContent = code;
  lista.appendChild(li);
}

function procesarCodigo(text) {
  const ahora = Date.now();

  if (text === ultimoCodigo && ahora - ultimoTiempo < COOLDOWN_MS) {
    return;
  }

  ultimoCodigo = text;
  ultimoTiempo = ahora;

  // SOLO 6 dígitos
  if (!/^\d{6}$/.test(text)) return;

  if (codigos.has(text)) {
    alert("⚠ Código repetido: " + text);
    return;
  }

  codigos.add(text);
  agregarALaLista(text);
  guardar();
}

// ===============================
// ZXing
// ===============================
const codeReader = new ZXing.BrowserMultiFormatReader();

btnIniciar.addEventListener("click", async () => {
  if (lectorActivo) return;

  try {
    lectorActivo = true;
    btnIniciar.disabled = true;
    btnIniciar.textContent = "📷 Cámara activa";

    await codeReader.decodeFromVideoDevice(
      null, // cámara trasera automática
      video,
      (result, err) => {
        if (result) {
          procesarCodigo(result.text);
        }
      }
    );
  } catch (e) {
    alert("No se pudo acceder a la cámara");
    console.error(e);
    lectorActivo = false;
    btnIniciar.disabled = false;
    btnIniciar.textContent = "📷 Iniciar cámara";
  }
});

// ===============================
// Limpiar
// ===============================
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Borrar todos los códigos?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
    ultimoCodigo = null;
    ultimoTiempo = 0;
  }
});
