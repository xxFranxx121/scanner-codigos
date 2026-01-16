// ===============================
// DOM
// ===============================
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");

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

// ===============================
// Init
// ===============================
contador.textContent = codigos.size;
codigos.forEach(code => agregarALaLista(code));

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

function agregarCodigo(texto) {
  const ahora = Date.now();

  // Evitar lecturas repetidas inmediatas
  if (texto === ultimoCodigo && (ahora - ultimoTiempo) < COOLDOWN_MS) {
    return;
  }

  ultimoCodigo = texto;
  ultimoTiempo = ahora;

  // SOLO números de 6 dígitos (como 912803)
  if (!/^\d{6}$/.test(texto)) {
    console.log("Ignorado:", texto);
    return;
  }

  if (codigos.has(texto)) {
    alert("⚠ Código repetido: " + texto);
    return;
  }

  codigos.add(texto);
  agregarALaLista(texto);
  guardar();
}

// ===============================
// Scanner (CONFIG CLAVE)
// ===============================
const scanner = new Html5Qrcode("reader");

scanner.start(
  { facingMode: "environment" },
  {
    fps: 3, // lento y estable
    qrbox: { width: 320, height: 120 }, // RECTANGULAR PARA BARRAS
    formatsToSupport: [
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_128
    ]
  },
  (text) => agregarCodigo(text),
  () => {}
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
