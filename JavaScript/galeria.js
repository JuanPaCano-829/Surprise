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

  const MEDIA = {
    1: { src: "../Assets/images/FirstBirthday.jpeg", type: "image" },
    2: { src: "../Assets/images/FirstAnniversary.jpeg", type: "image" },
    3: { src: "../Assets/images/FirstChristmas.jpeg", type: "image" },
    4: { src: "../Assets/images/LastBirthday.mp4", type: "video" },
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

      if (media.type === "video") {
        // Ocultar imagen, mostrar video
        modalImg.style.display = "none";
        modalVid.style.display = "block";

        // Cambiar fuente solo si es diferente
        if (modalSrc.src !== media.src) {
          modalSrc.src = media.src;
          modalVid.load();
        }

        modal.style.display = "flex";

        // Reproducir cuando el video esté listo
        modalVid.oncanplay = () => {
          modalVid.play().catch(() => {
            // Si falla autoplay, el usuario puede tocar play manualmente
          });
          modalVid.oncanplay = null;
        };
      } else {
        // Pausar y ocultar video si estaba activo
        modalVid.pause();
        modalVid.style.display = "none";
        modalImg.src = media.src;
        modalImg.style.display = "block";
        modal.style.display = "flex";
      }
    });
  });

  function closeModal() {
    modal.style.display = "none";
    modalVid.pause();
    modalVid.oncanplay = null;
    modalSrc.src = "";
    modalVid.style.display = "none";
    modalImg.src = "";
    modalImg.style.display = "none";
  }

  closeBtn.addEventListener("click", closeModal);
  modalBg.addEventListener("click", closeModal);
}
