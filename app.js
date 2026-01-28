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
video.setAttribute("playsinline", true);
video.setAttribute("autoplay", true);
video.setAttribute("muted", true);
video.style.width = "100%";
video.style.height = "350px";
video.style.background = "black";
video.style.borderRadius = "8px";
video.style.objectFit = "cover";
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

  // Permitir códigos numéricos de entre 6 y 20 dígitos
  if (!/^\d{6,20}$/.test(text)) {
    console.log("Código ignorado por formato:", text);
    return;
  }

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
  iniciarEscaneo();
});

async function iniciarEscaneo() {
  try {
    const videoInputDevices = await ZXing.BrowserCodeReader.listVideoInputDevices();

    // Intentar encontrar la cámara trasera
    let selectedDeviceId = videoInputDevices[0].deviceId;

    const backCamera = videoInputDevices.find(device =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('trasera') ||
      device.label.toLowerCase().includes('rear')
    );

    if (backCamera) {
      selectedDeviceId = backCamera.deviceId;
    }

    lectorActivo = true;
    btnIniciar.disabled = true;
    btnIniciar.textContent = "📷 Cámara activa";

    await codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      video,
      (result, err) => {
        if (result) {
          procesarCodigo(result.text);
        }
      }
    );
  } catch (e) {
    console.error(e);
    alert("Error: Asegúrate de dar permisos de cámara.");
    lectorActivo = false;
    btnIniciar.disabled = false;
    btnIniciar.textContent = "📷 Iniciar cámara";
  }
}

// Intentar iniciar automáticamente si el navegador lo permite
window.addEventListener('load', () => {
  iniciarEscaneo().catch(() => {
    console.log("Auto-inicio bloqueado por el navegador, se requiere interacción manual.");
  });
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
