const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");

let ultimoCodigo = null;

// Cargar desde localStorage
let codigos = new Set(JSON.parse(localStorage.getItem("codigos")) || []);
contador.textContent = codigos.size;

// Mostrar códigos guardados
codigos.forEach(code => agregarALaLista(code));

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
  if (codigos.has(code)) {
    alert("⚠ Código repetido: " + code);
    return;
  }

  codigos.add(code);
  agregarALaLista(code);
  guardar();
}

// Formatos soportados (Barcodes + QR)
const formatsToSupport = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODABAR
];

// Inicializar escáner (el segundo parámetro es para verbose/debug si fuera necesario)
const scanner = new Html5Qrcode("reader", { verbose: false });

const config = {
  fps: 20, // Mayor velocidad de escaneo
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    // Caja dinámica: 85% del ancho y 40% del alto para códigos de barra largos
    return {
      width: Math.min(viewfinderWidth * 0.85, 400),
      height: Math.min(viewfinderHeight * 0.4, 200)
    };
  },
  aspectRatio: 1.777778, // Proporción 16:9 común en cámaras para ver más ancho
  formatsToSupport: formatsToSupport,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true // Usa API nativa del navegador si está disponible (más rápido)
  }
};

scanner.start(
  { facingMode: "environment" },
  config,
  (text) => {
    if (text !== ultimoCodigo) {
      ultimoCodigo = text;
      agregarCodigo(text);
      setTimeout(() => { ultimoCodigo = null; }, 2500); // Cooldown ligeramente mayor
    }
  },
  (err) => {
    // Errores de "no detectado" ocurren en cada frame, los ignoramos para no saturar
  }
);

// Limpiar todo
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Seguro que querés borrar todos los códigos?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
  }
});