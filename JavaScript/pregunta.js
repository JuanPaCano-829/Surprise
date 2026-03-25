const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");

function moveNoBtn() {
  const margin = 80;
  const x = Math.random() * (window.innerWidth - margin);
  const y = Math.random() * (window.innerHeight - margin);
  noBtn.style.position = "absolute";
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

// Desktop: mouseover
noBtn.addEventListener("mouseover", moveNoBtn);
// Móvil: touchstart (antes de que el tap cuente como click)
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoBtn();
}, { passive: false });

yesBtn.addEventListener("click", () => {
  window.location.href = "logIn.html";
});
