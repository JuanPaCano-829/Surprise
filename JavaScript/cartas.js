// ============================================================
//  CARRUSEL 3D DE SOBRES
// ============================================================
function initLetters() {
  const carousel = document.getElementById("envCarousel");
  const prevBtn = document.getElementById("envPrev");
  const nextBtn = document.getElementById("envNext");
  const modal = document.getElementById("envModal");
  const modalBg = document.getElementById("envModalBg");
  const paper = document.getElementById("envPaper");
  const txtEl = document.getElementById("envPaperText");
  const sealEl = document.getElementById("envPaperSeal");
  const items = document.querySelectorAll(".env-carousel-item");
  if (!carousel || !items.length) return;

  const TOTAL = items.length;
  const STEP = 360 / TOTAL; // 72° entre sobres
  let rotation = 0;
  let autoTimer = null;

  // ── Rotación ────────────────────────────────────────────
  function rotateTo(deg) {
    rotation = deg;
    carousel.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
  }

  function goNext() {
    clearTimeout(autoTimer);
    rotateTo(rotation - STEP);
    scheduleAuto();
  }

  function goPrev() {
    clearTimeout(autoTimer);
    rotateTo(rotation + STEP);
    scheduleAuto();
  }

  // Auto-rotate cada 3s
  function scheduleAuto() {
    autoTimer = setTimeout(() => {
      rotateTo(rotation - STEP);
      scheduleAuto();
    }, 3000);
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  // ── Detectar cuál sobre está al frente ──────────────────
  function getFrontIndex() {
    // El sobre al frente es el que tiene el ángulo más cercano a 0° (mod 360)
    const normalized = ((rotation % 360) + 360) % 360;
    const front = Math.round(normalized / STEP) % TOTAL;
    return (TOTAL - front) % TOTAL;
  }

  // ── Abrir sobre al hacer clic ───────────────────────────
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const front = getFrontIndex();
      const itemIdx = parseInt(item.getAttribute("data-index"));
      // Solo abrir si es el que está al frente
      if (itemIdx !== front) {
        // Rotar hacia ese sobre
        clearTimeout(autoTimer);
        const diff = itemIdx - front;
        rotateTo(rotation - diff * STEP);
        scheduleAuto();
        return;
      }
      // Abrir modal
      txtEl.textContent = item.getAttribute("data-text");
      sealEl.textContent = item.getAttribute("data-seal");
      modal.setAttribute("data-index", item.getAttribute("data-index"));
      paper.style.transform = "translateY(0%)";
      modal.style.display = "flex";
      clearTimeout(autoTimer);
    });
  });

  // ── Swipe táctil ────────────────────────────────────────
  let touchStartX = 0;
  carousel.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  carousel.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 35) dx < 0 ? goNext() : goPrev();
    },
    { passive: true },
  );

  // ── Cerrar modal ────────────────────────────────────────
  function closeModal() {
    modal.style.display = "none";
    scheduleAuto();
  }
  modalBg.addEventListener("click", closeModal);

  // Arrancar
  rotateTo(0);
  scheduleAuto();
}
