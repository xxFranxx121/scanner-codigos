const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");
const ultimoEscaneado = document.getElementById("ultimo-escaneado");

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
  // Insertar al principio para ver el más nuevo arriba
  lista.insertBefore(li, lista.firstChild);
}

function procesarDeteccion(code) {
  const ahora = Date.now();

  // Evitar duplicados rápidos
  if (code === ultimoCodigo && ahora - ultimoTiempo < COOLDOWN_MS) {
    return;
  }

  ultimoCodigo = code;
  ultimoTiempo = ahora;
  ultimoEscaneado.textContent = code;

  if (codigos.has(code)) {
    // Ya existe, no lo agregamos pero actualizamos el visual
    return;
  }

  codigos.add(code);
  agregarALaLista(code);
  guardar();

  // Feedback visual breve
  ultimoEscaneado.style.color = "green";
  setTimeout(() => { ultimoEscaneado.style.color = "black"; }, 1000);
}

// Configuración de Quagga para Code 39
Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#scanner-container'),
    constraints: {
      width: 480,
      height: 320,
      facingMode: "environment" // cámara trasera
    },
  },
  locator: {
    patchSize: "medium",
    halfSample: true
  },
  numOfWorkers: 2,
  decoder: {
    readers: ["code_39_reader"] // Configurado para Code 39 Standard
  },
  locate: true
}, function (err) {
  if (err) {
    console.error(err);
    alert("Error al iniciar cámara: " + err);
    return;
  }
  console.log("Quagga iniciado correctamente");
  Quagga.start();
});

Quagga.onDetected(function (data) {
  const code = data.codeResult.code;
  if (code) {
    procesarDeteccion(code);
  }
});

// Limpiar todo
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Seguro que querés borrar todos los códigos?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
    ultimoEscaneado.textContent = "---";
  }
});
