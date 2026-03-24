const list = document.querySelectorAll(".list"); // Obtiene todas las opciones del menú
const indicator = document.querySelector(".indicator"); // Obtiene el indicador circular
const screens = document.querySelectorAll(".screen"); // Obtiene todas las pantallas
const searchInput = document.getElementById("searchInput"); // Obtiene el input de búsqueda
const canvas = document.getElementById("particleCanvas"); // Obtiene el canvas
const ctx = canvas.getContext("2d"); // Obtiene el contexto 2D del canvas
const chatInput = document.getElementById("chatInput"); // Obtiene el input del chat
const chatBox = document.getElementById("chatBox"); // Obtiene la caja del chat

let particles = []; // Arreglo de partículas
let targetPoints = []; // Puntos objetivo de texto
const particleCount = 1200; // Cantidad de partículas
const particleColor = "rgba(170, 150, 255, 0.75)"; // Color de partículas
let sentMessages = 0; // Contador de mensajes enviados

function resizeCanvas() {
  canvas.width = window.innerWidth; // Ajusta ancho del canvas
  canvas.height = window.innerHeight; // Ajusta alto del canvas
}
resizeCanvas(); // Ajuste inicial
window.addEventListener("resize", () => {
  resizeCanvas();
  updateTextTargets(searchInput.value);
}); // Reajusta al cambiar tamaño de ventana

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width; // Posición X inicial
    this.y = Math.random() * canvas.height; // Posición Y inicial
    this.tx = this.x; // Objetivo X
    this.ty = this.y; // Objetivo Y
    this.size = 1.5 + Math.random(); // Tamaño de partícula
    this.vx = 0; // Velocidad X
    this.vy = 0; // Velocidad Y
  }

  update() {
    const dx = this.tx - this.x; // Distancia horizontal
    const dy = this.ty - this.y; // Distancia vertical
    this.vx += dx * 0.015; // Movimiento hacia objetivo X
    this.vy += dy * 0.015; // Movimiento hacia objetivo Y
    this.vx *= 0.88; // Fricción en X
    this.vy *= 0.88; // Fricción en Y
    this.x += this.vx; // Actualiza X
    this.y += this.vy; // Actualiza Y
  }

  draw() {
    ctx.beginPath(); // Inicia dibujo
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // Dibuja partícula
    ctx.fillStyle = particleColor; // Color
    ctx.fill(); // Rellena
  }
}

function initParticles() {
  particles = []; // Limpia arreglo
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle()); // Crea partículas
  }
}
initParticles(); // Inicializa partículas

function getTextPoints(text) {
  const offCanvas = document.createElement("canvas"); // Canvas auxiliar
  const offCtx = offCanvas.getContext("2d"); // Contexto auxiliar
  offCanvas.width = canvas.width; // Mismo ancho
  offCanvas.height = canvas.height; // Mismo alto

  const fontSize = Math.min(160, Math.max(48, canvas.width / 10)); // Tamaño adaptable
  offCtx.fillStyle = "white"; // Texto guía blanco
  offCtx.textAlign = "center"; // Centrado horizontal
  offCtx.textBaseline = "middle"; // Centrado vertical
  offCtx.font = `bold ${fontSize}px Arial`; // Fuente

  offCtx.fillText(text, offCanvas.width / 2, offCanvas.height / 2 - 80); // Dibuja texto al centro

  const imageData = offCtx.getImageData(
    0,
    0,
    offCanvas.width,
    offCanvas.height,
  ).data; // Lee píxeles
  const points = []; // Puntos finales
  const gap = 5; // Espaciado de muestreo

  for (let y = 0; y < offCanvas.height; y += gap) {
    for (let x = 0; x < offCanvas.width; x += gap) {
      const index = (y * offCanvas.width + x) * 4; // Índice RGBA
      if (imageData[index + 3] > 128) {
        points.push({ x, y }); // Guarda punto si pertenece al texto
      }
    }
  }

  return points; // Devuelve puntos
}

function scatterParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].tx = Math.random() * canvas.width; // Objetivo X aleatorio
    particles[i].ty = Math.random() * canvas.height; // Objetivo Y aleatorio
  }
}

function updateTextTargets(text) {
  const cleanText = text.trim(); // Limpia espacios

  if (cleanText === "") {
    scatterParticles(); // Si no hay texto, dispersa
    return;
  }

  targetPoints = getTextPoints(cleanText); // Genera puntos del texto

  for (let i = 0; i < particles.length; i++) {
    if (i < targetPoints.length) {
      particles[i].tx = targetPoints[i].x; // Asigna objetivo X
      particles[i].ty = targetPoints[i].y; // Asigna objetivo Y
    } else {
      particles[i].tx = Math.random() * canvas.width; // Partículas sobrantes se dispersan
      particles[i].ty = Math.random() * canvas.height; // Partículas sobrantes se dispersan
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia canvas

  const homeIsActive = document
    .getElementById("homeScreen")
    .classList.contains("active"); // Revisa si home está activo

  if (homeIsActive) {
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(); // Actualiza solo si home está visible
      particles[i].draw(); // Dibuja solo si home está visible
    }
  }

  requestAnimationFrame(animate); // Continúa animación
}
animate(); // Inicia animación

searchInput.addEventListener("input", (event) => {
  updateTextTargets(event.target.value); // Convierte texto en partículas mientras escribes
});

function showScreen(screenId) {
  screens.forEach((screen) => screen.classList.remove("active")); // Oculta todas las pantallas
  document.getElementById(screenId).classList.add("active"); // Muestra la pantalla seleccionada

  if (screenId !== "homeScreen") {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia partículas si no estás en home
  }

  if (screenId === "homeScreen") {
    updateTextTargets(searchInput.value); // Reactiva el texto al volver a home
  }
}

function activeLink() {
  list.forEach((item) => item.classList.remove("active")); // Quita active de todos
  this.classList.add("active"); // Agrega active al clickeado

  const leftPosition =
    this.offsetLeft + this.offsetWidth / 2 - indicator.offsetWidth / 2; // Calcula nueva posición del indicador
  indicator.style.left = `${leftPosition}px`; // Mueve indicador

  const screenId = this.getAttribute("data-screen"); // Obtiene la pantalla relacionada
  showScreen(screenId); // Cambia pantalla
}

list.forEach((item) => item.addEventListener("click", activeLink)); // Evento click en menú

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && chatInput.value.trim() !== "") {
    const message = document.createElement("div"); // Crea nuevo mensaje
    message.classList.add("message", "sent"); // Lo marca como enviado
    message.textContent = chatInput.value.trim(); // Asigna texto
    chatBox.appendChild(message); // Lo agrega al chat
    sentMessages++; // Suma contador de enviados
    chatInput.value = ""; // Limpia input

    if (sentMessages % 4 === 0) {
      const sentList = chatBox.querySelectorAll(".message.sent"); // Busca mensajes enviados
      if (sentList.length > 0) {
        sentList[sentList.length - 1].remove(); // Borra el último cada 4 mensajes enviados
      }
    }

    chatBox.scrollTop = chatBox.scrollHeight; // Baja scroll al último mensaje
  }
});

window.addEventListener("load", () => {
  const activeItem = document.querySelector(".list.active"); // Busca item activo inicial
  if (activeItem) {
    const leftPosition =
      activeItem.offsetLeft +
      activeItem.offsetWidth / 2 -
      indicator.offsetWidth / 2; // Calcula posición inicial
    indicator.style.left = `${leftPosition}px`; // Posiciona indicador al cargar
  }

  scatterParticles(); // Inicia partículas dispersas
});

// --- LÓGICA DEL CARRUSEL 3D (Cámara) ---
const carousel = document.getElementById("carousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentAngle = 0; // Ángulo inicial

function rotateCarousel() {
  // Aplicamos la rotación en el eje Y y empujamos la caja hacia atrás para que se vea bien centrado
  carousel.style.transform = `translateZ(-190px) rotateY(${currentAngle}deg)`;
}

nextBtn.addEventListener("click", () => {
  currentAngle -= 90; // Restamos 90 grados para girar a la siguiente imagen (como un cubo)
  rotateCarousel();
});

prevBtn.addEventListener("click", () => {
  currentAngle += 90; // Sumamos 90 grados para girar a la imagen anterior
  rotateCarousel();
});
