Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#scanner'),
    constraints: {
      facingMode: "environment" // cámara trasera
    }
  },
  decoder: {
    readers: [
      "code_128_reader" // 👈 el tipo exacto de tu código
    ]
  },
  locate: true
}, function (err) {
  if (err) {
    console.error(err);
    alert("No se pudo iniciar la cámara");
    return;
  }
  Quagga.start();
});

Quagga.onDetected(function (data) {
  const code = data.codeResult.code;

  document.getElementById("result").innerText = code;

  // detener cámara después de leer
  Quagga.stop();

  console.log("Código leído:", code);
});
