// Demo: contraseñas por opción (cámbialas)
const passwords = {
  1: "ClaveUno_123",
  2: "OtraClave#2026",
  3: "MiClaveFinal!"
};

// Estado
let activeOption = null;
let attempts = 0;

// Timer
let running = false;
let startTime = 0;
let rafId = null;

// DOM
const timerEl = document.getElementById("timer");
const subtext = document.getElementById("subtext");

const panelMenu = document.getElementById("panelMenu");
const panelValidate = document.getElementById("panelValidate");

const activeBadge = document.getElementById("activeBadge");
const pwdInput = document.getElementById("pwd");
const btnCheck = document.getElementById("btnCheck");
const btnBack = document.getElementById("btnBack");
const btnReset = document.getElementById("btnReset");

const attemptsEl = document.getElementById("attempts");
const statusEl = document.getElementById("status");
const resultBox = document.getElementById("resultBox");

// Helpers
function formatTime(ms) {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const cent = Math.floor((total % 1000) / 10);

  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(cent).padStart(2,"0")}`;
}

function tick(){
  if (!running) return;
  timerEl.textContent = formatTime(performance.now() - startTime);
  rafId = requestAnimationFrame(tick);
}

function startTimer(){
  running = true;
  startTime = performance.now();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function stopTimer(){
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

function resetTimerUI(){
  timerEl.textContent = "00:00.00";
}

// UI transitions
function showMenu(){
  panelValidate.classList.add("hidden");
  panelMenu.classList.remove("hidden");
  subtext.textContent = "Elige una opción para empezar";
}

function showValidation(opt){
  panelMenu.classList.add("hidden");
  panelValidate.classList.remove("hidden");

  activeBadge.textContent = `Opción ${opt}`;
  subtext.textContent = `Validando: Opción ${opt} (cronómetro corriendo)`;

  attempts = 0;
  attemptsEl.textContent = "0";
  statusEl.textContent = "En curso";

  resultBox.className = "result hint";
  resultBox.textContent = "Escribe la contraseña y presiona Validar.";

  pwdInput.value = "";
  pwdInput.focus();
}

// Core flow
function chooseOption(opt){
  activeOption = opt;

  // Reinicia/arranca timer
  stopTimer();
  resetTimerUI();
  startTimer();

  // Muestra pantalla de validación
  showValidation(opt);
}

function validate(){
  if (!activeOption) return;

  attempts++;
  attemptsEl.textContent = String(attempts);

  const typed = pwdInput.value;
  const expected = passwords[activeOption];

  if (typed === expected){
    stopTimer();
    statusEl.textContent = "Completado";
    resultBox.className = "result ok";
    resultBox.textContent = `✅ Correcta. Tiempo: ${timerEl.textContent}. Intentos: ${attempts}.`;
    subtext.textContent = `✅ Opción ${activeOption} completada`;
  } else {
    resultBox.className = "result bad";
    resultBox.textContent = `❌ Incorrecta. Intento #${attempts}.`;
  }
}

function resetAll(){
  stopTimer();
  activeOption = null;
  attempts = 0;
  attemptsEl.textContent = "0";
  statusEl.textContent = "En espera";
  resultBox.className = "result";
  resultBox.textContent = "Aquí verás el resultado.";
  resetTimerUI();
  showMenu();
}

// Eventos
document.querySelectorAll(".opt-card").forEach(btn => {
  btn.addEventListener("click", () => chooseOption(Number(btn.dataset.opt)));
});

btnCheck.addEventListener("click", validate);
pwdInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") validate();
});

btnBack.addEventListener("click", () => {
  // Volver al menú NO reinicia el timer automáticamente; lo detenemos para que no siga corriendo "sin opción"
  stopTimer();
  resetTimerUI();
  resetAll();
});

btnReset.addEventListener("click", resetAll);

// Inicio
resetAll();
