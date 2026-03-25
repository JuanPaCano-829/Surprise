// ============================================================
//  HOME — Sistema de partículas + Animación interactiva
// ============================================================

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

// ── Configuración general ──────────────────────────────────
const PARTICLE_COUNT = 1400;
const particleColor = "rgba(170, 150, 255, 0.75)";

let particles = [];
let spaceMode = false;
let animPlaying = false; // true cuando la animación de sticks está corriendo
let animDone = false; // true después de que terminó (no se repite)
let collectMode = false; // true cuando hay que juntar puntitos con el dedo
let collected = 0; // cuántos puntitos tocó el usuario
let collectTotal = 0;

// ── Canvas ────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width = document.documentElement.clientWidth || window.innerWidth;
  canvas.height = document.documentElement.clientHeight || window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
});

// ── Clase Partícula ───────────────────────────────────────
class Particle {
  constructor() {
    this.reset();
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.tx = this.x;
    this.ty = this.y;
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.tx = this.x;
    this.ty = this.y;
    this.size = 0.5 + Math.random() * 2.2;
    this.vx = 0;
    this.vy = 0;
    this.driftX = (Math.random() - 0.5) * 0.35;
    this.driftY = (Math.random() - 0.5) * 0.35;
    this.alpha = 0.4 + Math.random() * 0.6;
    this.alphaDx = (Math.random() - 0.5) * 0.008;
    this.inText = false;
    this.pulse = 0;
    this.pulseSpeed = 0.04 + Math.random() * 0.04;
    this.touched = false; // el usuario la tocó durante collectMode
    this.collecting = false;
  }
  update() {
    if (spaceMode) {
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
      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      this.vx += dx * 0.015;
      this.vy += dy * 0.015;
      this.vx *= 0.88;
      this.vy *= 0.88;
      this.x += this.vx;
      this.y += this.vy;
      if (this.inText) this.pulse += this.pulseSpeed;
    }
  }
  draw() {
    ctx.beginPath();
    if (spaceMode) {
      // En collect mode, las no-tocadas pulsan suavemente en cyan para invitar
      if (collectMode && !this.touched) {
        const a = 0.5 + Math.sin(Date.now() / 600 + this.alpha * 10) * 0.3;
        ctx.arc(this.x, this.y, this.size + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(126, 242, 255, ${a})`;
      } else if (this.touched) {
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(126, 242, 255, 0.2)";
      } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(170, 150, 255, ${this.alpha})`;
      }
      ctx.fill();
    } else if (this.inText) {
      const pulseFactor = 1 + Math.sin(this.pulse) * 0.25;
      const r = (1.8 + Math.random() * 0.8) * pulseFactor;
      const brightness = 0.82 + Math.sin(this.pulse) * 0.18;
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 210, 255, ${brightness})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 150, 255, ${0.12 + Math.sin(this.pulse) * 0.06})`;
      ctx.fill();
    } else {
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(140, 120, 200, 0.25)";
      ctx.fill();
    }
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

// ── Utilidad: obtener puntos de figura/texto ───────────────
function getShapePoints(drawFn, gap) {
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height;
  const offCtx = off.getContext("2d");
  drawFn(offCtx, off.width, off.height);
  const data = offCtx.getImageData(0, 0, off.width, off.height).data;
  const pts = [];
  const g = gap || 5;
  for (let y = 0; y < off.height; y += g)
    for (let x = 0; x < off.width; x += g)
      if (data[(y * off.width + x) * 4 + 3] > 128) pts.push({ x, y });
  return pts;
}

function getTextPoints(text) {
  return getShapePoints((offCtx, W, H) => {
    const maxW = W * 0.82;
    let fs = Math.min(110, Math.max(32, W / 12));
    offCtx.font = `bold ${fs}px Arial`;
    while (offCtx.measureText(text).width > maxW && fs > 20) {
      fs -= 2;
      offCtx.font = `bold ${fs}px Arial`;
    }
    offCtx.fillStyle = "white";
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(text, W / 2, H * 0.38);
  }, 5);
}

// ── Asignar targets a partículas ───────────────────────────
function assignTargets(pts, markInText) {
  spaceMode = false;
  for (let i = 0; i < particles.length; i++) {
    if (i < pts.length) {
      particles[i].tx = pts[i].x;
      particles[i].ty = pts[i].y;
      particles[i].inText = !!markInText;
      particles[i].pulse = Math.random() * Math.PI * 2;
    } else {
      particles[i].tx = Math.random() * canvas.width;
      particles[i].ty = Math.random() * canvas.height;
      particles[i].inText = false;
    }
  }
}

function scatterAll() {
  spaceMode = true;
  for (const p of particles) {
    p.driftX = (Math.random() - 0.5) * 0.35;
    p.driftY = (Math.random() - 0.5) * 0.35;
    p.inText = false;
    p.touched = false;
  }
}

// ── Ciclo de frases (estado inicial / después de animación) ──
const PHRASES = [
  "¡Feliz cumpleaños!",
  "¡Eres increíble!",
  "¡No hay nadie como tú!",
  "¡Lo estás haciendo genial!",
];
let phraseIndex = 0;
let phraseCycleId = null;

function runPhraseCycle() {
  scatterAll();
  phraseCycleId = setTimeout(() => {
    assignTargets(getTextPoints(PHRASES[phraseIndex]), true);
    phraseIndex = (phraseIndex + 1) % PHRASES.length;
    phraseCycleId = setTimeout(runPhraseCycle, 4000);
  }, 3500);
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

// ══════════════════════════════════════════════════════════
//  ANIMACIÓN — Flor + Texto "¡Feliz cumpleaños!"
//  Flujo:
//  1. collectMode: usuario junta puntitos
//  2. Puntitos forman "¡Feliz cumpleaños, Nicole!" con glow
//  3. Al mismo tiempo, flor CSS crece en pantalla
//  4. Al terminar, scatter y vuelve ciclo de frases
// ══════════════════════════════════════════════════════════

let animStep = 0;
let animTimer = null;
let hintEl = null;
let flowerEl = null; // elemento DOM de la flor

// ── Crear/destruir el elemento de la flor ─────────────────
function createFlower() {
  if (flowerEl) return;
  flowerEl = document.createElement("div");
  flowerEl.id = "homeFlower";
  flowerEl.innerHTML = `
    <div class="flowers">
      <div class="flower flower--1">
        <div class="flower__leafs flower__leafs--1">
          <div class="flower__leaf flower__leaf--1"></div>
          <div class="flower__leaf flower__leaf--2"></div>
          <div class="flower__leaf flower__leaf--3"></div>
          <div class="flower__leaf flower__leaf--4"></div>
          <div class="flower__white-circle"></div>
          <div class="flower__light flower__light--1"></div>
          <div class="flower__light flower__light--2"></div>
          <div class="flower__light flower__light--3"></div>
          <div class="flower__light flower__light--4"></div>
          <div class="flower__light flower__light--5"></div>
          <div class="flower__light flower__light--6"></div>
          <div class="flower__light flower__light--7"></div>
          <div class="flower__light flower__light--8"></div>
        </div>
        <div class="flower__line">
          <div class="flower__line__leaf flower__line__leaf--1"></div>
          <div class="flower__line__leaf flower__line__leaf--2"></div>
          <div class="flower__line__leaf flower__line__leaf--3"></div>
          <div class="flower__line__leaf flower__line__leaf--4"></div>
          <div class="flower__line__leaf flower__line__leaf--5"></div>
          <div class="flower__line__leaf flower__line__leaf--6"></div>
        </div>
      </div>
      <div class="flower flower--2">
        <div class="flower__leafs flower__leafs--2">
          <div class="flower__leaf flower__leaf--1"></div>
          <div class="flower__leaf flower__leaf--2"></div>
          <div class="flower__leaf flower__leaf--3"></div>
          <div class="flower__leaf flower__leaf--4"></div>
          <div class="flower__white-circle"></div>
          <div class="flower__light flower__light--1"></div>
          <div class="flower__light flower__light--2"></div>
          <div class="flower__light flower__light--3"></div>
          <div class="flower__light flower__light--4"></div>
          <div class="flower__light flower__light--5"></div>
          <div class="flower__light flower__light--6"></div>
          <div class="flower__light flower__light--7"></div>
          <div class="flower__light flower__light--8"></div>
        </div>
        <div class="flower__line">
          <div class="flower__line__leaf flower__line__leaf--1"></div>
          <div class="flower__line__leaf flower__line__leaf--2"></div>
          <div class="flower__line__leaf flower__line__leaf--3"></div>
          <div class="flower__line__leaf flower__line__leaf--4"></div>
        </div>
      </div>
      <div class="flower flower--3">
        <div class="flower__leafs flower__leafs--3">
          <div class="flower__leaf flower__leaf--1"></div>
          <div class="flower__leaf flower__leaf--2"></div>
          <div class="flower__leaf flower__leaf--3"></div>
          <div class="flower__leaf flower__leaf--4"></div>
          <div class="flower__white-circle"></div>
          <div class="flower__light flower__light--1"></div>
          <div class="flower__light flower__light--2"></div>
          <div class="flower__light flower__light--3"></div>
          <div class="flower__light flower__light--4"></div>
          <div class="flower__light flower__light--5"></div>
          <div class="flower__light flower__light--6"></div>
          <div class="flower__light flower__light--7"></div>
          <div class="flower__light flower__light--8"></div>
        </div>
        <div class="flower__line">
          <div class="flower__line__leaf flower__line__leaf--1"></div>
          <div class="flower__line__leaf flower__line__leaf--2"></div>
          <div class="flower__line__leaf flower__line__leaf--3"></div>
          <div class="flower__line__leaf flower__line__leaf--4"></div>
        </div>
      </div>
      <div class="growing-grass">
        <div class="flower__grass flower__grass--1">
          <div class="flower__grass--top"></div>
          <div class="flower__grass--bottom"></div>
          <div class="flower__grass__leaf flower__grass__leaf--1"></div>
          <div class="flower__grass__leaf flower__grass__leaf--2"></div>
          <div class="flower__grass__leaf flower__grass__leaf--3"></div>
          <div class="flower__grass__leaf flower__grass__leaf--4"></div>
          <div class="flower__grass__leaf flower__grass__leaf--5"></div>
          <div class="flower__grass__leaf flower__grass__leaf--6"></div>
          <div class="flower__grass__leaf flower__grass__leaf--7"></div>
          <div class="flower__grass__leaf flower__grass__leaf--8"></div>
          <div class="flower__grass__overlay"></div>
        </div>
      </div>
      <div class="growing-grass">
        <div class="flower__grass flower__grass--2">
          <div class="flower__grass--top"></div>
          <div class="flower__grass--bottom"></div>
          <div class="flower__grass__leaf flower__grass__leaf--1"></div>
          <div class="flower__grass__leaf flower__grass__leaf--2"></div>
          <div class="flower__grass__leaf flower__grass__leaf--3"></div>
          <div class="flower__grass__leaf flower__grass__leaf--4"></div>
          <div class="flower__grass__leaf flower__grass__leaf--5"></div>
          <div class="flower__grass__leaf flower__grass__leaf--6"></div>
          <div class="flower__grass__leaf flower__grass__leaf--7"></div>
          <div class="flower__grass__leaf flower__grass__leaf--8"></div>
          <div class="flower__grass__overlay"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(flowerEl);
  flowerEl.getBoundingClientRect(); // force reflow
  flowerEl.classList.add("flower-bloom");
}
function removeFlower() {
  if (!flowerEl) return;
  flowerEl.classList.remove("flower-bloom");
  flowerEl.classList.add("flower-fade");
  setTimeout(() => {
    if (flowerEl) {
      flowerEl.remove();
      flowerEl = null;
    }
  }, 800);
}

// ── Secuencia de animación ─────────────────────────────────
// Paso 1: texto principal con glow
// Paso 2: segunda línea
// Paso 3: dispersar y terminar
const ANIM_TEXTS = ["¡Feliz cumpleaños,", "Nicole! 🎂"];
const ANIM_DELAYS = [3500, 3500];

function runAnimStep() {
  if (animStep >= ANIM_TEXTS.length) {
    // Fin — quitar flor, dispersar puntos
    removeFlower();
    setTimeout(() => {
      animPlaying = false;
      animDone = true;
      scatterAll();
      setTimeout(() => startPhraseCycle(), 1800);
    }, 900);
    return;
  }
  assignTargets(getTextPoints(ANIM_TEXTS[animStep]), true);
  animTimer = setTimeout(() => {
    animStep++;
    runAnimStep();
  }, ANIM_DELAYS[animStep]);
}

function startAnimation() {
  stopPhraseCycle();
  collectMode = false;
  animPlaying = true;
  animStep = 0;
  if (hintEl) hintEl.style.display = "none";
  // Crear la flor y esperar un poco antes de empezar el texto
  scatterAll();
  setTimeout(() => {
    createFlower();
    setTimeout(runAnimStep, 1200);
  }, 400);
}
// ── Collect mode: juntar puntitos con cursor/dedo ──────────
const COLLECT_RADIUS = 45; // Radio de detección
const COLLECT_NEEDED = 0.72; // 72% de partículas tocadas para activar

function onPointerMove(clientX, clientY) {
  if (!collectMode || animPlaying || animDone) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (clientX - rect.left) * (canvas.width / rect.width);
  const my = (clientY - rect.top) * (canvas.height / rect.height);
  let newTouches = 0;
  for (const p of particles) {
    if (!p.touched && Math.hypot(p.x - mx, p.y - my) < COLLECT_RADIUS) {
      p.touched = true;
      newTouches++;
      collected++;
    }
  }
  if (newTouches > 0) {
    const pct = collected / collectTotal;
    if (hintEl) {
      hintEl.textContent =
        pct < 0.4
          ? "¡Sigue juntando! ✨"
          : pct < 0.7
            ? "¡Casi! ✨"
            : "¡Ya casi todos! ✨";
    }
    if (pct >= COLLECT_NEEDED) {
      startAnimation();
    }
  }
}

function enterCollectMode() {
  if (animPlaying || animDone) return;
  collectMode = true;
  collected = 0;
  collectTotal = particles.length;
  // Resetar touched
  for (const p of particles) p.touched = false;
  scatterAll();
  if (hintEl) {
    hintEl.textContent = "Pasa el cursor (o el dedo) por los puntos ✨";
    hintEl.style.display = "block";
  }
}

// ── Loop de animación ──────────────────────────────────────
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const homeActive = document
    .getElementById("homeScreen")
    .classList.contains("active");
  if (homeActive) {
    for (const p of particles) {
      p.update();
      p.draw();
    }
  }
  requestAnimationFrame(animate);
}
animate();

// ── Eventos de puntero ─────────────────────────────────────
canvas.addEventListener("mousemove", (e) =>
  onPointerMove(e.clientX, e.clientY),
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: false },
);

// Click en el canvas cuando no hay animación activa → entrar en collect mode
canvas.addEventListener("click", () => {
  if (!animPlaying && !collectMode && !animDone) enterCollectMode();
});
canvas.addEventListener(
  "touchstart",
  (e) => {
    if (!animPlaying && !collectMode && !animDone) {
      e.preventDefault();
      enterCollectMode();
    }
  },
  { passive: false },
);

// ── API pública para menu.js ───────────────────────────────
const homeModule = {
  init() {
    initParticles();
    hintEl = document.getElementById("homeHint");
    resizeCanvas();
    document.body.classList.add("home-active");
    startPhraseCycle();
  },
  onEnter() {
    resizeCanvas();
    document.body.classList.add("home-active");
    if (!animDone && !animPlaying && !collectMode) {
      startPhraseCycle();
    }
  },
  onLeave() {
    document.body.classList.remove("home-active");
    stopPhraseCycle();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
};
