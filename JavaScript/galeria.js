// ============================================================
//  GALERÍA POLAROID
// ============================================================
function initGallery() {
  const polaroids = document.querySelectorAll(".polaroid");
  const prevBtn   = document.getElementById("prevBtn");
  const nextBtn   = document.getElementById("nextBtn");
  const dotsEl    = document.getElementById("galleryDots");
  const track     = document.getElementById("polaroidTrack");
  if (!polaroids.length) return;

  let current = 0;
  const total = polaroids.length;

  polaroids.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "gallery-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    polaroids[current].classList.remove("active");
    dotsEl.children[current].classList.remove("active");
    current = (idx + total) % total;
    polaroids[current].classList.add("active");
    dotsEl.children[current].classList.add("active");
  }

  polaroids[0].classList.add("active");
  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend",   (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });
}
