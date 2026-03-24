import { validarLogin } from "../Backend/server.js"; // Importa la función validarLogin desde tu archivo en Backend

const loginCard = document.getElementById("loginCard"); // Guarda una referencia a la tarjeta completa del login para poder abrirla o cerrarla
const openLoginBtn = document.getElementById("openLoginBtn"); // Guarda el botón visible en el estado compacto para abrir el formulario
const closeLoginBtn = document.getElementById("closeLoginBtn"); // Guarda el botón que cierra el formulario cuando está abierto
const loginForm = document.getElementById("loginForm"); // Guarda el formulario para detectar el submit
const usernameInput = document.getElementById("username"); // Guarda el input de username para leer su valor
const passwordInput = document.getElementById("password"); // Guarda el input de password para leer su valor
const loginMessage = document.getElementById("loginMessage"); // Guarda el párrafo donde se mostrarán errores o mensajes al usuario
const signUpLink = document.getElementById("signUpLink"); // Guarda el link de sign up para controlar su comportamiento sin navegar

function openLogin() {
  loginCard.classList.add("active"); // Agrega la clase active para abrir visualmente la tarjeta
  setTimeout(() => usernameInput.focus(), 260); // Espera un poco a que termine la animación y pone el cursor en username
} // Abre la tarjeta agregando la clase active y pone el cursor en el primer input después de la animación

function closeLogin() {
  loginCard.classList.remove("active"); // Quita la clase active para cerrar la tarjeta
  loginMessage.textContent = ""; // Limpia cualquier mensaje anterior
  loginForm.reset(); // Vacía los campos del formulario
} // Cierra la tarjeta, limpia mensajes y vacía los campos del formulario

openLoginBtn.addEventListener("click", openLogin); // Cuando el usuario hace clic en el botón compacto se abre el login
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
