// ============================================================
//  MENÚ PRINCIPAL — Navegación, indicador, logros
// ============================================================
const list      = document.querySelectorAll(".list");
const indicator = document.querySelector(".indicator");
const screens   = document.querySelectorAll(".screen");

function showScreen(screenId) {
  screens.forEach((s) => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  if (screenId === "homeScreen") {
    homeModule.onEnter();
  } else {
    homeModule.onLeave();
  }
}

function activeLink() {
  list.forEach((item) => item.classList.remove("active"));
  this.classList.add("active");
  const leftPosition = this.offsetLeft + this.offsetWidth / 2 - indicator.offsetWidth / 2;
  indicator.style.left = `${leftPosition}px`;
  showScreen(this.getAttribute("data-screen"));
}
list.forEach((item) => item.addEventListener("click", activeLink));

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

window.addEventListener("load", () => {
  const activeItem = document.querySelector(".list.active");
  if (activeItem) {
    const leftPosition = activeItem.offsetLeft + activeItem.offsetWidth / 2 - indicator.offsetWidth / 2;
    indicator.style.left = `${leftPosition}px`;
  }
  buildCalendarGame();
  initLetters();
  initGallery();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      homeModule.init();
    });
  });
});
