// ===============================
// Referencias al DOM
// ===============================
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");

// ===============================
// Configuración
// ===============================
const COOLDOWN_MS = 2500; // tiempo mínimo entre lecturas (ms)

// ===============================
// Estado
// ===============================
let codigos = new Set(JSON.parse(localStorage.getItem("codigos")) || []);
let ultimoCodigo = null;
let ultimoTiempo = 0;

// ===============================
// Inicialización
// ===============================
contador.textContent = codigos.size;

// Mostrar códigos guardados al cargar
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

function agregarCodigo(code) {
  const ahora = Date.now();

  // Cooldown: evita lecturas seguidas del mismo código
  if (code === ultimoCodigo && (ahora - ultimoTiempo) < COOLDOWN_MS) {
    return;
  }

  ultimoCodigo = code;
  ultimoTiempo = ahora;

  // SOLO códigos numéricos de 6 dígitos
  if (!/^\d{6}$/.test(code)) {
    console.log("Código ignorado:", code);
    return;
  }

  // Detectar duplicado real
  if (codigos.has(code)) {
    alert("⚠ Código repetido: " + code);
    return;
  }

  // Agregar código nuevo
  codigos.add(code);
  agregarALaLista(code);
  guardar();
}

// ===============================
// Inicializar escáner
// ===============================
const scanner = new Html5Qrcode("reader");

scanner.start(
  { facingMode: "environment" },
  {
    fps: 5,          // escaneo más lento
    qrbox: 250,
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39
    ]
  },
  (text) => agregarCodigo(text),
  (error) => {
    // errores ignorados para no ensuciar consola
  }
);

// ===============================
// Botón limpiar
// ===============================
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Seguro que querés borrar todos los códigos?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
    ultimoCodigo = null;
    ultimoTiempo = 0;
  }
});
