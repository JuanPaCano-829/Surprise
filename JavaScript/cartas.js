// ============================================================
//  CARRUSEL 3D DE SOBRES + Animación de apertura
// ============================================================
function initLetters() {
  const carousel = document.getElementById("envCarousel");
  const prevBtn = document.getElementById("envPrev");
  const nextBtn = document.getElementById("envNext");
  const modal = document.getElementById("envModal");
  const modalBg = document.getElementById("envModalBg");
  const envelope = document.getElementById("envEnvelope");
  const txtEl = document.getElementById("envPaperText");
  const sealEl = document.getElementById("envPaperSeal");
  const closeBtn = document.getElementById("envCloseBtn");
  const items = document.querySelectorAll(".env-carousel-item");
  if (!carousel || !items.length) return;

  const TOTAL = items.length;
  const STEP = 360 / TOTAL;
  let rotation = 0;
  let autoTimer = null;

  // ── Rotación del carrusel ────────────────────────────────
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
  function scheduleAuto() {
    autoTimer = setTimeout(() => {
      rotateTo(rotation - STEP);
      scheduleAuto();
    }, 3000);
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  function getFrontIndex() {
    const normalized = ((rotation % 360) + 360) % 360;
    const front = Math.round(normalized / STEP) % TOTAL;
    return (TOTAL - front) % TOTAL;
  }

  // ── Clic en sobre del carrusel ───────────────────────────
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const front = getFrontIndex();
      const itemIdx = parseInt(item.getAttribute("data-index"));
      if (itemIdx !== front) {
        // Girar hacia él
        clearTimeout(autoTimer);
        const diff = itemIdx - front;
        rotateTo(rotation - diff * STEP);
        scheduleAuto();
        return;
      }
      openModal(item);
    });
  });

  // Swipe
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

  // ── Abrir modal con animación ────────────────────────────
  function openModal(item) {
    clearTimeout(autoTimer);
    txtEl.textContent = item.getAttribute("data-text");
    sealEl.textContent = item.getAttribute("data-seal");
    modal.setAttribute("data-index", item.getAttribute("data-index"));

    // Resetear a cerrado
    envelope.className = "env-closed";
    modal.style.display = "flex";

    // Disparar apertura con un pequeño delay para que el CSS se aplique
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        envelope.classList.remove("env-closed");
        envelope.classList.add("env-open");
      });
    });
  }

  // ── Cerrar modal ─────────────────────────────────────────
  function closeModal() {
    // Cerrar con animación
    envelope.classList.remove("env-open");
    envelope.classList.add("env-closed");
    setTimeout(() => {
      modal.style.display = "none";
      scheduleAuto();
    }, 500);
  }

  closeBtn.addEventListener("click", closeModal);
  modalBg.addEventListener("click", closeModal);

  // Arrancar
  rotateTo(0);
  scheduleAuto();
}
