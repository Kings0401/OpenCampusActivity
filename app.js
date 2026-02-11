// Reglas por opción (puedes cambiarlas)
const optionRules = {
  1: [
    { id: "minLen", label: "Mínimo 8 caracteres", test: (s) => s.length >= 8 },
    { id: "hasNumber", label: "Al menos un número (0-9)", test: (s) => /\d/.test(s) },
    { id: "hasSymbol", label: "Al menos un símbolo (!@#$...)", test: (s) => /[^A-Za-z0-9\s]/.test(s) },
    { id: "hasUpper", label: "Al menos una mayúscula (A-Z)", test: (s) => /[A-Z]/.test(s) },

  ],
  2: [
    { id: "minLen", label: "Mínimo 8 caracteres", test: (s) => s.length >= 8 },
    { id: "hasUpper", label: "Al menos una mayúscula (A-Z)", test: (s) => /[A-Z]/.test(s) },
    { id: "hasLower", label: "Al menos una minúscula (a-z)", test: (s) => /[a-z]/.test(s) },
    { id: "hasNumber", label: "Al menos un número (0-9)", test: (s) => /\d/.test(s) },
  ],
  3: [
    { id: "minLen", label: "Mínimo 8 caracteres", test: (s) => s.length >= 8 },
    { id: "hasUpper", label: "Al menos una mayúscula (A-Z)", test: (s) => /[A-Z]/.test(s) },
    { id: "hasLower", label: "Al menos una minúscula (a-z)", test: (s) => /[a-z]/.test(s) },
    { id: "hasNumber", label: "Al menos un número (0-9)", test: (s) => /\d/.test(s) },
    { id: "hasSymbol", label: "Al menos un símbolo (!@#$...)", test: (s) => /[^A-Za-z0-9\s]/.test(s) },
    { id: "noSpaces", label: "Sin espacios", test: (s) => !/\s/.test(s) },
  ],
};

const exactPasswords = {
  1: "Stitch2026*",
  2: "Bobesponja330#",
  3: "Toby12."
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
const rulesBox = document.getElementById("rulesBox");

const btnCheck = document.getElementById("btnCheck");
const btnBack = document.getElementById("btnBack");
const btnReset = document.getElementById("btnReset");

const attemptsEl = document.getElementById("attempts");
const statusEl = document.getElementById("status");
const resultBox = document.getElementById("resultBox");

// Timer helpers
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
  
}

function showValidation(opt){
  panelMenu.classList.add("hidden");
  panelValidate.classList.remove("hidden");

  activeBadge.textContent = `Opción ${opt}`;

  attempts = 0;


  resultBox.className = "result hint";
  resultBox.textContent = "Escribe la contraseña: verás los requisitos en verde/rojo.";

  pwdInput.value = "";
  pwdInput.focus();

  renderRules(opt);
  updateRulesUI(); // inicial (vacío)
}

// Checklist
function renderRules(opt){
  const rules = optionRules[opt] || [];
  rulesBox.innerHTML = rules.map(r => `
    <div class="rule-item bad" data-rule-id="${r.id}">
      <span class="rule-dot"></span>
      <span class="rule-text">${r.label}</span>
    </div>
  `).join("");
}

function getRuleStatus(password){
  const rules = optionRules[activeOption] || [];
  const status = {};
  for (const r of rules){
    status[r.id] = !!r.test(password);
  }
  return status;
}

function updateRulesUI(){
  if (!activeOption) return;
  const pwd = pwdInput.value;
  const status = getRuleStatus(pwd);

  Object.entries(status).forEach(([id, ok]) => {
    const el = rulesBox.querySelector(`[data-rule-id="${id}"]`);
    if (!el) return;
    el.classList.toggle("ok", ok);
    el.classList.toggle("bad", !ok);
  });

  // Si TODO está ok, ponemos un mensaje suave
  const allOk = Object.values(status).every(Boolean) && Object.keys(status).length > 0;
  if (allOk){
    resultBox.className = "result ok";
    resultBox.textContent = "✅ Ya cumples todos los requisitos. Presiona Validar.";
  } else {
    resultBox.className = "result hint";
    resultBox.textContent = "Sigue escribiendo hasta cumplir todos los requisitos.";
  }
}

// Core flow
function chooseOption(opt){
  activeOption = opt;

  // Reinicia/arranca timer
  stopTimer();
  resetTimerUI();
  startTimer();

  // Muestra validación
  showValidation(opt);
}

function validate(){
  if (!activeOption) return;

  attempts++;
  attemptsEl.textContent = String(attempts);

  const pwd = pwdInput.value;
  const status = getRuleStatus(pwd);
  const allRulesOk = Object.values(status).every(Boolean) && Object.keys(status).length > 0;

  const expected = exactPasswords[activeOption];
  const isExact = pwd === expected;

  if (allRulesOk && isExact) {
    stopTimer();
    statusEl.textContent = "Completado";
    resultBox.className = "result ok";
    resultBox.textContent = `✅ Correcta. Tiempo: ${timerEl.textContent}. Intentos: ${attempts}.`;
    subtext.textContent = `✅ Opción ${activeOption} completada`;
  } else {
    statusEl.textContent = "En curso";
    resultBox.className = "result bad";

    if (!allRulesOk) {
      resultBox.textContent = `❌ Aún faltan requisitos. Intento #${attempts}. Revisa los rojos.`;
    } else {
      resultBox.textContent = `❌ Cumple los requisitos, pero NO es la contraseña exacta. Intento #${attempts}.`;
    }
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
  rulesBox.innerHTML = "";

  pwdInput.value = "";
  resetTimerUI();
  showMenu();
}

// Eventos
document.querySelectorAll(".opt-card").forEach(btn => {
  btn.addEventListener("click", () => chooseOption(Number(btn.dataset.opt)));
});

btnCheck.addEventListener("click", validate);

pwdInput.addEventListener("input", updateRulesUI);
pwdInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") validate();
});

btnBack.addEventListener("click", () => {
  // Detenemos y reiniciamos todo al volver
  resetAll();
});

btnReset.addEventListener("click", resetAll);

// Inicio
resetAll();

// ✅ Modo claro / oscuro (se guarda en localStorage)
const themeToggle = document.getElementById("themeToggle");

function applyTheme(mode){
  document.body.classList.toggle("light", mode === "light");
  themeToggle.textContent = (mode === "light") ? "☀️ Modo claro" : "🌙 Modo oscuro";
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const newMode = document.body.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("theme", newMode);
  applyTheme(newMode);
});
