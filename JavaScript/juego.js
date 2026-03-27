// ============================================================
//  JUEGO TOP-DOWN — Isla Sorpresa + 4 Mapas + Minijuegos
// ============================================================

// ── Corazones (localStorage) ────────────────────────────────
const HEARTS_KEY = "surprise_hearts";
function loadHearts() {
  try {
    return JSON.parse(localStorage.getItem(HEARTS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveHeart(mapId) {
  const h = loadHearts();
  if (!h.includes(mapId)) {
    h.push(mapId);
    localStorage.setItem(HEARTS_KEY, JSON.stringify(h));
    if (h.length >= 4) unlockHeartsAchievement();
  }
  updateHeartsUI();
}
function unlockHeartsAchievement() {
  const card = document.getElementById("heartAchievement");
  if (card) card.classList.remove("achievement-hidden");
}
function updateHeartsUI() {
  const h = loadHearts();
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById("heart-" + i);
    if (el) el.classList.toggle("heart-collected", h.includes(i));
  }
}

// ── Sprites ──────────────────────────────────────────────────
const SPRITE_URL = "../Assets/Spritesheet/roguelikeChar_transparent.png";
const TILE = 17,
  SCALE = 3;
let spriteImg = null,
  spriteLoaded = false;

// ── Estado global ─────────────────────────────────────────────
let gameRunning = false;
let gameCanvas, gameCtx;
let dialogActive = false,
  dialogNpc = null,
  dialogCooldown = false;
let currentMap = "beach"; // beach | forest | cafe | garden | cave
let transitioning = false;

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

// ── NPCs playa ────────────────────────────────────────────────
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
    msg: "Feliz cumpleaños a la mejor Nicole del universo 🎂. Que este nuevo año te traiga todo lo has soñado y mucho más. ¡Eres única!",
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

// ── Letreros de salida (mapa central) ────────────────────────
const EXIT_SIGNS = [
  { dir: "up", label: "🌲 Bosque", x1: 180, y1: 0, x2: 280, y2: 40 },
  { dir: "right", label: "☕ Café", x1: 440, y1: 130, x2: 500, y2: 230 },
  { dir: "down", label: "🌸 Jardín", x1: 180, y1: 320, x2: 280, y2: 360 },
  { dir: "left", label: "💎 Cueva", x1: 0, y1: 130, x2: 60, y2: 230 },
];
const MAP_FROM_DIR = {
  up: "forest",
  right: "cafe",
  down: "garden",
  left: "cave",
};
const DIR_FROM_MAP = {
  forest: "up",
  cafe: "right",
  garden: "down",
  cave: "left",
};

// ── buildCalendarGame ─────────────────────────────────────────
function buildCalendarGame() {
  const screen = document.getElementById("calendarScreen");
  if (!screen) return;
  screen.innerHTML = `
    <div id="gameLauncher" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
      <div style="font-size:2.5rem;">🏖️</div>
      <div style="font-family:sans-serif;font-size:1.4rem;color:#7ef2ff;letter-spacing:2px;text-shadow:0 0 12px #7ef2ff;">Isla Sorpresa</div>
      <div style="font-size:0.9rem;color:rgba(255,255,255,0.7);text-align:center;max-width:280px;line-height:1.5;">Un pequeño mundo hecho para ti, Nicole.<br>Explora la isla y visita los 4 mapas secretos 💬</div>

      <!-- Corazones recolectados -->
      <div style="display:flex;gap:10px;margin-top:4px;" id="heartRow">
        <span id="heart-1" class="heart-slot">🤍</span>
        <span id="heart-2" class="heart-slot">🤍</span>
        <span id="heart-3" class="heart-slot">🤍</span>
        <span id="heart-4" class="heart-slot">🤍</span>
      </div>

      <button id="gameStartBtn" style="margin-top:8px;padding:12px 32px;border:none;border-radius:50px;background:linear-gradient(90deg,#ff4f8b,#7ef2ff);color:#1a1a2d;font-weight:700;font-size:1rem;cursor:pointer;box-shadow:0 0 20px rgba(126,242,255,0.4);">✨ Iniciar aventura</button>
    </div>

    <div id="gameWrapper" style="display:none;flex-direction:column;align-items:center;width:100%;height:100%;position:relative;">
      <canvas id="gameCanvas" style="border-radius:14px;box-shadow:0 0 30px rgba(126,242,255,0.25);display:block;touch-action:none;"></canvas>

      <!-- HUD corazones in-game -->
      <div id="gameHeartHud" style="position:absolute;top:36px;right:8px;display:flex;gap:4px;z-index:15;font-size:1.1rem;">
        <span id="gheart-1" class="heart-slot">🤍</span>
        <span id="gheart-2" class="heart-slot">🤍</span>
        <span id="gheart-3" class="heart-slot">🤍</span>
        <span id="gheart-4" class="heart-slot">🤍</span>
      </div>

      <!-- Joystick -->
      <div id="joystickZone" style="position:absolute;bottom:50px;left:0;width:180px;height:180px;touch-action:none;">
        <div id="joystickBase" style="position:absolute;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.08);border:2px solid rgba(126,242,255,0.3);opacity:0.4;display:flex;align-items:center;justify-content:center;left:50px;top:50px;">
          <div id="joystickThumb" style="width:30px;height:30px;border-radius:50%;background:rgba(126,242,255,0.6);"></div>
        </div>
      </div>

      <!-- Diálogo -->
      <div id="gameDialog" style="display:none;position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:90%;max-width:440px;background:rgba(20,20,35,0.97);border:2px solid #ff4f8b;border-radius:16px;padding:16px 20px;flex-direction:column;gap:10px;z-index:20;box-shadow:0 0 24px rgba(255,79,139,0.3);">
        <div id="dialogName" style="font-weight:700;font-size:1.05rem;color:#ff4f8b;"></div>
        <div id="dialogMsg"  style="font-size:0.9rem;color:rgba(255,255,255,0.9);line-height:1.6;"></div>
        <button id="dialogClose" style="align-self:flex-end;padding:6px 18px;border:none;border-radius:50px;background:linear-gradient(90deg,#ff4f8b,#ff8dbc);color:#fff;font-weight:600;cursor:pointer;">Cerrar 💗</button>
      </div>

      <!-- Panel minijuego overlay -->
      <div id="miniGamePanel" style="display:none;position:absolute;inset:0;background:rgba(10,10,25,0.97);z-index:30;flex-direction:column;align-items:center;justify-content:center;gap:12px;border-radius:14px;">
        <div id="miniGameTitle" style="font-size:1.2rem;color:#7ef2ff;font-weight:700;letter-spacing:1px;"></div>
        <canvas id="miniCanvas" style="border-radius:10px;border:2px solid rgba(126,242,255,0.3);touch-action:none;"></canvas>
        <div id="miniGameMsg" style="font-size:0.85rem;color:rgba(255,255,255,0.7);text-align:center;max-width:280px;"></div>
        <div style="display:flex;gap:10px;">
          <button id="miniStartBtn" style="padding:8px 24px;border:none;border-radius:50px;background:linear-gradient(90deg,#ff4f8b,#7ef2ff);color:#1a1a2d;font-weight:700;cursor:pointer;">¡Jugar!</button>
          <button id="miniSkipBtn"  style="padding:8px 18px;border:none;border-radius:50px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);cursor:pointer;">Volver</button>
        </div>
      </div>

      <!-- Transición de mapa -->
      <div id="mapTransition" style="display:none;position:absolute;inset:0;background:#000;z-index:40;border-radius:14px;opacity:0;transition:opacity 0.4s;"></div>

      <button id="gameBackBtn" style="position:absolute;top:8px;left:8px;padding:5px 12px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-size:0.8rem;">← Volver</button>
    </div>
  `;

  updateHeartsUI();
  document.getElementById("gameStartBtn").addEventListener("click", startGame);
}

// ── startGame / stopGame ──────────────────────────────────────
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

  currentMap = "beach";
  player.x = gameCanvas.width / 2;
  player.y = gameCanvas.height / 2;
  gameRunning = true;

  // Sync HUD hearts
  syncHudHearts();

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
  stopMiniGame();
  document.getElementById("gameLauncher").style.display = "flex";
  document.getElementById("gameWrapper").style.display = "none";
  closeDialog();
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  keys.up = keys.down = keys.left = keys.right = false;
  updateHeartsUI();
}

function syncHudHearts() {
  const h = loadHearts();
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById("gheart-" + i);
    if (el) el.textContent = h.includes(i) ? "❤️" : "🤍";
  }
}

// ── Game loop ─────────────────────────────────────────────────
function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ── Update ────────────────────────────────────────────────────
function update() {
  if (dialogActive || transitioning || miniGameRunning) return;
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
    if (Math.abs(dy) >= Math.abs(dx)) player.dir = dy > 0 ? 0 : 3;
    else player.dir = dx > 0 ? 2 : 1;
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

  if (currentMap === "beach") {
    // Check NPC collision
    for (const npc of NPCS) {
      if (Math.hypot(player.x - npc.mapX, player.y - npc.mapY) < 34) {
        openDialog(npc);
        break;
      }
    }
    // Check exit zones
    checkExitZones();
  } else {
    checkReturnZone();
  }
}

// ── Map transitions ───────────────────────────────────────────
function checkExitZones() {
  const W = gameCanvas.width,
    H = gameCanvas.height;
  const margin = 30;
  let dir = null;
  if (player.y < margin) dir = "up";
  else if (player.y > H - margin) dir = "down";
  else if (player.x < margin) dir = "left";
  else if (player.x > W - margin) dir = "right";
  if (dir) openMapTransition(MAP_FROM_DIR[dir]);
}

function checkReturnZone() {
  const W = gameCanvas.width,
    H = gameCanvas.height;
  const margin = 30;
  if (
    player.x < margin ||
    player.x > W - margin ||
    player.y < margin ||
    player.y > H - margin
  ) {
    openMapTransition("beach");
  }
}

function openMapTransition(targetMap) {
  if (transitioning) return;
  transitioning = true;
  const overlay = document.getElementById("mapTransition");
  overlay.style.display = "block";
  overlay.style.opacity = "0";
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    setTimeout(() => {
      currentMap = targetMap;
      // Place player in center when arriving
      player.x = gameCanvas.width / 2;
      player.y = gameCanvas.height / 2;
      closeDialog();
      // Show minigame prompt for side maps
      if (targetMap !== "beach") {
        setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => {
            overlay.style.display = "none";
            transitioning = false;
          }, 400);
          showMiniGamePrompt(targetMap);
        }, 500);
      } else {
        setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => {
            overlay.style.display = "none";
            transitioning = false;
          }, 400);
        }, 400);
      }
    }, 400);
  });
}

// ── Draw ──────────────────────────────────────────────────────
function draw() {
  if (!gameCtx) return;
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  if (currentMap === "beach") {
    drawBeach();
    drawNpcs(gameCtx);
    drawExitSigns();
  }
  if (currentMap === "forest") drawForest();
  if (currentMap === "cafe") drawCafe();
  if (currentMap === "garden") drawGarden();
  if (currentMap === "cave") drawCave();
  drawPlayerChar(gameCtx);
  if (!dialogActive) drawHint();
}

function drawHint() {
  const hints = {
    beach: "Explora la isla • Camina hacia los bordes para cambiar de mapa",
    forest: "Bosque nocturno • Sal por cualquier borde para volver",
    cafe: "Café acogedor • Sal por cualquier borde para volver",
    garden: "Jardín de flores • Sal por cualquier borde para volver",
    cave: "Cueva de cristales • Sal por cualquier borde para volver",
  };
  const g = gameCtx,
    W = gameCanvas.width;
  g.fillStyle = "rgba(0,0,0,0.5)";
  g.beginPath();
  g.roundRect(W / 2 - 150, 7, 300, 18, 5);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.75)";
  g.font = "9px sans-serif";
  g.textAlign = "center";
  g.fillText(hints[currentMap], W / 2, 19);
}

// ── Exit signs on beach ───────────────────────────────────────
function drawExitSigns() {
  const g = gameCtx,
    W = gameCanvas.width,
    H = gameCanvas.height;
  const signs = [
    { label: "🌲 Bosque", x: W / 2, y: 28 },
    { label: "☕ Café", x: W - 38, y: H / 2 },
    { label: "🌸 Jardín", x: W / 2, y: H - 18 },
    { label: "💎 Cueva", x: 38, y: H / 2 },
  ];
  signs.forEach((s) => {
    g.fillStyle = "rgba(0,0,0,0.55)";
    g.beginPath();
    g.roundRect(s.x - 32, s.y - 11, 64, 16, 4);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.font = "bold 9px sans-serif";
    g.textAlign = "center";
    g.fillText(s.label, s.x, s.y);
  });
}

// ═══════════════════════════════════════════════════════════════
//  MAPAS — DIBUJO
// ═══════════════════════════════════════════════════════════════

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
  // Destellos
  g.fillStyle = "rgba(255,255,255,0.07)";
  for (let i = 0; i < 8; i++) {
    const wx = (i * 67 + t * 30) % W,
      wy = 10 + (i % 3) * 20;
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
  // Arena textura
  g.fillStyle = "rgba(180,140,60,0.18)";
  for (let i = 0; i < 60; i++) {
    g.beginPath();
    g.arc((i * 83) % W, H * 0.28 + ((i * 47) % (H * 0.72)), 2, 0, Math.PI * 2);
    g.fill();
  }
  // Palmeras y sombrillas
  [
    [55, 130],
    [W - 50, 105],
    [28, H - 60],
    [W - 60, H - 50],
  ].forEach(([px, py]) => drawPalm(g, px, py));
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

function drawForest() {
  const g = gameCtx,
    W = gameCanvas.width,
    H = gameCanvas.height,
    t = Date.now() / 1000;
  // Fondo oscuro
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a1a0a");
  bg.addColorStop(1, "#0d2a0d");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // Luna
  g.fillStyle = "rgba(255,255,220,0.9)";
  g.beginPath();
  g.arc(W * 0.8, 40, 22, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,200,0.15)";
  g.beginPath();
  g.arc(W * 0.8, 40, 40, 0, Math.PI * 2);
  g.fill();
  // Estrellas
  [
    [20, 30],
    [60, 15],
    [120, 25],
    [200, 10],
    [300, 20],
    [380, 35],
  ].forEach(([sx, sy]) => {
    const a = 0.5 + Math.sin(t + sx) * 0.3;
    g.fillStyle = `rgba(255,255,200,${a})`;
    g.beginPath();
    g.arc(sx, sy, 1.5, 0, Math.PI * 2);
    g.fill();
  });
  // Suelo con hierba
  g.fillStyle = "#1a3d1a";
  g.fillRect(0, H * 0.75, W, H * 0.25);
  g.fillStyle = "#0d2a0d";
  g.fillRect(0, H * 0.78, W, H * 0.22);
  // Árboles
  [
    [30, H * 0.7],
    [80, H * 0.65],
    [W - 40, H * 0.7],
    [W - 90, H * 0.65],
    [W / 2 - 60, H * 0.6],
    [W / 2 + 60, H * 0.62],
  ].forEach(([tx, ty]) => {
    g.fillStyle = "#2d1a0a";
    g.fillRect(tx - 5, ty, 10, H * 0.3);
    const r = 35 + Math.sin(t * 0.5 + tx) * 3;
    g.fillStyle = "#1a4d1a";
    g.beginPath();
    g.arc(tx, ty - r * 0.3, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2a6d2a";
    g.beginPath();
    g.arc(tx - 5, ty - r * 0.5, r * 0.7, 0, Math.PI * 2);
    g.fill();
  });
  // Luciérnagas
  for (let i = 0; i < 12; i++) {
    const fx = (i * 73 + t * 20) % W,
      fy = H * 0.3 + Math.sin(t + i) * H * 0.3;
    const a = 0.4 + Math.sin(t * 2 + i) * 0.4;
    g.fillStyle = `rgba(180,255,100,${a})`;
    g.beginPath();
    g.arc(fx, fy, 2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = `rgba(180,255,100,${a * 0.3})`;
    g.beginPath();
    g.arc(fx, fy, 6, 0, Math.PI * 2);
    g.fill();
  }
  // Hongos
  [
    [W * 0.3, H * 0.76],
    [W * 0.65, H * 0.77],
  ].forEach(([mx, my]) => {
    g.fillStyle = "#5a2a0a";
    g.fillRect(mx - 3, my, 6, 14);
    g.fillStyle = "#ff4444";
    g.beginPath();
    g.arc(mx, my, 10, Math.PI, 0);
    g.fill();
    g.fillStyle = "white";
    [
      [mx - 4, my - 3],
      [mx + 2, my - 6],
      [mx + 5, my - 2],
    ].forEach(([dx, dy]) => {
      g.beginPath();
      g.arc(dx, dy, 2.5, 0, Math.PI * 2);
      g.fill();
    });
  });
}

function drawCafe() {
  const g = gameCtx,
    W = gameCanvas.width,
    H = gameCanvas.height;
  // Suelo madera
  g.fillStyle = "#3d2010";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < W; i += 28) {
    g.strokeStyle = "rgba(0,0,0,0.2)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, H);
    g.stroke();
  }
  // Pared
  g.fillStyle = "#2a1505";
  g.fillRect(0, 0, W, H * 0.4);
  g.strokeStyle = "#4a2a10";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, H * 0.4);
  g.lineTo(W, H * 0.4);
  g.stroke();
  // Ventana con luz cálida
  g.fillStyle = "rgba(255,200,80,0.25)";
  g.fillRect(W * 0.6, 20, 90, 70);
  g.strokeStyle = "#6a3a10";
  g.lineWidth = 3;
  g.strokeRect(W * 0.6, 20, 90, 70);
  g.strokeStyle = "#6a3a10";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(W * 0.6 + 45, 20);
  g.lineTo(W * 0.6 + 45, 90);
  g.stroke();
  g.beginPath();
  g.moveTo(W * 0.6, 55);
  g.lineTo(W * 0.6 + 90, 55);
  g.stroke();
  // Luz exterior de ventana
  g.fillStyle = "rgba(255,200,80,0.08)";
  g.beginPath();
  g.moveTo(W * 0.6, 90);
  g.lineTo(W * 0.6 + 90, 90);
  g.lineTo(W, H * 0.6);
  g.lineTo(W * 0.4, H * 0.6);
  g.fill();
  // Pizarrón
  g.fillStyle = "#1a2a1a";
  g.fillRect(30, 15, 110, 60);
  g.strokeStyle = "#3a5a3a";
  g.lineWidth = 3;
  g.strokeRect(30, 15, 110, 60);
  g.fillStyle = "rgba(255,255,255,0.7)";
  g.font = "bold 9px sans-serif";
  g.textAlign = "center";
  g.fillText("☕ Menú del día", 85, 33);
  g.fillStyle = "rgba(255,255,255,0.5)";
  g.font = "8px sans-serif";
  g.fillText("Café latte ........ $45", 85, 48);
  g.fillText("Capuchino ...... $50", 85, 60);
  g.fillText("Pastel de fresa .. $55", 85, 72);
  // Mesas y sillas
  [
    [W * 0.2, H * 0.6],
    [W * 0.65, H * 0.6],
  ].forEach(([mx, my]) => {
    g.fillStyle = "#6b3a10";
    g.fillRect(mx - 35, my, 70, 8); // mesa
    g.fillRect(mx - 30, my + 8, 8, 25);
    g.fillRect(mx + 22, my + 8, 8, 25); // patas
    // Taza encima
    g.fillStyle = "#f5f0e8";
    g.beginPath();
    g.ellipse(mx, my - 6, 12, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(80,40,10,0.7)";
    g.beginPath();
    g.ellipse(mx, my - 8, 8, 5, 0, 0, Math.PI * 2);
    g.fill();
    // Sillas
    [-45, 30].forEach((ox) => {
      g.fillStyle = "#5a3008";
      g.fillRect(mx + ox, my + 5, 25, 5);
      g.fillRect(mx + ox + 3, my + 10, 5, 18);
      g.fillRect(mx + ox + 17, my + 10, 5, 18);
      g.fillRect(mx + ox, my, 25, 16); // respaldo
    });
  });
  // Plantas en esquinas
  [
    [15, H * 0.35],
    [W - 25, H * 0.35],
  ].forEach(([px, py]) => {
    g.fillStyle = "#3a1a05";
    g.fillRect(px - 8, py + 20, 16, 20);
    g.fillStyle = "#2a5a10";
    g.beginPath();
    g.arc(px, py, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#3a7a20";
    g.beginPath();
    g.arc(px - 8, py + 5, 12, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(px + 8, py + 5, 12, 0, Math.PI * 2);
    g.fill();
  });
  // Lámparas colgantes
  [W * 0.3, W * 0.7].forEach((lx) => {
    g.strokeStyle = "#3a1a05";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(lx, 0);
    g.lineTo(lx, 30);
    g.stroke();
    g.fillStyle = "rgba(255,200,80,0.9)";
    g.beginPath();
    g.arc(lx, 30, 8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,200,80,0.15)";
    g.beginPath();
    g.arc(lx, 30, 22, 0, Math.PI * 2);
    g.fill();
  });
}

function drawGarden() {
  const g = gameCtx,
    W = gameCanvas.width,
    H = gameCanvas.height,
    t = Date.now() / 1000;
  // Cielo suave
  const sky = g.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, "#87ceeb");
  sky.addColorStop(1, "#b0e0ff");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  // Sol
  g.fillStyle = "rgba(255,230,50,0.95)";
  g.beginPath();
  g.arc(W * 0.15, 50, 28, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,230,50,0.2)";
  g.beginPath();
  g.arc(W * 0.15, 50, 50, 0, Math.PI * 2);
  g.fill();
  // Nubes
  [
    [W * 0.4, 35],
    [W * 0.7, 25],
  ].forEach(([cx, cy]) => {
    g.fillStyle = "rgba(255,255,255,0.9)";
    [
      [0, 0, 22, 14],
      [18, 0, 18, 12],
      [-16, 0, 18, 12],
      [0, 8, 26, 12],
    ].forEach(([ox, oy, rw, rh]) => {
      g.beginPath();
      g.ellipse(cx + ox, cy + oy, rw, rh, 0, 0, Math.PI * 2);
      g.fill();
    });
  });
  // Pasto
  g.fillStyle = "#4aaa2a";
  g.fillRect(0, H * 0.6, W, H * 0.4);
  g.fillStyle = "#3a8a1a";
  g.fillRect(0, H * 0.65, W, H * 0.35);
  // Camino de piedra
  for (let i = 0; i < 8; i++) {
    const px = W / 2 - 20 + (i % 2) * 40,
      py = H * 0.62 + i * 18;
    g.fillStyle = "#c8b898";
    g.beginPath();
    g.ellipse(px, py, 14, 8, 0.2, 0, Math.PI * 2);
    g.fill();
  }
  // Flores decorativas
  const flowerColors = [
    "#ff4f8b",
    "#ff9fbe",
    "#ffe066",
    "#a8ff78",
    "#7ef2ff",
    "#ff6eb4",
  ];
  for (let i = 0; i < 24; i++) {
    const fx = 20 + ((i * 57) % (W - 40)),
      fy = H * 0.62 + ((i * 31) % (H * 0.32));
    const fc = flowerColors[i % flowerColors.length];
    const sway = Math.sin(t * 1.5 + i) * 3;
    g.fillStyle = "#3a7a10";
    g.fillRect(fx - 1, fy, 2, 12); // tallo
    g.fillStyle = fc;
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2 + sway * 0.1;
      g.beginPath();
      g.ellipse(
        fx + Math.cos(angle) * 5,
        fy - Math.sin(angle) * 5,
        4,
        3,
        angle,
        0,
        Math.PI * 2,
      );
      g.fill();
    }
    g.fillStyle = "#ffe066";
    g.beginPath();
    g.arc(fx, fy, 3, 0, Math.PI * 2);
    g.fill();
  }
  // Árboles frutales
  [
    [W * 0.1, H * 0.55],
    [W * 0.9, H * 0.55],
  ].forEach(([tx, ty]) => {
    g.fillStyle = "#5a3010";
    g.fillRect(tx - 5, ty, 10, H * 0.3);
    g.fillStyle = "#2a7a10";
    g.beginPath();
    g.arc(tx, ty - 20, 35, 0, Math.PI * 2);
    g.fill();
    // Manzanas
    [
      [tx - 15, ty - 30],
      [tx + 10, ty - 20],
      [tx - 5, ty - 40],
      [tx + 18, ty - 35],
    ].forEach(([ax, ay]) => {
      g.fillStyle = "#ff3333";
      g.beginPath();
      g.arc(ax, ay, 5, 0, Math.PI * 2);
      g.fill();
    });
  });
  // Mariposas
  for (let i = 0; i < 4; i++) {
    const bx = (i * 120 + t * 40) % W,
      by = H * 0.4 + Math.sin(t * 2 + i) * H * 0.15;
    const flap = Math.abs(Math.sin(t * 8 + i));
    g.fillStyle = ["#ff9fbe", "#ffe066", "#7ef2ff", "#a8ff78"][i];
    g.beginPath();
    g.ellipse(bx - flap * 6, by, 7 * flap, 5, -0.5, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(bx + flap * 6, by, 7 * flap, 5, 0.5, 0, Math.PI * 2);
    g.fill();
  }
  // Banca
  g.fillStyle = "#8B5E3C";
  g.fillRect(W * 0.5 - 35, H * 0.68, 70, 8);
  g.fillRect(W * 0.5 - 32, H * 0.76, 8, 18);
  g.fillRect(W * 0.5 + 24, H * 0.76, 8, 18);
}

function drawCave() {
  const g = gameCtx,
    W = gameCanvas.width,
    H = gameCanvas.height,
    t = Date.now() / 1000;
  // Fondo roca
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0a1a");
  bg.addColorStop(1, "#151525");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // Textura roca
  g.fillStyle = "rgba(255,255,255,0.02)";
  for (let i = 0; i < 30; i++) {
    g.beginPath();
    g.ellipse(
      (i * 67) % W,
      (i * 43) % H,
      20 + (i % 15),
      10 + (i % 10),
      i * 0.3,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  // Stalactitas arriba
  [
    [30, 0, 15, 45],
    [80, 0, 10, 35],
    [150, 0, 18, 55],
    [220, 0, 12, 40],
    [290, 0, 20, 60],
    [350, 0, 14, 42],
    [W - 20, 0, 11, 38],
  ].forEach(([sx, sy, w, h]) => {
    g.fillStyle = "#2a2a4a";
    g.beginPath();
    g.moveTo(sx - w / 2, sy);
    g.lineTo(sx + w / 2, sy);
    g.lineTo(sx, sy + h);
    g.closePath();
    g.fill();
    // Gota brillante
    const a = 0.4 + Math.sin(t * 2 + sx) * 0.3;
    g.fillStyle = `rgba(100,150,255,${a})`;
    g.beginPath();
    g.arc(sx, sy + h, 3, 0, Math.PI * 2);
    g.fill();
  });
  // Stalagmitas abajo
  [
    [50, H, 12, 35],
    [120, H, 16, 50],
    [200, H, 10, 30],
    [270, H, 18, 55],
    [340, H, 13, 40],
    [W - 50, H, 11, 32],
  ].forEach(([sx, sy, w, h]) => {
    g.fillStyle = "#2a2a4a";
    g.beginPath();
    g.moveTo(sx - w / 2, sy);
    g.lineTo(sx + w / 2, sy);
    g.lineTo(sx, sy - h);
    g.closePath();
    g.fill();
  });
  // Cristales — el corazón de la cueva
  const crystalColors = [
    ["#7ef2ff", "#a0f8ff"],
    ["#b060ff", "#d090ff"],
    ["#ff60b0", "#ff90d0"],
    ["#60ffb0", "#90ffd0"],
    ["#ffe060", "#fff090"],
  ];
  [
    [W * 0.25, H * 0.65],
    [W * 0.4, H * 0.7],
    [W * 0.55, H * 0.62],
    [W * 0.7, H * 0.68],
    [W * 0.15, H * 0.72],
    [W * 0.82, H * 0.65],
  ].forEach(([cx, cy], i) => {
    const [c1, c2] = crystalColors[i % crystalColors.length];
    const glow = 0.6 + Math.sin(t * 1.5 + i) * 0.4;
    // Glow
    g.fillStyle = c1.replace("ff", "66") + "44";
    g.beginPath();
    g.arc(cx, cy, 20, 0, Math.PI * 2);
    g.fill();
    // Cristal
    const h2 = 25 + (i % 3) * 10;
    const grad = g.createLinearGradient(cx, cy, cx, cy - h2);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    g.fillStyle = grad;
    g.globalAlpha = glow;
    g.beginPath();
    g.moveTo(cx - 8, cy);
    g.lineTo(cx, cy - h2);
    g.lineTo(cx + 8, cy);
    g.lineTo(cx + 5, cy + 8);
    g.lineTo(cx - 5, cy + 8);
    g.closePath();
    g.fill();
    g.globalAlpha = 1;
    // Brillo
    g.fillStyle = "rgba(255,255,255,0.4)";
    g.beginPath();
    g.moveTo(cx - 3, cy - 5);
    g.lineTo(cx, cy - h2 + 5);
    g.lineTo(cx - 1, cy - 5);
    g.closePath();
    g.fill();
  });
  // Lago subterráneo
  const lakeGrad = g.createLinearGradient(0, H * 0.82, 0, H);
  lakeGrad.addColorStop(0, "#050530");
  lakeGrad.addColorStop(1, "#0a0a50");
  g.fillStyle = lakeGrad;
  g.fillRect(0, H * 0.82, W, H * 0.18);
  // Reflejo de cristales en lago
  g.fillStyle = "rgba(100,200,255,0.15)";
  g.beginPath();
  g.ellipse(W / 2, H * 0.88, W * 0.4, 15, 0, 0, Math.PI * 2);
  g.fill();
  // Ondas del lago
  for (let w = 0; w < 3; w++) {
    const wy = H * 0.84 + w * 8 + Math.sin(t + w) * 3;
    g.strokeStyle = `rgba(100,150,255,${0.3 - w * 0.08})`;
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y2 = wy + Math.sin(x / 40 + t) * 3;
      x === 0 ? g.moveTo(x, y2) : g.lineTo(x, y2);
    }
    g.stroke();
  }
  // Murciélagos
  for (let i = 0; i < 3; i++) {
    const bx = (i * 130 + t * 25) % W,
      by = 60 + i * 40;
    const flap = Math.sin(t * 6 + i);
    g.fillStyle = "#333355";
    g.beginPath();
    g.ellipse(bx, by, 6, 4, 0, 0, Math.PI * 2);
    g.fill(); // cuerpo
    g.beginPath();
    g.ellipse(bx - 10 * Math.abs(flap), by, 9, 4, -0.3, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(bx + 10 * Math.abs(flap), by, 9, 4, 0.3, 0, Math.PI * 2);
    g.fill();
  }
}

// ── Helpers de playa ──────────────────────────────────────────
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
}
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
    } else
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
  } else {
    g.fillStyle = "#ff9fbe";
    g.fillRect(x - 8, y - 14, 16, 20);
    g.fillStyle = "#6b3a2a";
    g.fillRect(x - 8, y - 20, 16, 8);
  }
}
function drawPlayerChar(g) {
  const size = 16 * SCALE;
  g.fillStyle = "rgba(0,0,0,0.2)";
  g.beginPath();
  g.ellipse(player.x, player.y + size / 2 - 2, 12, 5, 0, 0, Math.PI * 2);
  g.fill();
  drawSprite(
    g,
    6,
    player.moving ? player.frame : 0,
    player.x,
    player.y,
    player.dir === 1,
  );
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

// ── Diálogo ───────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════
//  MINIJUEGOS
// ═══════════════════════════════════════════════════════════════
let miniGameRunning = false;
let miniGameId = null;
let miniAF = null; // animation frame
let miniState = {};

const MINI_CONFIG = {
  forest: {
    title: "🌲 Bosque — Plataformas",
    desc: "Llega a la estrella ⭐ saltando sobre las plataformas. Usa ← → para moverte y ↑ o toca la pantalla para saltar.",
    heartId: 1,
  },
  cafe: {
    title: "☕ Café — El Laberinto",
    desc: "Encuentra la salida 🚪 del laberinto. Usa ← ↑ → ↓ o el joystick.",
    heartId: 2,
  },
  garden: {
    title: "🌸 Jardín — Piñata",
    desc: "Dale a la piñata 🎉 haciendo clic o tocando cuando el palo esté en el centro. ¡3 golpes y ganas!",
    heartId: 3,
  },
  cave: {
    title: "💎 Cueva — Atrapa al Topo",
    desc: "Haz clic en el topo 🦔 cada vez que aparezca. ¡Atrápalo 5 veces!",
    heartId: 4,
  },
};

function showMiniGamePrompt(mapId) {
  const cfg = MINI_CONFIG[mapId];
  if (!cfg) return;
  const panel = document.getElementById("miniGamePanel");
  document.getElementById("miniGameTitle").textContent = cfg.title;
  document.getElementById("miniGameMsg").textContent = cfg.desc;
  panel.style.display = "flex";
  miniGameId = mapId;
  // Check if already collected
  const h = loadHearts();
  const startBtn = document.getElementById("miniStartBtn");
  if (h.includes(cfg.heartId)) {
    startBtn.textContent = "Ya tienes este ❤️";
    startBtn.onclick = () => hideMiniPanel();
  } else {
    startBtn.textContent = "¡Jugar!";
    startBtn.onclick = () => startMiniGame(mapId);
  }
  document.getElementById("miniSkipBtn").onclick = () => hideMiniPanel();
}
function hideMiniPanel() {
  document.getElementById("miniGamePanel").style.display = "none";
  miniGameId = null;
}
function stopMiniGame() {
  miniGameRunning = false;
  if (miniAF) {
    cancelAnimationFrame(miniAF);
    miniAF = null;
  }
  hideMiniPanel();
}
function winMiniGame(heartId) {
  miniGameRunning = false;
  if (miniAF) {
    cancelAnimationFrame(miniAF);
    miniAF = null;
  }
  saveHeart(heartId);
  syncHudHearts();
  const panel = document.getElementById("miniGamePanel");
  document.getElementById("miniGameTitle").textContent = "¡Ganaste! ❤️";
  document.getElementById("miniGameMsg").textContent =
    "¡Corazón recogido! Ya puedes seguir explorando.";
  document.getElementById("miniStartBtn").textContent = "Continuar";
  document.getElementById("miniStartBtn").onclick = () => hideMiniPanel();
}

function startMiniGame(mapId) {
  const mc = document.getElementById("miniCanvas");
  mc.width = Math.min(gameCanvas.width - 20, 360);
  mc.height = Math.min(gameCanvas.height - 100, 240);
  document.getElementById("miniGameMsg").textContent = "";
  if (mapId === "forest") startPlatformer(mc);
  if (mapId === "cafe") startMaze(mc);
  if (mapId === "garden") startPinata(mc);
  if (mapId === "cave") startMole(mc);
}

// ── Minijuego 1: Plataformas (Bosque) ────────────────────────
function startPlatformer(mc) {
  const ctx = mc.getContext("2d");
  const W = mc.width,
    H = mc.height;
  miniGameRunning = true;
  miniState = {
    px: 40,
    py: H - 60,
    pvx: 0,
    pvy: 0,
    onGround: false,
    jumps: 0,
    platforms: [
      { x: 0, y: H - 30, w: W, h: 30 }, // suelo
      { x: 60, y: H - 90, w: 80, h: 12 },
      { x: 180, y: H - 140, w: 70, h: 12 },
      { x: W - 150, y: H - 180, w: 80, h: 12 },
      { x: W - 100, y: H - 100, w: 60, h: 12 },
      { x: W - 60, y: H - 230, w: 55, h: 12 },
    ],
    star: { x: W - 42, y: H - 258 },
    won: false,
  };
  const s = miniState;
  // Controles teclado/joystick ya configurados, añadir salto táctil
  mc.ontouchstart = (e) => {
    e.preventDefault();
    if (!s.won) doJump(s);
  };
  mc.onclick = () => {
    if (!s.won) doJump(s);
  };
  function doJump(s) {
    if (s.onGround || s.jumps < 1) {
      s.pvy = -9;
      s.onGround = false;
      s.jumps++;
    }
  }

  function loop() {
    if (!miniGameRunning) return;
    // Physics
    s.pvx = 0;
    if (keys.left) s.pvx = -3.5;
    if (keys.right) s.pvx = 3.5;
    if (joystick.active) {
      if (joystick.dx < -10) s.pvx = -3.5;
      if (joystick.dx > 10) s.pvx = 3.5;
      if (joystick.dy < -10 && s.onGround) doJump(s);
    }
    if (keys.up && s.onGround) doJump(s);
    s.pvy += 0.45; // gravity
    s.px += s.pvx;
    s.py += s.pvy;
    s.px = Math.max(10, Math.min(W - 10, s.px));
    s.onGround = false;
    s.platforms.forEach((p) => {
      if (
        s.px + 8 > p.x &&
        s.px - 8 < p.x + p.w &&
        s.py + 16 > p.y &&
        s.py + 16 < p.y + p.h + s.pvy + 2 &&
        s.pvy >= 0
      ) {
        s.py = p.y - 16;
        s.pvy = 0;
        s.onGround = true;
        s.jumps = 0;
      }
    });
    if (s.py > H + 40) {
      s.px = 40;
      s.py = H - 60;
      s.pvy = 0;
    } // caída = respawn

    // Draw
    ctx.clearRect(0, 0, W, H);
    // BG
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a1a0a");
    bg.addColorStop(1, "#0d2a0d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // Platforms
    s.platforms.forEach((p) => {
      ctx.fillStyle = "#2a5a1a";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#3a8a2a";
      ctx.fillRect(p.x, p.y, p.w, 4);
    });
    // Star
    const sa = 0.7 + Math.sin(Date.now() / 300) * 0.3;
    ctx.fillStyle = `rgba(255,220,50,${sa})`;
    ctx.font = "22px serif";
    ctx.textAlign = "center";
    ctx.fillText("⭐", s.star.x, s.star.y);
    // Player
    ctx.fillStyle = "#ff9fbe";
    ctx.fillRect(s.px - 8, s.py - 16, 16, 22);
    ctx.fillStyle = "#6b3a2a";
    ctx.fillRect(s.px - 8, s.py - 22, 16, 8);
    // Check win
    if (!s.won && Math.hypot(s.px - s.star.x, s.py - s.star.y) < 22) {
      s.won = true;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffe066";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("¡Llegaste! ⭐", W / 2, H / 2);
      setTimeout(() => winMiniGame(1), 1200);
    }
    miniAF = requestAnimationFrame(loop);
  }
  miniAF = requestAnimationFrame(loop);
}

// ── Minijuego 2: Laberinto (Café) ────────────────────────────
function startMaze(mc) {
  const ctx = mc.getContext("2d");
  const W = mc.width,
    H = mc.height;
  const CELL = 30,
    COLS = Math.floor(W / CELL),
    ROWS = Math.floor(H / CELL);
  miniGameRunning = true;

  // Generar laberinto simple con DFS
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const walls = Array.from({ length: ROWS }, () =>
    Array(COLS).fill({ r: true, b: true }),
  );
  const wallsR = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
  const wallsB = Array.from({ length: ROWS }, () => Array(COLS).fill(true));

  function carve(r, c) {
    visited[r][c] = true;
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ].sort(() => Math.random() - 0.5);
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr,
        nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) {
        if (dr === 0 && dc === 1) wallsR[r][c] = false;
        if (dr === 0 && dc === -1) wallsR[r][nc] = false;
        if (dr === 1 && dc === 0) wallsB[r][c] = false;
        if (dr === -1 && dc === 0) wallsB[nr][c] = false;
        carve(nr, nc);
      }
    });
  }
  carve(0, 0);

  miniState = { pr: 0, pc: 0, won: false };
  const s = miniState;
  let lastMove = 0;

  mc.ontouchstart = null;
  mc.onclick = null;

  function loop() {
    if (!miniGameRunning) return;
    const now = Date.now();
    if (now - lastMove > 180) {
      let nr = s.pr,
        nc = s.pc;
      if (
        (keys.up || (joystick.active && joystick.dy < -12)) &&
        nr > 0 &&
        !wallsB[nr - 1][nc]
      )
        nr--;
      if (
        (keys.down || (joystick.active && joystick.dy > 12)) &&
        nr < ROWS - 1 &&
        !wallsB[nr][nc]
      )
        nr++;
      if (
        (keys.left || (joystick.active && joystick.dx < -12)) &&
        nc > 0 &&
        !wallsR[nr][nc - 1]
      )
        nc--;
      if (
        (keys.right || (joystick.active && joystick.dx > 12)) &&
        nc < COLS - 1 &&
        !wallsR[nr][nc]
      )
        nc++;
      if (nr !== s.pr || nc !== s.pc) {
        s.pr = nr;
        s.pc = nc;
        lastMove = now;
      }
    }

    // Draw
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#1a0f2e";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#7ef2ff";
    ctx.lineWidth = 2;
    // Border
    ctx.strokeRect(0, 0, COLS * CELL, ROWS * CELL);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const x = c * CELL,
          y = r * CELL;
        ctx.strokeStyle = "rgba(126,242,255,0.6)";
        ctx.lineWidth = 1.5;
        if (wallsR[r][c] && c < COLS - 1) {
          ctx.beginPath();
          ctx.moveTo(x + CELL, y);
          ctx.lineTo(x + CELL, y + CELL);
          ctx.stroke();
        }
        if (wallsB[r][c] && r < ROWS - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y + CELL);
          ctx.lineTo(x + CELL, y + CELL);
          ctx.stroke();
        }
      }
    // Goal
    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "🚪",
      (COLS - 1) * CELL + CELL / 2,
      (ROWS - 1) * CELL + CELL / 2 + 6,
    );
    // Player
    ctx.fillStyle = "#ff4f8b";
    ctx.beginPath();
    ctx.arc(
      s.pc * CELL + CELL / 2,
      s.pr * CELL + CELL / 2,
      CELL * 0.32,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Win check
    if (!s.won && s.pr === ROWS - 1 && s.pc === COLS - 1) {
      s.won = true;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#7ef2ff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("¡Salida encontrada! 🚪", W / 2, H / 2);
      setTimeout(() => winMiniGame(2), 1200);
    }
    miniAF = requestAnimationFrame(loop);
  }
  miniAF = requestAnimationFrame(loop);
}

// ── Minijuego 3: Piñata (Jardín) ─────────────────────────────
function startPinata(mc) {
  const ctx = mc.getContext("2d");
  const W = mc.width,
    H = mc.height;
  miniGameRunning = true;
  miniState = {
    angle: 0,
    speed: 2.2,
    dir: 1,
    hits: 0,
    maxHits: 3,
    swinging: false,
    confetti: [],
    won: false,
  };
  const s = miniState;

  function swing() {
    if (s.won) return;
    s.swinging = true;
    setTimeout(() => {
      s.swinging = false;
    }, 400);
  }
  mc.onclick = swing;
  mc.ontouchstart = (e) => {
    e.preventDefault();
    swing();
  };

  function loop() {
    if (!miniGameRunning) return;
    s.angle += s.speed * s.dir * 0.04;
    if (Math.abs(s.angle) > 0.6) s.dir *= -1;

    // Check hit — ángulo cerca de 0 cuando swinging
    if (s.swinging && Math.abs(s.angle) < 0.15 && !s.won) {
      s.hits++;
      s.swinging = false;
      // Confetti burst
      for (let i = 0; i < 20; i++)
        s.confetti.push({
          x: W / 2,
          y: H * 0.45,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 5 - 2,
          color: ["#ff4f8b", "#ffe066", "#7ef2ff", "#a8ff78"][
            Math.floor(Math.random() * 4)
          ],
          life: 1,
        });
      if (s.hits >= s.maxHits) {
        s.won = true;
        setTimeout(() => winMiniGame(3), 1400);
      }
    }

    ctx.clearRect(0, 0, W, H);
    // BG jardín
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, W, H * 0.6);
    ctx.fillStyle = "#4aaa2a";
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    // Cuerda y piñata
    ctx.save();
    ctx.translate(W / 2, H * 0.15);
    ctx.rotate(s.angle);
    // Cuerda
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, H * 0.28);
    ctx.stroke();
    // Piñata (estrella con color según golpes)
    const colors = ["#ff4f8b", "#ff9f40", "#ffe066"];
    const shade = s.hits < s.maxHits ? colors[s.hits] : "#aaa";
    ctx.translate(0, H * 0.28);
    // Cuerpo
    ctx.fillStyle = shade;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
      const x1 = Math.cos(a) * 25,
        y1 = Math.sin(a) * 25;
      const a2 = a + Math.PI / 5;
      const x2 = Math.cos(a2) * 12,
        y2 = Math.sin(a2) * 12;
      if (p === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
      } else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Ojos
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(-7, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Palo
    const pX = W * 0.15,
      pY = H * 0.55;
    const pAngle = s.swinging ? -0.8 : 0.3;
    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(pAngle);
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-5, -60, 10, 70);
    ctx.restore();

    // HUD golpes
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(8, 8, 120, 22);
    ctx.beginPath();
    ctx.roundRect(8, 8, 120, 22, 6);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `Golpes: ${"💥".repeat(s.hits)}${"⭕".repeat(s.maxHits - s.hits)}`,
      14,
      23,
    );

    // Instrucción
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("¡Haz clic cuando el palo esté centrado!", W / 2, H - 10);

    // Confetti
    s.confetti.forEach((c, i) => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.2;
      c.life -= 0.03;
      if (c.life > 0) {
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.life;
        ctx.fillRect(c.x, c.y, 6, 6);
        ctx.globalAlpha = 1;
      }
    });
    s.confetti = s.confetti.filter((c) => c.life > 0);

    if (s.won) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffe066";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("¡Piñata rota! 🎉", W / 2, H / 2);
    }
    miniAF = requestAnimationFrame(loop);
  }
  miniAF = requestAnimationFrame(loop);
}

// ── Minijuego 4: Topo (Cueva) ─────────────────────────────────
function startMole(mc) {
  const ctx = mc.getContext("2d");
  const W = mc.width,
    H = mc.height;
  miniGameRunning = true;
  const HOLES = [
    { x: W * 0.2, y: H * 0.35 },
    { x: W * 0.5, y: H * 0.25 },
    { x: W * 0.8, y: H * 0.35 },
    { x: W * 0.3, y: H * 0.6 },
    { x: W * 0.7, y: H * 0.6 },
  ];
  miniState = {
    hits: 0,
    needed: 5,
    mole: null,
    timer: 0,
    interval: 1400,
    won: false,
  };
  const s = miniState;

  function spawnMole() {
    if (!miniGameRunning || s.won) return;
    const hole = HOLES[Math.floor(Math.random() * HOLES.length)];
    s.mole = { ...hole, life: 1 };
    s.timer = setTimeout(() => {
      s.mole = null;
      spawnMole();
    }, s.interval);
  }
  spawnMole();

  function tryHit(cx, cy) {
    if (!s.mole || s.won) return;
    const dist = Math.hypot(cx - s.mole.x, cy - s.mole.y);
    if (dist < 28) {
      s.hits++;
      s.mole = null;
      clearTimeout(s.timer);
      if (s.hits >= s.needed) {
        s.won = true;
        setTimeout(() => winMiniGame(4), 1200);
        return;
      }
      s.interval = Math.max(600, s.interval - 80);
      spawnMole();
    }
  }
  mc.onclick = (e) => {
    const r = mc.getBoundingClientRect();
    tryHit(e.clientX - r.left, e.clientY - r.top);
  };
  mc.ontouchstart = (e) => {
    e.preventDefault();
    const r = mc.getBoundingClientRect(),
      t = e.touches[0];
    tryHit(t.clientX - r.left, t.clientY - r.top);
  };

  function loop() {
    if (!miniGameRunning) return;
    ctx.clearRect(0, 0, W, H);
    // Fondo cueva
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0a1a");
    bg.addColorStop(1, "#151525");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // Agujeros
    HOLES.forEach((h) => {
      ctx.fillStyle = "#050510";
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 28, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(126,242,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 28, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    // Topo
    if (s.mole) {
      const pop = Math.min(1, (Date.now() % s.interval) / 200); // pop up
      ctx.fillStyle = "rgba(126,242,255,0.1)";
      ctx.beginPath();
      ctx.ellipse(s.mole.x, s.mole.y, 32, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(s.mole.x, s.mole.y - pop * 30);
      // Cuerpo
      ctx.fillStyle = "#8B6914";
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cara
      ctx.fillStyle = "#c8a060";
      ctx.beginPath();
      ctx.ellipse(0, 4, 12, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ojos
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(-6, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(-5, -5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(7, -5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Nariz
      ctx.fillStyle = "#ff6eb4";
      ctx.beginPath();
      ctx.ellipse(0, 2, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(8, 8, W - 16, 24, 6);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Atrapados: ${"🦔".repeat(s.hits)}${"⬜".repeat(s.needed - s.hits)}`,
      W / 2,
      24,
    );
    if (s.won) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#7ef2ff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("¡Atrapaste al topo! 💎", W / 2, H / 2);
    }
    miniAF = requestAnimationFrame(loop);
  }
  miniAF = requestAnimationFrame(loop);
}

// ── Controles ─────────────────────────────────────────────────
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
  if (currentMap !== "beach") return;
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
      const t = e.changedTouches[0],
        rect = zone.getBoundingClientRect();
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
      const t = e.changedTouches[0],
        rect = zone.getBoundingClientRect();
      joystick.dx = t.clientX - rect.left - joystick.baseX;
      joystick.dy = t.clientY - rect.top - joystick.baseY;
      const mag = Math.sqrt(joystick.dx ** 2 + joystick.dy ** 2),
        maxR = 30;
      if (mag > maxR) {
        joystick.dx = (joystick.dx / mag) * maxR;
        joystick.dy = (joystick.dy / mag) * maxR;
      }
      thumb.style.transform = `translate(${joystick.dx}px,${joystick.dy}px)`;
    },
    { passive: false },
  );
  const end = () => {
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
    thumb.style.transform = "translate(0,0)";
    base.style.opacity = "0.4";
  };
  zone.addEventListener("touchend", end);
  zone.addEventListener("touchcancel", end);
}
