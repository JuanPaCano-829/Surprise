// ============================================================
//  PINTURA INTERACTIVA — Encuentra los números escondidos
// ============================================================
function initGallery() {
  const nums = document.querySelectorAll(".hidden-number");
  const modal = document.getElementById("paintingModal");
  const modalBg = document.getElementById("paintingModalBg");
  const modalImg = document.getElementById("paintingModalImg");
  const closeBtn = document.getElementById("paintingModalClose");
  const counter = document.getElementById("paintingFound");
  if (!nums.length) return;

  // Imágenes que se abren — reemplaza estas rutas con tus fotos reales
  const PHOTOS = {
    1: "../Assets/pintura.webp",
    2: "../Assets/pintura.webp",
    3: "../Assets/pintura.webp",
    4: "../Assets/pintura.webp",
  };

  let found = new Set();

  nums.forEach((el) => {
    // Efecto hover sutil — el número brilla un poco
    el.addEventListener("mouseenter", () => {
      el.style.opacity = "0.9";
      el.style.fontSize = parseFloat(el.getAttribute("font-size")) + 2 + "px";
    });
    el.addEventListener("mouseleave", () => {
      if (!found.has(el.dataset.num)) {
        el.style.opacity = "";
        el.style.fontSize = "";
      }
    });

    el.addEventListener("click", () => {
      const num = el.dataset.num;
      const src = PHOTOS[num];
      if (!src) return;

      // Marcar como encontrado
      if (!found.has(num)) {
        found.add(num);
        counter.textContent = found.size;
        // El número queda ligeramente visible como "encontrado"
        el.style.opacity = "0.85";
        el.style.fill = "#7ef2ff";
      }

      // Abrir modal con la foto
      modalImg.src = src;
      modal.style.display = "flex";
    });
  });

  function closeModal() {
    modal.style.display = "none";
    modalImg.src = "";
  }

  closeBtn.addEventListener("click", closeModal);
  modalBg.addEventListener("click", closeModal);
}
