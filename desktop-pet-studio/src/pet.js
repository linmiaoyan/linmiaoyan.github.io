const pet = document.querySelector("#pet");
const petShell = document.querySelector("#pet-shell");
const speech = document.querySelector("#speech");
const openControl = document.querySelector("#open-control");
const quickActions = document.querySelectorAll("[data-action]");

let settings = {};
let dragState = null;
let speechTimer;
let actionTimer;

const messages = {
  idle: "我在这里陪你",
  wave: "你好呀",
  sleep: "我先休息一会儿",
  surprise: "哇，被抓住了",
  dragged: "抓到我啦"
};

function setPetSize(size) {
  document.documentElement.style.setProperty("--pet-size", `${size}px`);
}

function showSpeech(text, duration = 1600) {
  speech.textContent = text;
  speech.hidden = false;
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => {
    speech.hidden = true;
  }, duration);
}

function setAction(action, duration = 1200) {
  pet.classList.remove("wave", "sleep", "surprise");
  clearTimeout(actionTimer);

  if (action === "idle") return;
  pet.classList.add(action);
  showSpeech(messages[action] || messages.idle);

  if (action !== "sleep") {
    actionTimer = setTimeout(() => {
      pet.classList.remove(action);
    }, duration);
  }
}

function startDrag(event) {
  if (!settings.catchModeEnabled || event.button !== 0) return;

  const rect = petShell.getBoundingClientRect();
  dragState = {
    offsetX: event.clientX + rect.left,
    offsetY: event.clientY + rect.top
  };

  pet.setPointerCapture(event.pointerId);
  pet.classList.add("dragging");
  pet.classList.remove("sleep");
  showSpeech(messages.dragged, 900);
  window.desktopPet.dragStart();
}

function moveDrag(event) {
  if (!dragState) return;

  window.desktopPet.dragTo({
    screenX: event.screenX,
    screenY: event.screenY,
    offsetX: dragState.offsetX,
    offsetY: dragState.offsetY
  });
}

function endDrag(event) {
  if (!dragState) return;

  try {
    pet.releasePointerCapture(event.pointerId);
  } catch {
    // Pointer capture may already be released if the OS interrupted the drag.
  }
  dragState = null;
  pet.classList.remove("dragging");
  setAction("surprise", 700);
  window.desktopPet.dragEnd();
}

function bindEvents() {
  pet.addEventListener("pointerdown", startDrag);
  pet.addEventListener("pointermove", moveDrag);
  pet.addEventListener("pointerup", endDrag);
  pet.addEventListener("pointercancel", endDrag);
  pet.addEventListener("dblclick", () => window.desktopPet.showControl());

  openControl.addEventListener("click", () => window.desktopPet.showControl());
  quickActions.forEach((button) => {
    button.addEventListener("click", () => {
      setAction(button.dataset.action);
    });
  });
}

async function init() {
  settings = await window.desktopPet.getSettings();
  setPetSize(settings.petSize);
  bindEvents();
  showSpeech(messages.idle, 1200);

  window.desktopPet.onSettingsChanged((nextSettings) => {
    settings = nextSettings;
    setPetSize(settings.petSize);
  });

  window.desktopPet.onPetAction((action) => {
    setAction(action);
  });
}

init();
