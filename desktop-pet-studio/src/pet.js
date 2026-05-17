const pet = document.querySelector("#pet");
const petImage = document.querySelector("#pet-image");
const petShell = document.querySelector("#pet-shell");
const speech = document.querySelector("#speech");
const openControl = document.querySelector("#open-control");
const quickActions = document.querySelectorAll("[data-action]");

let settings = {};
let dragState = null;
let speechTimer;
let actionTimer;
let currentAction = "idle";

const ACTIONS = {
  idle: {
    image: "../assets/pet-cartoon-idle.png",
    message: "我在这里陪你"
  },
  wave: {
    image: "../assets/actions/wave.png",
    message: "你好呀",
    duration: 1600
  },
  walk: {
    image: "../assets/actions/walk.png",
    message: "我去巡逻一下",
    duration: 1200
  },
  sleep: {
    image: "../assets/actions/sleep.png",
    message: "我先休息一会儿",
    persistent: true
  },
  caught: {
    image: "../assets/actions/caught.png",
    message: "抓到我啦",
    duration: 1000
  },
  happy: {
    image: "../assets/actions/happy.png",
    message: "今天也要开心",
    duration: 1600
  },
  sad: {
    image: "../assets/actions/sad.png",
    message: "有点小委屈",
    duration: 1800
  },
  surprised: {
    image: "../assets/actions/surprised.png",
    message: "哇，被发现了",
    duration: 1200
  },
  thinking: {
    image: "../assets/actions/thinking.png",
    message: "让我想一想",
    duration: 1800
  }
};

const ACTION_ALIASES = {
  surprise: "surprised",
  dragged: "caught"
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

function normalizeAction(action) {
  if (typeof action === "object" && action !== null) {
    return ACTION_ALIASES[action.id] || action.id || "idle";
  }
  return ACTION_ALIASES[action] || action || "idle";
}

function setAction(action, options = {}) {
  const actionId = normalizeAction(action);
  const config = ACTIONS[actionId] || ACTIONS.idle;
  const isAutoAction = Boolean(options.auto || action?.auto);

  if (isAutoAction && currentAction !== "idle") return;

  clearTimeout(actionTimer);

  currentAction = actionId;
  pet.dataset.action = actionId;
  petImage.src = config.image;

  if (actionId !== "idle") {
    showSpeech(config.message || ACTIONS.idle.message);
  }

  if (!config.persistent && !options.persistent) {
    const duration = options.duration || config.duration || 1200;
    actionTimer = setTimeout(() => {
      setAction("idle", { silent: true });
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
  setAction("caught", { persistent: true });
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
  setAction("surprised", { duration: 900 });
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
  setAction("idle", { silent: true });
  bindEvents();
  showSpeech(ACTIONS.idle.message, 1200);

  window.desktopPet.onSettingsChanged((nextSettings) => {
    settings = nextSettings;
    setPetSize(settings.petSize);
  });

  window.desktopPet.onPetAction((action) => {
    setAction(action);
  });
}

init();
