// ============================================================
//  Selección de elementos
// ============================================================
var startBtn = document.querySelector(".startBtn"),
  moveText = document.querySelector(".moveText"),
  marioFlat = document.querySelector(".marioFlat"),
  mario = document.querySelector(".mario"),
  coin = document.querySelectorAll(".coin"),
  qbox = document.querySelectorAll(".qbox"),
  mushroom = document.querySelector(".mushroom"),
  goombaDies = document.querySelectorAll(".enemy-dies"),
  enemy4 = document.querySelector(".enemy4"),
  enemy7 = document.querySelector(".enemy7");

// ============================================================
//  Audio — se declara ANTES de usarlo
// ============================================================
var audioUtil = new Audio(),
  canPlayMP3 =
    !!audioUtil.canPlayType && audioUtil.canPlayType("audio/mp3") !== "";

function createAudio(audioFile, loopSet) {
  var a = new Audio();
  var ext = canPlayMP3 ? ".mp3" : ".ogg";
  a.src = audioFile + ext;
  a.preload = "auto";
  a.loop = !!loopSet;
  return a;
}

var audioSelectTheme = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3-world-map",
    true,
  ),
  audioWorldTheme = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3-overworld-1",
    true,
  ),
  audioNewWorld = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_map_new_world",
  ),
  mapTravel = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_map_travel",
  ),
  levelBegin = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_enter_level",
  ),
  audioMarioJump = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_jump",
  ),
  audioFlight = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_pmeter",
  ),
  audioCoin = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_coin",
  ),
  audioBump = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_bump",
  ),
  audioStomp = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_stomp",
  ),
  audioKick = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_kick",
  ),
  audioTailSpin = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_tail",
  ),
  audioMushroom = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_mushroom_appears",
  ),
  audioPowerUp = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_power-up",
  ),
  audioRacoon = createAudio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/12207/smb3_raccoon_transform",
  );

function playStompSound() {
  if (!audioStomp.paused) {
    audioStomp.currentTime = 0.01;
  } else {
    audioStomp.play();
  }
}

function moveTextToggle(state) {
  if (!moveText) return;
  moveText.style.display = state === "hide" ? "none" : "block";
}

// ============================================================
//  Autoplay del tema (se activa en primer clic)
// ============================================================
window.addEventListener(
  "click",
  function () {
    if (audioSelectTheme.paused) audioSelectTheme.play();
  },
  { once: true },
);

// ============================================================
//  Botón START
// ============================================================
if (startBtn) {
  startBtn.addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      var textBox = document.getElementById("textBox");
      var levelSelect = document.getElementById("levelSelect");
      if (textBox) textBox.classList.add("fade");
      try {
        audioNewWorld.play();
      } catch (err) {}
      if (levelSelect) levelSelect.className = "startScreen";
    },
    false,
  );
}

// ============================================================
//  Mario del mapa
// ============================================================
marioFlat.addEventListener("animationstart", function () {
  try {
    mapTravel.play();
    window.setTimeout(function () {
      mapTravel.currentTime = 0.01;
    }, 200);
  } catch (err) {}
});

marioFlat.addEventListener("animationend", function () {
  try {
    levelBegin.play();
  } catch (err) {}
  try {
    audioSelectTheme.pause();
  } catch (err) {}
  document.getElementById("levelSelect").classList.add("fadeScreen");

  window.setTimeout(function () {
    try {
      audioWorldTheme.play();
    } catch (err) {}
  }, 300);

  window.setTimeout(function () {
    document.getElementById("mainScene").classList.add("startAnim");
  }, 1000);
});

// ============================================================
//  Goombas que mueren
// ============================================================
goombaDies.forEach(function (enemy) {
  enemy.addEventListener("animationend", function () {
    playStompSound();
  });
});

// ============================================================
//  Tortuga (enemy4)
// ============================================================
if (enemy4) {
  enemy4.addEventListener("animationend", function (e) {
    if (e.animationName !== "turtle-hit-qbox") playStompSound();
  });
  enemy4.addEventListener("animationstart", function () {
    try {
      audioKick.play();
    } catch (err) {}
  });
}

// ============================================================
//  Goomba alado (enemy7)
// ============================================================
if (enemy7) {
  enemy7.addEventListener("animationstart", function (e) {
    if (e.animationName === "enemy-seventh") {
      window.setTimeout(function () {
        playStompSound();
      }, 1800);
    } else if (e.animationName === "enemy-seventh-dead") {
      try {
        audioTailSpin.play();
      } catch (err) {}
    }
  });
}

// ============================================================
//  Monedas
// ============================================================
coin.forEach(function (c) {
  c.addEventListener("animationstart", function () {
    try {
      if (!audioCoin.paused) {
        audioCoin.currentTime = 0.01;
      } else {
        audioCoin.play();
      }
    } catch (err) {}
  });
});

// ============================================================
//  Bloques (qbox)
// ============================================================
qbox.forEach(function (box) {
  box.addEventListener("animationstart", function () {
    try {
      if (!audioBump.paused) {
        audioBump.currentTime = 0.01;
      } else {
        audioBump.play();
      }
    } catch (err) {}
  });
});

// ============================================================
//  Champiñón
// ============================================================
if (mushroom) {
  mushroom.addEventListener("animationstart", function () {
    try {
      audioMushroom.play();
    } catch (err) {}
  });
}

// ============================================================
//  Mario – animationstart
// ============================================================
mario.addEventListener("animationstart", function (e) {
  switch (e.animationName) {
    case "mario-jump-first":
    case "mario-jump-third":
    case "mario-jump-qbox":
    case "mario-jump-fourth":
    case "mario-jump-fifth":
    case "mario-jump-sixth":
      moveTextToggle("hide");
      try {
        audioMarioJump.play();
      } catch (err) {}
      break;
    case "mario-jump-second":
      moveTextToggle("hide");
      try {
        audioMarioJump.play();
        window.setTimeout(function () {
          audioMarioJump.currentTime = 0.01;
        }, 370);
      } catch (err) {}
      break;
    case "mario-grow":
      try {
        audioPowerUp.play();
      } catch (err) {}
      break;
    case "mario-racoon-change":
      try {
        audioRacoon.play();
      } catch (err) {}
      break;
    case "mario-flight-sprite":
      window.setTimeout(function () {
        try {
          audioFlight.play();
        } catch (err) {}
      }, 400);
      break;
    case "mario-run-second":
    case "mario-sprite-jump-fourth":
    case "mario-kick-shell":
    case "mario-sprint":
      moveTextToggle("hide");
      break;
  }
});

// ============================================================
//  Mario – animationend
// ============================================================
mario.addEventListener("animationend", function (e) {
  switch (e.animationName) {
    case "mario-jump-first":
    case "mario-grow":
    case "mario-jump-qbox":
    case "mario-turtle-hit":
    case "mario-racoon-change":
    case "mario-jump-seventh":
      moveTextToggle("show");
      break;
  }
});
