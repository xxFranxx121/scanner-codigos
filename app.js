// ===============================
// DOM
// ===============================
const video = document.createElement("video");
video.style.width = "100%";
document.getElementById("reader").appendChild(video);

const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");

// ===============================
// Estado
// ===============================
const COOLDOWN_MS = 3000;
let ultimoCodigo = null;
let ultimoTiempo = 0;

let codigos = new Set(JSON.parse(localStorage.getItem("codigos")) || []);
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
// ZXing Scanner
// ===============================
const codeReader = new ZXing.BrowserMultiFormatReader();

codeReader.decodeFromVideoDevice(
  null, // cámara trasera automática
  video,
  (result, err) => {
    if (result) {
      procesarCodigo(result.text);
    }
  }
);

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
