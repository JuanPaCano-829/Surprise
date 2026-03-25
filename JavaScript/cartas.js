// ============================================================
//  CARTAS SELLADAS
// ============================================================
function initLetters() {
  const items   = document.querySelectorAll(".env-item");
  const modal   = document.getElementById("envModal");
  const modalBg = document.getElementById("envModalBg");
  const paper   = document.getElementById("envPaper");
  const txtEl   = document.getElementById("envPaperText");
  const sealEl  = document.getElementById("envPaperSeal");
  if (!items.length || !modal) return;

  function openModal(item) {
    txtEl.textContent  = item.getAttribute("data-text");
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
