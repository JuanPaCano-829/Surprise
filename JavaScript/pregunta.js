const noBtn = document.getElementById("noBtn"); // Obtiene una referencia al botón NO usando su id
const yesBtn = document.getElementById("yesBtn"); // Obtiene una referencia al botón SIIIIII usando su id

noBtn.addEventListener("mouseover", () => {
  // Escucha cuando el cursor entra sobre el botón NO
  const x = Math.random() * (window.innerWidth - 120); // Genera una posición horizontal aleatoria dentro del ancho visible de la ventana dejando un margen para que el botón no se salga completo
  const y = Math.random() * (window.innerHeight - 60); // Genera una posición vertical aleatoria dentro del alto visible de la ventana dejando un margen para que el botón no se salga completo

  noBtn.style.position = "absolute"; // Cambia el posicionamiento del botón para poder moverlo libremente por la pantalla
  noBtn.style.left = x + "px"; // Aplica la nueva posición horizontal en píxeles
  noBtn.style.top = y + "px"; // Aplica la nueva posición vertical en píxeles
});

yesBtn.addEventListener("click", () => {
  // Escucha cuando el usuario hace clic en el botón SIIIIII
  window.location.href = "logIn.html"; // Redirige al archivo logIn.html que está en la misma carpeta HTML
});
