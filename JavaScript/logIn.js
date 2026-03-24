import { validarLogin } from "../Backend/server.js"; // Importa la función validarLogin desde tu archivo en Backend

const loginCard = document.getElementById("loginCard"); // Guarda una referencia a la tarjeta completa del login para poder abrirla o cerrarla
const closeLoginBtn = document.getElementById("closeLoginBtn"); // Guarda el botón que cierra el formulario cuando está abierto
const loginForm = document.getElementById("loginForm"); // Guarda el formulario para detectar el submit
const usernameInput = document.getElementById("username"); // Guarda el input de username para leer su valor
const passwordInput = document.getElementById("password"); // Guarda el input de password para leer su valor
const loginMessage = document.getElementById("loginMessage"); // Guarda el párrafo donde se mostrarán errores o mensajes al usuario
const signUpLink = document.getElementById("signUpLink"); // Guarda el link de sign up para controlar su comportamiento sin navegar

// --- REFERENCIAS DEL DESLIZADOR ---
const swipeHandle = document.getElementById("swipeHandle");
const swipeTrack = document.getElementById("swipeTrack");
const swipeText = document.getElementById("swipeText");

let isDragging = false;
let startX;
let currentTranslate = 0;

const trackWidth = 280; // Ancho total del riel
const handleWidth = 56; // Ancho del botón + su margen
const maxSlide = trackWidth - handleWidth; // Máxima distancia que puede recorrer
const unlockThreshold = maxSlide * 0.85; // Se abre al llegar al 85% del recorrido

// --- EVENTOS DEL DESLIZADOR ---
swipeHandle.addEventListener("mousedown", dragStart);
swipeHandle.addEventListener("touchstart", dragStart, { passive: true });

window.addEventListener("mousemove", drag);
window.addEventListener("touchmove", drag, { passive: false });

window.addEventListener("mouseup", dragEnd);
window.addEventListener("touchend", dragEnd);

function dragStart(e) {
  isDragging = true;
  startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  swipeHandle.style.transition = "none";
  swipeText.style.transition = "none";
} // Detecta el inicio del arrastre

function drag(e) {
  if (!isDragging) return;

  if (e.type.includes("touch")) {
    e.preventDefault();
  }

  const currentPosition = e.type.includes("mouse")
    ? e.clientX
    : e.touches[0].clientX;
  const movement = currentPosition - startX;

  currentTranslate = Math.max(0, Math.min(maxSlide, movement));
  swipeHandle.style.transform = `translateX(${currentTranslate}px)`;
  swipeText.style.opacity = 1 - currentTranslate / maxSlide;
} // Detecta el movimiento mientras se arrastra

function dragEnd() {
  if (!isDragging) return;
  isDragging = false;

  swipeHandle.style.transition = "transform 0.3s ease";
  swipeText.style.transition = "opacity 0.3s ease";

  if (currentTranslate >= unlockThreshold) {
    // Si llegó al final, abre el login
    swipeHandle.style.transform = `translateX(${maxSlide}px)`;
    swipeText.style.opacity = 0;

    setTimeout(() => {
      openLogin();
    }, 200);
  } else {
    // Si no llegó, regresa al inicio
    swipeHandle.style.transform = "translateX(0px)";
    swipeText.style.opacity = 1;
    currentTranslate = 0;
  }
} // Detecta cuando se suelta el arrastre y decide si abre o rebota

// --- FUNCIONES DE APERTURA Y CIERRE ---
function openLogin() {
  loginCard.classList.add("active"); // Agrega la clase active para abrir visualmente la tarjeta
  setTimeout(() => usernameInput.focus(), 260); // Espera un poco a que termine la animación y pone el cursor en username
} // Abre la tarjeta agregando la clase active y pone el cursor en el primer input después de la animación

function closeLogin() {
  loginCard.classList.remove("active"); // Quita la clase active para cerrar la tarjeta
  loginMessage.textContent = ""; // Limpia cualquier mensaje anterior
  loginForm.reset(); // Vacía los campos del formulario

  // Resetea el deslizador a su posición original al cerrar
  setTimeout(() => {
    swipeHandle.style.transform = "translateX(0px)";
    swipeText.style.opacity = 1;
    currentTranslate = 0;
  }, 400);
} // Cierra la tarjeta, limpia mensajes, vacía campos y resetea el deslizador

closeLoginBtn.addEventListener("click", closeLogin); // Cuando el usuario hace clic en la X el login vuelve al estado cerrado

loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita que el formulario recargue la página

  const username = usernameInput.value.trim(); // Obtiene el valor del username sin espacios sobrantes
  const password = passwordInput.value.trim(); // Obtiene el valor del password sin espacios sobrantes

  if (username === "" || password === "") {
    loginMessage.style.color = "#ff8dad"; // Pone el mensaje en color rosa de error
    loginMessage.textContent = "Completa todos los campos"; // Muestra mensaje si falta información
    return; // Detiene la ejecución si hay campos vacíos
  }

  const accesoPermitido = validarLogin(username, password); // Llama a la función importada desde Backend para validar las credenciales

  if (accesoPermitido) {
    loginMessage.style.color = "#8ff7c2"; // Cambia el mensaje a color verde de éxito
    loginMessage.textContent = "Entrando..."; // Muestra mensaje de acceso correcto

    setTimeout(() => {
      window.location.href = "menuPrincipal.html"; // Redirige al menú principal si usuario y contraseña son correctos
    }, 800); // Espera 800 ms antes de redirigir
  } else {
    loginMessage.style.color = "#ff8dad"; // Pone el mensaje en color rosa de error
    loginMessage.textContent = "Usuario o contraseña incorrectos"; // Muestra mensaje de credenciales inválidas
  }
}); // Maneja el envío del formulario de login

signUpLink.addEventListener("click", (event) => {
  event.preventDefault(); // Evita que el link recargue o navegue a otra página
  loginMessage.style.color = "#ff8dad"; // Cambia el color del mensaje a rosa
  loginMessage.textContent =
    "Lo siento el registro ya se hizo el 25 de abril del 2023"; // Muestra el mensaje personalizado al dar clic en Sign up
}); // Controla el clic sobre el enlace Sign up

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && loginCard.classList.contains("active")) {
    closeLogin(); // Cierra el login si el usuario presiona Escape y la tarjeta está abierta
  }
}); // Permite cerrar la tarjeta presionando Escape cuando está abierta
