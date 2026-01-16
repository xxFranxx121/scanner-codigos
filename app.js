const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const btnLimpiar = document.getElementById("limpiar");

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

// Inicializar escáner
const scanner = new Html5Qrcode("reader");

scanner.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 220 },
  (text) => agregarCodigo(text),
  (err) => {}
);

// Limpiar todo
btnLimpiar.addEventListener("click", () => {
  if (confirm("¿Seguro que querés borrar todos los códigos?")) {
    codigos.clear();
    lista.innerHTML = "";
    guardar();
  }
});
