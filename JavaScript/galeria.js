// ============================================================
//  PINTURA INTERACTIVA — Encuentra los números escondidos
// ============================================================
function initGallery() {
  const nums = document.querySelectorAll(".hidden-number");
  const modal = document.getElementById("paintingModal");
  const modalBg = document.getElementById("paintingModalBg");
  const modalImg = document.getElementById("paintingModalImg");
  const modalVid = document.getElementById("paintingModalVideo");
  const modalSrc = document.getElementById("paintingModalVideoSrc");
  const closeBtn = document.getElementById("paintingModalClose");
  const counter = document.getElementById("paintingFound");
  if (!nums.length) return;

  // Rutas de los archivos en Assets/images/
  const MEDIA = {
    1: {
      src: "../Assets/images/FirstBirthday.jpeg",
      type: "image",
      label: "Primer cumpleaños 🎂",
    },
    2: {
      src: "../Assets/images/FirstAnniversary.jpeg",
      type: "image",
      label: "Primer aniversario 💕",
    },
    3: {
      src: "../Assets/images/FirstChristmas.jpeg",
      type: "image",
      label: "Primera navidad 🎄",
    },
    4: {
      src: "../Assets/images/LastBirthday.mp4",
      type: "video",
      label: "Último cumpleaños 🎉",
    },
  };

  let found = new Set();

  nums.forEach((el) => {
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
      const media = MEDIA[num];
      if (!media) return;

      // Marcar como encontrado
      if (!found.has(num)) {
        found.add(num);
        counter.textContent = found.size;
        el.style.opacity = "0.85";
        el.style.fill = "#7ef2ff";
      }

      // Mostrar imagen o video según el tipo
      if (media.type === "video") {
        modalImg.style.display = "none";
        modalSrc.src = media.src;
        modalVid.load();
        modalVid.style.display = "block";
      } else {
        modalVid.pause();
        modalVid.style.display = "none";
        modalImg.src = media.src;
        modalImg.style.display = "block";
      }

      modal.style.display = "flex";
    });
  });

  function closeModal() {
    modal.style.display = "none";
    modalImg.src = "";
    modalImg.style.display = "none";
    modalVid.pause();
    modalSrc.src = "";
    modalVid.style.display = "none";
  }

  closeBtn.addEventListener("click", closeModal);
  modalBg.addEventListener("click", closeModal);
}
