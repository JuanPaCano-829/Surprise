// ============================================================
//  MENÚ PRINCIPAL — Navegación, Partículas, Chat, Carrusel, Logros
// ============================================================
const list = document.querySelectorAll(".list");
const indicator = document.querySelector(".indicator");
const screens = document.querySelectorAll(".screen");
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
// chat reemplazado por cartas

// Ciclo automático de frases en Home
const PHRASES = [
  "¡Feliz cumpleaños!",
  "¡Eres increíble!",
  "¡No hay nadie como tú!",
  "¡Lo estás haciendo genial!",
];
const SCATTER_TIME = 3500; // ms disperso
const PHRASE_TIME = 4000; // ms mostrando frase
let phraseIndex = 0;
let phraseCycleId = null;

let particles = [];
let targetPoints = [];
const particleCount = 1200;
const particleColor = "rgba(170, 150, 255, 0.75)";
let sentMessages = 0;

function resizeCanvas() {
  canvas.width = document.documentElement.clientWidth || window.innerWidth;
  canvas.height = document.documentElement.clientHeight || window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
});

let spaceMode = false; // true = deriva libre tipo espacio

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.tx = this.x;
    this.ty = this.y;
    // Tamaño variado para simular estrellas cercanas/lejanas
    this.size = 0.5 + Math.random() * 2.2;
    this.vx = 0;
    this.vy = 0;
    // Velocidad de deriva espacial propia (aleatoria y suave)
    this.driftX = (Math.random() - 0.5) * 0.35;
    this.driftY = (Math.random() - 0.5) * 0.35;
    // Brillo pulsante
    this.alpha = 0.4 + Math.random() * 0.6;
    this.alphaDx = (Math.random() - 0.5) * 0.008;
  }
  update() {
    if (spaceMode) {
      // Movimiento libre: deriva suave + rebote en bordes
      this.x += this.driftX;
      this.y += this.driftY;
      if (this.x < 0) {
        this.x = 0;
        this.driftX *= -1;
      }
      if (this.x > canvas.width) {
        this.x = canvas.width;
        this.driftX *= -1;
      }
      if (this.y < 0) {
        this.y = 0;
        this.driftY *= -1;
      }
      if (this.y > canvas.height) {
        this.y = canvas.height;
        this.driftY *= -1;
      }
      // Pulso de brillo
      this.alpha += this.alphaDx;
      if (this.alpha > 1) {
        this.alpha = 1;
        this.alphaDx *= -1;
      }
      if (this.alpha < 0.1) {
        this.alpha = 0.1;
        this.alphaDx *= -1;
      }
    } else {
      // Modo texto: ir al destino
      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      this.vx += dx * 0.015;
      this.vy += dy * 0.015;
      this.vx *= 0.88;
      this.vy *= 0.88;
      this.x += this.vx;
      this.y += this.vy;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (spaceMode) {
      ctx.fillStyle = `rgba(170, 150, 255, ${this.alpha})`;
    } else {
      ctx.fillStyle = particleColor;
    }
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());
}
initParticles();

function getTextPoints(text) {
  const offCanvas = document.createElement("canvas");
  const offCtx = offCanvas.getContext("2d");
  offCanvas.width = canvas.width;
  offCanvas.height = canvas.height;
  const fontSize = Math.min(160, Math.max(48, canvas.width / 10));
  offCtx.fillStyle = "white";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.font = `bold ${fontSize}px Arial`;
  offCtx.fillText(text, offCanvas.width / 2, offCanvas.height / 2 - 80);
  const imageData = offCtx.getImageData(
    0,
    0,
    offCanvas.width,
    offCanvas.height,
  ).data;
  const points = [];
  const gap = 5;
  for (let y = 0; y < offCanvas.height; y += gap)
    for (let x = 0; x < offCanvas.width; x += gap) {
      const index = (y * offCanvas.width + x) * 4;
      if (imageData[index + 3] > 128) points.push({ x, y });
    }
  return points;
}

function scatterParticles() {
  spaceMode = true;
  // Asignar nuevas velocidades de deriva suaves a cada partícula
  for (let i = 0; i < particles.length; i++) {
    particles[i].driftX = (Math.random() - 0.5) * 0.35;
    particles[i].driftY = (Math.random() - 0.5) * 0.35;
  }
}

function updateTextTargets(text) {
  const cleanText = text.trim();
  if (cleanText === "") {
    scatterParticles();
    return;
  }
  spaceMode = false; // salir del modo espacio antes de formar texto
  targetPoints = getTextPoints(cleanText);
  for (let i = 0; i < particles.length; i++) {
    if (i < targetPoints.length) {
      particles[i].tx = targetPoints[i].x;
      particles[i].ty = targetPoints[i].y;
    } else {
      particles[i].tx = Math.random() * canvas.width;
      particles[i].ty = Math.random() * canvas.height;
    }
  }
}

function runPhraseCycle() {
  // Paso 1: dispersar
  scatterParticles();
  phraseCycleId = setTimeout(() => {
    // Paso 2: mostrar frase
    updateTextTargets(PHRASES[phraseIndex]);
    phraseIndex = (phraseIndex + 1) % PHRASES.length;
    phraseCycleId = setTimeout(runPhraseCycle, PHRASE_TIME);
  }, SCATTER_TIME);
}

function startPhraseCycle() {
  stopPhraseCycle();
  phraseIndex = 0;
  runPhraseCycle();
}

function stopPhraseCycle() {
  if (phraseCycleId) {
    clearTimeout(phraseCycleId);
    phraseCycleId = null;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const homeIsActive = document
    .getElementById("homeScreen")
    .classList.contains("active");
  if (homeIsActive)
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
  requestAnimationFrame(animate);
}
animate();

function showScreen(screenId) {
  screens.forEach((s) => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  if (screenId !== "homeScreen") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stopPhraseCycle();
  } else {
    resizeCanvas();
    startPhraseCycle();
  }
}

function activeLink() {
  list.forEach((item) => item.classList.remove("active"));
  this.classList.add("active");
  const leftPosition =
    this.offsetLeft + this.offsetWidth / 2 - indicator.offsetWidth / 2;
  indicator.style.left = `${leftPosition}px`;
  showScreen(this.getAttribute("data-screen"));
}
list.forEach((item) => item.addEventListener("click", activeLink));

// ── Lógica de sobres ──────────────────────────────────────────────
function initLetters() {
  const items = document.querySelectorAll(".env-item");
  const modal = document.getElementById("envModal");
  const modalBg = document.getElementById("envModalBg");
  const paper = document.getElementById("envPaper");
  const txtEl = document.getElementById("envPaperText");
  const sealEl = document.getElementById("envPaperSeal");
  if (!items.length || !modal) return;

  function openModal(item) {
    txtEl.textContent = item.getAttribute("data-text");
    sealEl.textContent = item.getAttribute("data-seal");
    modal.setAttribute("data-index", item.getAttribute("data-index"));
    paper.style.transform = "translateY(0%)";
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  items.forEach((item) => {
    item.addEventListener("click", () => openModal(item));
  });

  modalBg.addEventListener("click", closeModal);
}

// Carrusel
const carousel = document.getElementById("carousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
let currentAngle = 0;
function rotateCarousel() {
  const radius = window.innerWidth < 480 ? 140 : 190;
  carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;
}
nextBtn.addEventListener("click", () => {
  currentAngle -= 90;
  rotateCarousel();
});
prevBtn.addEventListener("click", () => {
  currentAngle += 90;
  rotateCarousel();
});

// Logros
const achievementCards = document.querySelectorAll(".achievement-card");
const achievementSound = document.getElementById("achievementSound");
achievementCards.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("expanded");
    if (card.classList.contains("expanded") && achievementSound) {
      achievementSound.currentTime = 0;
      achievementSound.play().catch(() => {});
    }
  });
});

// ============================================================
//  JUEGO TOP-DOWN — Isla Sorpresa
// ============================================================
const SPRITE_URL = "../Assets/Spritesheet/roguelikeChar_transparent.png";
const TILE = 17;
const SCALE = 3;

const NPCS = [
  {
    id: "npc1",
    name: "🌺 Ana",
    color: "#ff6eb4",
    row: 0,
    col: 0,
    msg: "¡Feliz cumpleaños, Nicole! 🎉 Eres una persona increíble que ilumina la vida de todos. ¡Que este año esté lleno de aventuras y momentos mágicos!",
    mapX: 120,
    mapY: 110,
  },
  {
    id: "npc2",
    name: "🐚 Carlos",
    color: "#7ef2ff",
    row: 1,
    col: 0,
    msg: "Nicole, gracias por ser tan auténtica y especial. Cada día contigo es una razón más para sonreír. ¡Feliz cumple, te mereces todo lo bueno del mundo! 💙",
    mapX: 370,
    mapY: 150,
  },
  {
    id: "npc3",
    name: "🌊 Sofía",
    color: "#ffe066",
    row: 2,
    col: 0,
    msg: "¡Hoy celebramos a la persona más bonita que conozco! Nicole, eres fuerte, divertida y llena de luz. ¡Que cumplas muchos años más rodeada de amor! 🌟",
    mapX: 240,
    mapY: 240,
  },
  {
    id: "npc4",
    name: "🦀 Diego",
    color: "#ff9f7f",
    row: 3,
    col: 0,
    msg: "Feliz cumpleaños a la mejor Nicole del universo 🎂. Que este nuevo año te traiga todo lo que has soñado y mucho más. ¡Eres única!",
    mapX: 80,
    mapY: 250,
  },
  {
    id: "npc5",
    name: "🌴 Valeria",
    color: "#a8ff78",
    row: 4,
    col: 0,
    msg: "Nicole, ser tu amiga es uno de los mejores regalos que me ha dado la vida 💚. ¡Feliz cumpleaños! Que este año sea el mejor de todos.",
    mapX: 420,
    mapY: 270,
  },
];

let gameRunning = false;
let gameCanvas, gameCtx;
let spriteImg = null,
  spriteLoaded = false;
let dialogActive = false,
  dialogNpc = null,
  dialogCooldown = false;

const player = {
  x: 240,
  y: 190,
  speed: 2,
  dir: 0,
  frame: 0,
  frameTimer: 0,
  moving: false,
};
const keys = { up: false, down: false, left: false, right: false };
const joystick = { active: false, baseX: 0, baseY: 0, dx: 0, dy: 0 };

function buildCalendarGame() {
  const calendarScreen = document.getElementById("calendarScreen");
  if (!calendarScreen) return;
  calendarScreen.innerHTML = `
    <div id="gameLauncher" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
      <div style="font-size:2.5rem;">🏖️</div>
      <div style="font-family:'acknowledge_tt_brkregular',sans-serif;font-size:1.4rem;color:#7ef2ff;letter-spacing:2px;text-shadow:0 0 12px #7ef2ff;">Isla Sorpresa</div>
      <div style="font-size:0.9rem;color:rgba(255,255,255,0.7);text-align:center;max-width:280px;line-height:1.5;">Un pequeño mundo hecho para ti, Nicole.<br>Explora la isla y habla con tus amigos 💬</div>
      <button id="gameStartBtn" style="margin-top:8px;padding:12px 32px;border:none;border-radius:50px;background:linear-gradient(90deg,#ff4f8b,#7ef2ff);color:#1a1a2d;font-weight:700;font-size:1rem;cursor:pointer;box-shadow:0 0 20px rgba(126,242,255,0.4);transition:transform 0.2s;">✨ Iniciar aventura</button>
    </div>
    <div id="gameWrapper" style="display:none;flex-direction:column;align-items:center;width:100%;height:100%;position:relative;">
      <canvas id="gameCanvas" style="border-radius:14px;box-shadow:0 0 30px rgba(126,242,255,0.25);display:block;touch-action:none;"></canvas>
      <div id="joystickZone" style="position:absolute;bottom:50px;left:0;width:180px;height:180px;touch-action:none;">
        <div id="joystickBase" style="position:absolute;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.08);border:2px solid rgba(126,242,255,0.3);opacity:0.4;display:flex;align-items:center;justify-content:center;left:50px;top:50px;">
          <div id="joystickThumb" style="width:30px;height:30px;border-radius:50%;background:rgba(126,242,255,0.6);"></div>
        </div>
      </div>
      <div id="gameDialog" style="display:none;position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:90%;max-width:440px;background:rgba(20,20,35,0.97);border:2px solid #ff4f8b;border-radius:16px;padding:16px 20px;flex-direction:column;gap:10px;z-index:20;box-shadow:0 0 24px rgba(255,79,139,0.3);">
        <div id="dialogName" style="font-weight:700;font-size:1.05rem;color:#ff4f8b;"></div>
        <div id="dialogMsg" style="font-size:0.9rem;color:rgba(255,255,255,0.9);line-height:1.6;"></div>
        <button id="dialogClose" style="align-self:flex-end;padding:6px 18px;border:none;border-radius:50px;background:linear-gradient(90deg,#ff4f8b,#ff8dbc);color:#fff;font-weight:600;cursor:pointer;">Cerrar 💗</button>
      </div>
      <button id="gameBackBtn" style="position:absolute;top:8px;left:8px;padding:5px 12px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-size:0.8rem;">← Volver</button>
    </div>
  `;
  document.getElementById("gameStartBtn").addEventListener("click", startGame);
  document
    .getElementById("gameStartBtn")
    .addEventListener("mouseover", function () {
      this.style.transform = "scale(1.05)";
    });
  document
    .getElementById("gameStartBtn")
    .addEventListener("mouseout", function () {
      this.style.transform = "scale(1)";
    });
}

function startGame() {
  document.getElementById("gameLauncher").style.display = "none";
  const wrapper = document.getElementById("gameWrapper");
  wrapper.style.display = "flex";

  gameCanvas = document.getElementById("gameCanvas");
  const W = Math.min(window.innerWidth - 20, 500);
  const H = Math.min(window.innerHeight - 220, 360);
  gameCanvas.width = W;
  gameCanvas.height = H;
  gameCtx = gameCanvas.getContext("2d");
  gameCtx.imageSmoothingEnabled = false;

  if (!spriteLoaded) {
    spriteImg = new Image();
    spriteImg.src = SPRITE_URL;
    spriteImg.onload = () => {
      spriteLoaded = true;
    };
    spriteImg.onerror = () => {
      spriteLoaded = false;
    };
  }

  player.x = W / 2;
  player.y = H / 2;
  gameRunning = true;

  document.getElementById("gameBackBtn").addEventListener("click", stopGame);
  document.getElementById("dialogClose").onclick = closeDialog;
  gameCanvas.addEventListener("click", onCanvasClick);
  gameCanvas.addEventListener("touchstart", onCanvasTouch, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  setupJoystick();
  gameLoop();
}

function stopGame() {
  gameRunning = false;
  document.getElementById("gameLauncher").style.display = "flex";
  document.getElementById("gameWrapper").style.display = "none";
  closeDialog();
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  keys.up = keys.down = keys.left = keys.right = false;
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (dialogActive) return;
  let dx = 0,
    dy = 0;
  if (keys.up) dy = -1;
  if (keys.down) dy = 1;
  if (keys.left) dx = -1;
  if (keys.right) dx = 1;
  if (
    joystick.active &&
    (Math.abs(joystick.dx) > 8 || Math.abs(joystick.dy) > 8)
  ) {
    const mag = Math.sqrt(joystick.dx ** 2 + joystick.dy ** 2);
    dx = joystick.dx / mag;
    dy = joystick.dy / mag;
  }
  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) {
    if (Math.abs(dy) >= Math.abs(dx)) {
      player.dir = dy > 0 ? 0 : 3;
    } else {
      player.dir = dx > 0 ? 2 : 1;
    }
    player.x = Math.max(
      16,
      Math.min(gameCanvas.width - 16, player.x + dx * player.speed),
    );
    player.y = Math.max(
      16,
      Math.min(gameCanvas.height - 16, player.y + dy * player.speed),
    );
    player.frameTimer++;
    if (player.frameTimer >= 10) {
      player.frame = (player.frame + 1) % 4;
      player.frameTimer = 0;
    }
  } else {
    player.frame = 0;
  }

  for (const npc of NPCS) {
    if (Math.hypot(player.x - npc.mapX, player.y - npc.mapY) < 34) {
      openDialog(npc);
      break;
    }
  }
}

// ---- DIBUJO ----
function drawBeach() {
  const g = gameCtx,
    W = gameCanvas.width,
    H = gameCanvas.height;
  const t = Date.now() / 1000;

  // Arena
  const sandGrad = g.createLinearGradient(0, H * 0.25, 0, H);
  sandGrad.addColorStop(0, "#f0c96a");
  sandGrad.addColorStop(1, "#e8b855");
  g.fillStyle = sandGrad;
  g.fillRect(0, 0, W, H);

  // Agua
  const waterGrad = g.createLinearGradient(0, 0, 0, H * 0.3);
  waterGrad.addColorStop(0, "#0d7abf");
  waterGrad.addColorStop(1, "#1ec8e7");
  g.fillStyle = waterGrad;
  g.fillRect(0, 0, W, H * 0.26);

  // Destellos en el agua
  g.fillStyle = "rgba(255,255,255,0.07)";
  for (let i = 0; i < 8; i++) {
    const wx = (i * 67 + t * 30) % W;
    const wy = 10 + (i % 3) * 20;
    g.beginPath();
    g.ellipse(wx, wy, 18, 3, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Olas
  for (let wave = 0; wave < 2; wave++) {
    g.strokeStyle = `rgba(255,255,255,${0.4 - wave * 0.15})`;
    g.lineWidth = 2.5 - wave;
    g.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = H * 0.26 - wave * 6 + Math.sin(x / 55 + t + wave) * 5;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }

  // Textura de arena (puntitos)
  g.fillStyle = "rgba(180,140,60,0.18)";
  for (let i = 0; i < 60; i++) {
    const sx = (i * 83) % W,
      sy = H * 0.28 + ((i * 47) % (H * 0.72));
    g.beginPath();
    g.arc(sx, sy, 2, 0, Math.PI * 2);
    g.fill();
  }

  // Piedras
  [
    [55, 65],
    [W - 60, 85],
    [W - 50, 210],
    [28, 290],
    [W - 80, 330],
  ].forEach(([rx, ry]) => {
    g.fillStyle = "#a09070";
    g.beginPath();
    g.ellipse(rx, ry, 13, 9, 0.3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#c0b080";
    g.beginPath();
    g.ellipse(rx - 2, ry - 2, 7, 4, 0.3, 0, Math.PI * 2);
    g.fill();
  });

  // Palmeras
  [
    [55, 130],
    [W - 50, 105],
    [28, H - 60],
    [W - 60, H - 50],
  ].forEach(([px, py]) => drawPalm(g, px, py));

  // Sombrillas
  drawUmbrella(g, 165, H - 90, "#ff4f8b");
  drawUmbrella(g, 310, 210, "#7ef2ff");

  // Conchas
  [
    [140, H - 60],
    [280, H - 70],
    [360, H - 55],
    [95, 190],
    [W - 120, 270],
  ].forEach(([sx, sy]) => {
    g.fillStyle = "#ffb7c5";
    g.beginPath();
    g.arc(sx, sy, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.beginPath();
    g.arc(sx - 1, sy - 1, 2, 0, Math.PI * 2);
    g.fill();
  });
}

function drawPalm(g, x, y) {
  g.strokeStyle = "#7a4f2a";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(x, y + 45);
  g.bezierCurveTo(x + 6, y + 20, x - 6, y, x, y - 18);
  g.stroke();
  [
    [-1, -0.9],
    [0, -1.1],
    [1, -0.9],
    [-0.8, 0.1],
    [0.8, 0.1],
  ].forEach(([lx, ly]) => {
    g.fillStyle = "#2d7a38";
    g.beginPath();
    g.ellipse(
      x + lx * 26,
      y - 18 + ly * 16,
      17,
      5,
      Math.atan2(ly, lx),
      0,
      Math.PI * 2,
    );
    g.fill();
  });
}

function drawUmbrella(g, x, y, color) {
  g.strokeStyle = "#7a4f2a";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, y - 44);
  g.stroke();
  g.fillStyle = color;
  g.globalAlpha = 0.82;
  g.beginPath();
  g.arc(x, y - 44, 21, Math.PI, 0);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    g.beginPath();
    g.moveTo(x, y - 44);
    g.lineTo(x + i * 8, y - 44 + (i === 0 ? 0 : 18));
    g.stroke();
  }
}

// Sprite del jugador: fila 6 del spritesheet de Kenney (personaje femenino castaño)
// Col 0-3 = frames de animación
function drawSprite(g, row, col, x, y, flip) {
  const size = 16 * SCALE;
  if (spriteLoaded && spriteImg) {
    const sx = col * TILE,
      sy = row * TILE;
    if (flip) {
      g.save();
      g.scale(-1, 1);
      g.drawImage(
        spriteImg,
        sx,
        sy,
        16,
        16,
        -(x + size / 2),
        y - size / 2,
        size,
        size,
      );
      g.restore();
    } else {
      g.drawImage(
        spriteImg,
        sx,
        sy,
        16,
        16,
        x - size / 2,
        y - size / 2,
        size,
        size,
      );
    }
  } else {
    // Fallback pixel-art si no carga el sprite
    g.fillStyle = "#ff9fbe";
    g.fillRect(x - 8, y - 14, 16, 20);
    g.fillStyle = "#6b3a2a";
    g.fillRect(x - 8, y - 20, 16, 8);
  }
}

function drawPlayerChar(g) {
  const size = 16 * SCALE;
  // Sombra
  g.fillStyle = "rgba(0,0,0,0.2)";
  g.beginPath();
  g.ellipse(player.x, player.y + size / 2 - 2, 12, 5, 0, 0, Math.PI * 2);
  g.fill();

  const col = player.moving ? player.frame : 0;
  const ROW = 6; // Fila del personaje femenino base en Kenney roguelike
  drawSprite(g, ROW, col, player.x, player.y, player.dir === 1);

  // Nombre
  g.fillStyle = "rgba(0,0,0,0.6)";
  g.beginPath();
  g.roundRect(player.x - 28, player.y - size / 2 - 20, 56, 15, 4);
  g.fill();
  g.fillStyle = "#ffe0f0";
  g.font = "bold 9px sans-serif";
  g.textAlign = "center";
  g.fillText("Nicole 💗", player.x, player.y - size / 2 - 8);
}

function drawNpcs(g) {
  const size = 16 * SCALE;
  NPCS.forEach((npc) => {
    g.fillStyle = "rgba(0,0,0,0.15)";
    g.beginPath();
    g.ellipse(npc.mapX, npc.mapY + size / 2 - 2, 12, 5, 0, 0, Math.PI * 2);
    g.fill();
    drawSprite(g, npc.row, 0, npc.mapX, npc.mapY, false);
    const dist = Math.hypot(player.x - npc.mapX, player.y - npc.mapY);
    if (dist < 65 && !dialogActive) {
      const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 300);
      g.fillStyle = npc.color;
      g.globalAlpha = pulse;
      g.beginPath();
      g.arc(npc.mapX + 15, npc.mapY - size / 2 - 12, 9, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.fillStyle = "#1a1a2d";
      g.font = "bold 12px sans-serif";
      g.textAlign = "center";
      g.fillText("!", npc.mapX + 15, npc.mapY - size / 2 - 7);
    }
    g.fillStyle = "rgba(0,0,0,0.6)";
    g.beginPath();
    g.roundRect(npc.mapX - 30, npc.mapY - size / 2 - 20, 60, 15, 4);
    g.fill();
    g.fillStyle = npc.color;
    g.font = "bold 8px sans-serif";
    g.textAlign = "center";
    g.fillText(npc.name, npc.mapX, npc.mapY - size / 2 - 8);
  });
}

function draw() {
  if (!gameCtx) return;
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  drawBeach();
  drawNpcs(gameCtx);
  drawPlayerChar(gameCtx);
  if (!dialogActive) {
    gameCtx.fillStyle = "rgba(0,0,0,0.5)";
    gameCtx.beginPath();
    gameCtx.roundRect(gameCanvas.width / 2 - 115, 7, 230, 18, 5);
    gameCtx.fill();
    gameCtx.fillStyle = "rgba(255,255,255,0.8)";
    gameCtx.font = "9px sans-serif";
    gameCtx.textAlign = "center";
    gameCtx.fillText(
      "Acércate a tus amigos para leer su mensaje 💌",
      gameCanvas.width / 2,
      18,
    );
  }
}

function openDialog(npc) {
  if (dialogActive || dialogCooldown) return;
  dialogActive = true;
  dialogNpc = npc;
  const dlg = document.getElementById("gameDialog");
  document.getElementById("dialogName").textContent = npc.name;
  document.getElementById("dialogMsg").textContent = npc.msg;
  dlg.style.borderColor = npc.color;
  document.getElementById("dialogName").style.color = npc.color;
  dlg.style.display = "flex";
}

function closeDialog() {
  dialogActive = false;
  dialogNpc = null;
  dialogCooldown = true;
  setTimeout(() => {
    dialogCooldown = false;
  }, 1200);
  const dlg = document.getElementById("gameDialog");
  if (dlg) dlg.style.display = "none";
}

function onKeyDown(e) {
  if (!gameRunning) return;
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = true;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = true;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
    keys.right = true;
  if (e.key === "Escape") closeDialog();
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
    e.preventDefault();
}
function onKeyUp(e) {
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = false;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
    keys.down = false;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
    keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
    keys.right = false;
}

function onCanvasClick(e) {
  if (dialogActive) {
    closeDialog();
    return;
  }
  const rect = gameCanvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (gameCanvas.width / rect.width);
  const cy = (e.clientY - rect.top) * (gameCanvas.height / rect.height);
  for (const npc of NPCS) {
    if (Math.hypot(cx - npc.mapX, cy - npc.mapY) < 40) {
      openDialog(npc);
      return;
    }
  }
}

function onCanvasTouch(e) {
  e.preventDefault();
  if (dialogActive) {
    closeDialog();
    return;
  }
}

function setupJoystick() {
  const zone = document.getElementById("joystickZone");
  const base = document.getElementById("joystickBase");
  const thumb = document.getElementById("joystickThumb");
  if (!zone) return;

  zone.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const rect = zone.getBoundingClientRect();
      joystick.active = true;
      joystick.baseX = t.clientX - rect.left;
      joystick.baseY = t.clientY - rect.top;
      base.style.left = joystick.baseX - 35 + "px";
      base.style.top = joystick.baseY - 35 + "px";
      base.style.opacity = "1";
      joystick.dx = 0;
      joystick.dy = 0;
    },
    { passive: false },
  );

  zone.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!joystick.active) return;
      const t = e.changedTouches[0];
      const rect = zone.getBoundingClientRect();
      joystick.dx = t.clientX - rect.left - joystick.baseX;
      joystick.dy = t.clientY - rect.top - joystick.baseY;
      const mag = Math.sqrt(joystick.dx ** 2 + joystick.dy ** 2);
      const maxR = 30;
      if (mag > maxR) {
        joystick.dx = (joystick.dx / mag) * maxR;
        joystick.dy = (joystick.dy / mag) * maxR;
      }
      thumb.style.transform = `translate(${joystick.dx}px, ${joystick.dy}px)`;
    },
    { passive: false },
  );

  const endJoystick = () => {
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
    thumb.style.transform = "translate(0,0)";
    base.style.opacity = "0.4";
  };
  zone.addEventListener("touchend", endJoystick);
  zone.addEventListener("touchcancel", endJoystick);
}

window.addEventListener("load", () => {
  const activeItem = document.querySelector(".list.active");
  if (activeItem) {
    const leftPosition =
      activeItem.offsetLeft +
      activeItem.offsetWidth / 2 -
      indicator.offsetWidth / 2;
    indicator.style.left = `${leftPosition}px`;
  }
  buildCalendarGame();
  initLetters();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizeCanvas();
      startPhraseCycle();
    });
  });
});
