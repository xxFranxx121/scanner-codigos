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
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF
];

// Inicializar escáner con los formatos habilitados
const scanner = new Html5Qrcode("reader", { formatsToSupport: formatsToSupport });

const config = {
  fps: 10,
  qrbox: { width: 300, height: 150 }, // Caja rectangular para códigos de barra
  aspectRatio: 1.0
};

scanner.start(
  { facingMode: "environment" },
  config,
  (text) => {
    if (text !== ultimoCodigo) {
      ultimoCodigo = text;
      agregarCodigo(text);
      setTimeout(() => { ultimoCodigo = null; }, 2000);
    }
  },
  (err) => { }
);

// Limpiar todo
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Seguro que querés borrar todos los códigos?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
  }
});