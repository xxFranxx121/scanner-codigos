const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");
const ultimoEscaneado = document.getElementById("ultimo-escaneado");
const btnFoto = document.getElementById("btn-foto");
const fileInput = document.getElementById("file-input");

let ultimoCodigo = null;
let ultimoTiempo = 0;
const COOLDOWN_MS = 2500;

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
  lista.insertBefore(li, lista.firstChild);
}

function procesarDeteccion(code) {
  if (!code) return;

  const ahora = Date.now();
  if (code === ultimoCodigo && ahora - ultimoTiempo < COOLDOWN_MS) return;

  ultimoCodigo = code;
  ultimoTiempo = ahora;
  ultimoEscaneado.textContent = code;

  if (codigos.has(code)) return;

  codigos.add(code);
  agregarALaLista(code);
  guardar();

  ultimoEscaneado.style.color = "green";
  setTimeout(() => { ultimoEscaneado.style.color = "#1a73e8"; }, 1000);
}

// Configuración OPTIMIZADA de Quagga (Alta Resolución)
function iniciarQuagga() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner-container'),
      constraints: {
        width: { min: 640, ideal: 1280 },
        height: { min: 480, ideal: 720 },
        facingMode: "environment"
      },
      area: { // Restringir el área de escaneado al centro para mayor precisión
        top: "20%",
        right: "10%",
        left: "10%",
        bottom: "20%"
      }
    },
    locator: {
      patchSize: "medium", // Ajuste para códigos de barra de tamaño medio
      halfSample: false    // Mejor precisión (desactiva el escalado a la mitad)
    },
    numOfWorkers: navigator.hardwareConcurrency || 4,
    decoder: {
      readers: ["code_39_reader"]
    },
    locate: true
  }, function (err) {
    if (err) {
      console.error(err);
      alert("Error: Asegúrate de usar HTTPS y dar permisos de cámara.");
      return;
    }
    Quagga.start();
  });
}

Quagga.onDetected(function (data) {
  const code = data.codeResult.code;
  if (code) {
    procesarDeteccion(code);
  }
});

// ESCANEO POR FOTO (Fallback como Aspose)
btnFoto.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    // Procesar la imagen con Quagga (Decodificación estática)
    Quagga.decodeSingle({
      src: event.target.result,
      numOfWorkers: 0,
      decoder: {
        readers: ["code_39_reader"]
      },
      locate: true,
      src: event.target.result
    }, function (result) {
      if (result && result.codeResult) {
        procesarDeteccion(result.codeResult.code);
      } else {
        alert("No se detectó código en la imagen. Intenta que esté bien enfocada y centrada.");
      }
    });
  };
  reader.readAsDataURL(file);
});

// Limpiar
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Borrar historial?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
    ultimoEscaneado.textContent = "---";
  }
});

// Iniciar al cargar
window.addEventListener('load', iniciarQuagga);
