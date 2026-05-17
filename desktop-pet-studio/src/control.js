const fields = {
  petSize: document.querySelector("#pet-size"),
  opacity: document.querySelector("#opacity"),
  catchModeEnabled: document.querySelector("#catch-mode-enabled"),
  movementEnabled: document.querySelector("#movement-enabled"),
  wanderEnabled: document.querySelector("#wander-enabled"),
  wanderSpeed: document.querySelector("#wander-speed"),
  snapToEdges: document.querySelector("#snap-to-edges"),
  clickThroughWhenIdle: document.querySelector("#click-through-when-idle"),
  alwaysOnTop: document.querySelector("#always-on-top"),
  launchAtLogin: document.querySelector("#launch-at-login"),
  startInBackground: document.querySelector("#start-in-background"),
  showControlOnStart: document.querySelector("#show-control-on-start")
};

const labels = {
  petSize: document.querySelector("#pet-size-value"),
  opacity: document.querySelector("#opacity-value"),
  wanderSpeed: document.querySelector("#wander-speed-value")
};

let settings = {};
let isRendering = false;

function render(nextSettings) {
  isRendering = true;
  settings = nextSettings;

  fields.petSize.value = settings.petSize;
  labels.petSize.textContent = `${settings.petSize}px`;

  fields.opacity.value = settings.opacity;
  labels.opacity.textContent = `${Math.round(settings.opacity * 100)}%`;

  fields.wanderSpeed.value = settings.wanderSpeed;
  labels.wanderSpeed.textContent = `${Number(settings.wanderSpeed).toFixed(1)}x`;

  fields.catchModeEnabled.checked = settings.catchModeEnabled;
  fields.movementEnabled.checked = settings.movementEnabled;
  fields.wanderEnabled.checked = settings.wanderEnabled;
  fields.snapToEdges.checked = settings.snapToEdges;
  fields.clickThroughWhenIdle.checked = settings.clickThroughWhenIdle;
  fields.alwaysOnTop.checked = settings.alwaysOnTop;
  fields.launchAtLogin.checked = settings.launchAtLogin;
  fields.startInBackground.checked = settings.startInBackground;
  fields.showControlOnStart.checked = settings.showControlOnStart;

  isRendering = false;
}

function bindRange(name, parser = Number) {
  fields[name].addEventListener("input", async (event) => {
    if (isRendering) return;
    const value = parser(event.target.value);
    const next = await window.desktopPet.updateSettings({ [name]: value });
    render(next);
  });
}

function bindToggle(name) {
  fields[name].addEventListener("change", async (event) => {
    if (isRendering) return;
    const next = await window.desktopPet.updateSettings({ [name]: event.target.checked });
    render(next);
  });
}

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      window.desktopPet.performAction(button.dataset.action);
    });
  });

  document.querySelector("#reset-position").addEventListener("click", () => {
    window.desktopPet.resetPosition();
  });
}

async function init() {
  render(await window.desktopPet.getSettings());

  bindRange("petSize", Number);
  bindRange("opacity", Number);
  bindRange("wanderSpeed", Number);
  [
    "catchModeEnabled",
    "movementEnabled",
    "wanderEnabled",
    "snapToEdges",
    "clickThroughWhenIdle",
    "alwaysOnTop",
    "launchAtLogin",
    "startInBackground",
    "showControlOnStart"
  ].forEach(bindToggle);
  bindActions();

  window.desktopPet.onSettingsChanged(render);
}

init();
