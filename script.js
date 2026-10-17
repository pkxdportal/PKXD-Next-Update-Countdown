const FIRST_TARGET_DATE = new Date("2026-07-30T13:00:00Z");
const UPDATE_CYCLE_DAYS = 21;
const UPDATE_CYCLE_MS = UPDATE_CYCLE_DAYS * 24 * 60 * 60 * 1000;

const UPDATE_DATE_DISPLAY = {
  en: { locale: "en-US", timeZone: "America/New_York", city: "NEW YORK" },
  ru: { locale: "ru-RU", timeZone: "Europe/Moscow", city: "МОСКВА" },
  de: { locale: "de-DE", timeZone: "Europe/Berlin", city: "BERLIN" },
  fr: { locale: "fr-FR", timeZone: "Europe/Paris", city: "PARIS" },
  pl: { locale: "pl-PL", timeZone: "Europe/Warsaw", city: "WARSZAWA" },
  pt: { locale: "pt-BR", timeZone: "America/Sao_Paulo", city: "BRASÍLIA" },
  tr: { locale: "tr-TR", timeZone: "Europe/Istanbul", city: "İSTANBUL" },
  id: { locale: "id-ID", timeZone: "Asia/Jakarta", city: "JAKARTA" },
  es: { locale: "es-MX", timeZone: "America/Mexico_City", city: "MEXICO CITY" },
  hi: { locale: "hi-IN", timeZone: "Asia/Kolkata", city: "NEW DELHI" }
};

let targetDate = new Date(FIRST_TARGET_DATE.getTime());
let eventStartDate = new Date(targetDate.getTime() - UPDATE_CYCLE_MS);
let manualCountdownConfig = null;

let currentLang = "en";
let lastSeconds = null;
let countdownInterval = null;
let activeSection = localStorage.getItem("activeSection") || "countdownSection";
let isSendingTheory = false;

const COMMENTS_API_URL =
  "https://script.google.com/macros/s/AKfycbyApSkcMeOYFBS88Ich9qX18M4_3o9IunaY-NpecRVeLsF4koKWgy6Xc7bU8MF6XLUl/exec";

const PORTAL_API_URL =
  "https://script.google.com/macros/s/AKfycbwr7FwALrxm-0NzD3dBFB_PsoVxbD_NB52rt_oNpnq5nFRMJq9cavrbwtxrMJAW3YqB/exec";

const THEORY_MAX_LENGTH = 500;

const PORTAL_VIDEOS = [
  {
    title: "WELCOME TO PK XD PORTAL",
    videoId: "sZszBFUDbt0",
    url: "https://youtu.be/sZszBFUDbt0?si=EeKDuwUQBumjEq5B"
  },
  {
    title: "PK XD Update Watch",
    videoId: "cSBDn6gM2Fc",
    url: "https://youtube.com/shorts/cSBDn6gM2Fc?si=QGCXKXqoG852Sw6p"
  },
  {
    title: "PK XD Fan Theory",
    videoId: "8-JdJ_r6qZQ",
    url: "https://youtube.com/shorts/8-JdJ_r6qZQ?si=lFu3fKhWuJ8_ozTt"
  }
];

const timer = document.getElementById("timer");
const countdownTimerMarkup = timer?.innerHTML || "";

let daysEl = document.getElementById("days");
let hoursEl = document.getElementById("hours");
let minutesEl = document.getElementById("minutes");
let secondsEl = document.getElementById("seconds");
let isReleaseMessageVisible = false;

const langToggle = document.getElementById("langToggle");
const languageMenu = document.getElementById("languageMenu");

const downloadToggle = document.getElementById("downloadToggle");
const downloadMenu = document.getElementById("downloadMenu");

const backgroundToggle = document.getElementById("backgroundToggle");
const backgroundMenu = document.getElementById("backgroundMenu");
const uploadBackgroundBtn = document.getElementById("uploadBackgroundBtn");
const resetBackgroundBtn = document.getElementById("resetBackgroundBtn");
const backgroundFileInput = document.getElementById("backgroundFileInput");
const backgroundLayer = document.querySelector(".background");

const updateDateToggle = document.getElementById("updateDateToggle");
const updateDateMenu = document.getElementById("updateDateMenu");
const updateDateInput = document.getElementById("updateDateInput");
const updateDateCurrent = document.getElementById("updateDateCurrent");
const saveUpdateDateBtn = document.getElementById("saveUpdateDateBtn");
const resetUpdateDateBtn = document.getElementById("resetUpdateDateBtn");

const themeToggle = document.getElementById("themeToggle");
const themeMenu = document.getElementById("themeMenu");
const themePrimaryInput = document.getElementById("themePrimaryInput");
const themeSecondaryInput = document.getElementById("themeSecondaryInput");
const themePrimaryValue = document.getElementById("themePrimaryValue");
const themeSecondaryValue = document.getElementById("themeSecondaryValue");
const saveThemeBtn = document.getElementById("saveThemeBtn");
const resetThemeBtn = document.getElementById("resetThemeBtn");

const shareBtn = document.getElementById("shareBtn");

const portalToggle = document.getElementById("portalToggle");
const portalMenu = document.getElementById("portalMenu");

const mainNavButtons = document.querySelectorAll(".main-nav-btn");
const appSections = document.querySelectorAll(".app-section");

const countdownModeBtn = document.getElementById("countdownModeBtn");
const progressModeBtn = document.getElementById("progressModeBtn");

const progressPanel = document.getElementById("progressPanel");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");
const progressRingValue = document.querySelector(".progress-ring-value");

const theoryName = document.getElementById("theoryName");
const theoryText = document.getElementById("theoryText");
const theoryCounter = document.getElementById("theoryCounter");
const theoryForm = document.getElementById("theoryForm");
const theorySubmitBtn = document.getElementById("theorySubmitBtn");
const userTheoriesList = document.getElementById("userTheoriesList");

const portalToast = document.getElementById("portalToast");
const cursorGlow = document.querySelector(".cursor-glow");

const CUSTOM_BACKGROUND_KEY = "portalCustomBackground";
const COUNTDOWN_CONFIG_CACHE_KEY = "portalCountdownConfig";
const THEME_CONFIG_CACHE_KEY = "portalThemeConfig";
const DEFAULT_THEME = { primary: "#ff3f63", secondary: "#8a57ff" };
const OWNER_MODE_KEY = "pkxdPortalOwnerMode";
const OWNER_QUERY_PARAM = "ownerKey";
const OWNER_KEY_HASH = "8a66f2428ac63682e0b48c89e142b7c7a762255823e06c47f8d7591c0d12c649";
const ownerBackgroundControl = document.getElementById("ownerBackgroundControl");
const ownerUpdateDateControl = document.getElementById("ownerUpdateDateControl");
const ownerThemeControl = document.getElementById("ownerThemeControl");
let isOwnerMode = false;
const THEORY_REACTIONS_KEY = "portalTheoryReactions";
const THEORY_REACTION_TYPES = [
  { key: "eyes", icon: "icon-eyes.png", emoji: "👀" },
  { key: "love", icon: "icon-love.png", emoji: "❤️" },
  { key: "laugh", icon: "icon-laugh.png", emoji: "😂" }
];

const COMMENT_USER_KEY =
  localStorage.getItem("commentUserKey") ||
  "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 12);

localStorage.setItem("commentUserKey", COMMENT_USER_KEY);

function getText(key) {
  return translations[currentLang]?.[key] || translations.en?.[key] || key;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimeout = null;

function showToast(message) {
  if (!portalToast || !message) return;

  portalToast.textContent = message;
  portalToast.classList.add("show");

  if (toastTimeout) window.clearTimeout(toastTimeout);

  toastTimeout = window.setTimeout(() => {
    portalToast.classList.remove("show");
  }, 2200);
}


async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function setOwnerMode(enabled) {
  isOwnerMode = Boolean(enabled);

  if (ownerBackgroundControl) {
    ownerBackgroundControl.hidden = !isOwnerMode;
  }

  if (ownerUpdateDateControl) {
    ownerUpdateDateControl.hidden = !isOwnerMode;
  }

  if (ownerThemeControl) {
    ownerThemeControl.hidden = !isOwnerMode;
  }
}

async function initializeOwnerMode() {
  const params = new URLSearchParams(window.location.search);
  const ownerKey = params.get(OWNER_QUERY_PARAM);

  if (ownerKey && window.crypto?.subtle) {
    try {
      const hash = await sha256(ownerKey);
      if (hash === OWNER_KEY_HASH) localStorage.setItem(OWNER_MODE_KEY, "1");
    } catch (error) {
      console.warn("Owner mode could not be verified:", error);
    }

    params.delete(OWNER_QUERY_PARAM);
    const cleanQuery = params.toString();
    const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : "") + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  setOwnerMode(localStorage.getItem(OWNER_MODE_KEY) === "1");
}

function normalizeThemeColor(value, fallback) {
  const color = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : fallback;
}

function parseThemeConfig(data) {
  const primary = normalizeThemeColor(data?.primary, "");
  const secondary = normalizeThemeColor(data?.secondary, "");

  if (!primary || !secondary) return null;

  return { primary, secondary };
}

function applyTheme(config) {
  const theme = config || DEFAULT_THEME;
  const primary = normalizeThemeColor(theme.primary, DEFAULT_THEME.primary);
  const secondary = normalizeThemeColor(theme.secondary, DEFAULT_THEME.secondary);

  document.documentElement.style.setProperty("--accent-red", primary);
  document.documentElement.style.setProperty("--accent-purple", secondary);

  if (themePrimaryInput) themePrimaryInput.value = primary;
  if (themeSecondaryInput) themeSecondaryInput.value = secondary;
  if (themePrimaryValue) themePrimaryValue.textContent = primary.toUpperCase();
  if (themeSecondaryValue) themeSecondaryValue.textContent = secondary.toUpperCase();
}

function cacheThemeConfig(config) {
  if (!config) {
    localStorage.removeItem(THEME_CONFIG_CACHE_KEY);
    return;
  }

  try {
    localStorage.setItem(THEME_CONFIG_CACHE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn("Theme cache could not be saved:", error);
  }
}

function getCachedThemeConfig() {
  try {
    const raw = localStorage.getItem(THEME_CONFIG_CACHE_KEY);
    return raw ? parseThemeConfig(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

async function fetchSharedThemeConfig() {
  const response = await fetch(
    PORTAL_API_URL + "?action=theme&cache=" + Date.now(),
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Could not load shared theme");
  }

  const data = await response.json();
  return parseThemeConfig(data);
}

async function loadSharedThemeConfig() {
  const cachedTheme = getCachedThemeConfig();

  if (cachedTheme) {
    applyTheme(cachedTheme);
  } else {
    applyTheme(DEFAULT_THEME);
  }

  try {
    const sharedTheme = await fetchSharedThemeConfig();

    if (sharedTheme) {
      cacheThemeConfig(sharedTheme);
      applyTheme(sharedTheme);
    } else {
      cacheThemeConfig(null);
      applyTheme(DEFAULT_THEME);
    }
  } catch (error) {
    console.warn("Shared theme could not be loaded:", error);
  }
}

function previewThemeFromInputs() {
  applyTheme({
    primary: themePrimaryInput?.value || DEFAULT_THEME.primary,
    secondary: themeSecondaryInput?.value || DEFAULT_THEME.secondary
  });
}

async function saveThemeConfig() {
  if (!isOwnerMode) return;

  const candidate = {
    primary: normalizeThemeColor(themePrimaryInput?.value, DEFAULT_THEME.primary),
    secondary: normalizeThemeColor(themeSecondaryInput?.value, DEFAULT_THEME.secondary)
  };

  if (saveThemeBtn) saveThemeBtn.disabled = true;

  try {
    await fetch(PORTAL_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "setTheme",
        primary: candidate.primary,
        secondary: candidate.secondary
      })
    });

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const verifiedTheme = await fetchSharedThemeConfig();

    if (
      !verifiedTheme ||
      verifiedTheme.primary !== candidate.primary ||
      verifiedTheme.secondary !== candidate.secondary
    ) {
      throw new Error("Theme was not stored by the backend");
    }

    cacheThemeConfig(verifiedTheme);
    applyTheme(verifiedTheme);
    showToast(getText("themeSaved"));
    themeMenu?.classList.remove("open");
  } catch (error) {
    console.warn("Theme could not be saved:", error);
    showToast(getText("themeSaveError"));
    await loadSharedThemeConfig();
  } finally {
    if (saveThemeBtn) saveThemeBtn.disabled = false;
  }
}

async function resetThemeConfig() {
  if (!isOwnerMode) return;

  if (resetThemeBtn) resetThemeBtn.disabled = true;

  try {
    await fetch(PORTAL_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "resetTheme"
      })
    });

    await new Promise((resolve) => window.setTimeout(resolve, 700));

    const verifiedTheme = await fetchSharedThemeConfig();

    if (verifiedTheme) {
      throw new Error("Custom theme is still active");
    }

    cacheThemeConfig(null);
    applyTheme(DEFAULT_THEME);
    showToast(getText("themeReset"));
    themeMenu?.classList.remove("open");
  } catch (error) {
    console.warn("Theme could not be reset:", error);
    showToast(getText("themeSaveError"));
  } finally {
    if (resetThemeBtn) resetThemeBtn.disabled = false;
  }
}

function applyCustomBackground(imageUrl) {
  if (!backgroundLayer) return;

  if (imageUrl) {
    backgroundLayer.style.backgroundImage = `url("${imageUrl}")`;
    backgroundLayer.style.backgroundPosition = "center center";
    backgroundLayer.style.backgroundSize = "cover";
    backgroundLayer.style.backgroundRepeat = "no-repeat";
    backgroundLayer.style.backgroundAttachment =
      window.matchMedia("(max-width: 900px)").matches ? "scroll" : "fixed";
    backgroundLayer.classList.add("has-custom-bg");
    document.body.classList.add("has-custom-background");
  } else {
    backgroundLayer.style.backgroundImage = "";
    backgroundLayer.style.backgroundPosition = "";
    backgroundLayer.style.backgroundSize = "";
    backgroundLayer.style.backgroundRepeat = "";
    backgroundLayer.style.backgroundAttachment = "";
    backgroundLayer.classList.remove("has-custom-bg");
    document.body.classList.remove("has-custom-background");
  }
}

async function loadSavedBackground() {
  const cachedImage = localStorage.getItem(CUSTOM_BACKGROUND_KEY) || "";

  if (cachedImage) {
    applyCustomBackground(cachedImage);
  }

  try {
    const response = await fetch(
      PORTAL_API_URL + "?action=background&cache=" + Date.now(),
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Could not load shared background");
    }

    const data = await response.json();
    const sharedImage =
      data?.ok && typeof data.background === "string"
        ? data.background
        : "";

    if (sharedImage) {
      try {
        localStorage.setItem(CUSTOM_BACKGROUND_KEY, sharedImage);
      } catch (error) {
        console.warn("Background cache could not be saved:", error);
      }

      applyCustomBackground(sharedImage);
    } else {
      localStorage.removeItem(CUSTOM_BACKGROUND_KEY);
      applyCustomBackground("");
    }
  } catch (error) {
    console.warn("Shared background could not be loaded:", error);

    if (!cachedImage) {
      applyCustomBackground("");
    }
  }
}

async function saveCustomBackground(imageUrl) {
  if (!isOwnerMode) return;

  try {
    try {
      localStorage.setItem(CUSTOM_BACKGROUND_KEY, imageUrl);
    } catch (error) {
      console.warn("Background cache could not be saved:", error);
    }

    applyCustomBackground(imageUrl);

    await fetch(PORTAL_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "background",
        image: imageUrl
      })
    });

    showToast(getText("backgroundSaved"));

    window.setTimeout(() => loadSavedBackground(), 1500);
    window.setTimeout(() => loadSavedBackground(), 3500);
  } catch (error) {
    console.warn("Background could not be saved:", error);
    showToast(getText("backgroundTooLarge"));
  }
}

async function resetCustomBackground() {
  if (!isOwnerMode) return;

  localStorage.removeItem(CUSTOM_BACKGROUND_KEY);
  applyCustomBackground("");

  try {
    await fetch(PORTAL_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "resetBackground"
      })
    });

    showToast(getText("backgroundReset"));
    window.setTimeout(() => loadSavedBackground(), 1500);
  } catch (error) {
    console.warn("Background could not be reset:", error);
  }
}

function optimizeBackgroundFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("File read failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Image load failed"));
      image.onload = () => {
        const maxSide = 2560;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function getStoredTheoryReactions() {
  try {
    return JSON.parse(localStorage.getItem(THEORY_REACTIONS_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function saveStoredTheoryReactions(data) {
  localStorage.setItem(THEORY_REACTIONS_KEY, JSON.stringify(data));
}

function simpleHash(value) {
  let hash = 0;
  const source = String(value || "");

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function getTheoryKey(theory, index = 0) {
  return String(
    theory.id ||
    theory.commentId ||
    theory._id ||
    theory.time ||
    theory.createdAt ||
    theory.timestamp ||
    theory.date ||
    `theory_${index}_${simpleHash(`${theory.name || ""}|${theory.message || theory.text || ""}`)}`
  );
}

function getTheoryReactionCount(theory, reactionKey, theoryKey) {
  const reactions = theory?.reactions;
  let count = 0;

  if (reactions && typeof reactions === "object") {
    count = Number(reactions[reactionKey] || 0);
  }

  if (!count) {
    count = Number(
      theory?.[`${reactionKey}Count`] ||
      theory?.[reactionKey] ||
      0
    );
  }

  const stored = getStoredTheoryReactions();
  if (stored[theoryKey] === reactionKey) count += 1;

  return count;
}

function renderReactionIcon(type) {
  return `
    <img src="${type.icon}" alt="" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
    <span class="reaction-emoji">${type.emoji}</span>
  `;
}

function formatTheoryTime(timestamp) {
  const time = new Date(timestamp).getTime();

  if (!time) return "";

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function parseCountdownConfig(data) {
  const target = new Date(data?.targetDate || "");
  const start = new Date(data?.startDate || "");

  if (
    !Number.isFinite(target.getTime()) ||
    !Number.isFinite(start.getTime()) ||
    start.getTime() >= target.getTime()
  ) {
    return null;
  }

  return { target, start };
}

function cacheCountdownConfig(config) {
  if (!config) {
    localStorage.removeItem(COUNTDOWN_CONFIG_CACHE_KEY);
    return;
  }

  try {
    localStorage.setItem(
      COUNTDOWN_CONFIG_CACHE_KEY,
      JSON.stringify({
        targetDate: config.target.toISOString(),
        startDate: config.start.toISOString()
      })
    );
  } catch (error) {
    console.warn("Countdown config cache could not be saved:", error);
  }
}

function applyManualCountdownConfig(config) {
  manualCountdownConfig = config
    ? {
        target: new Date(config.target.getTime()),
        start: new Date(config.start.getTime())
      }
    : null;

  if (manualCountdownConfig) {
    targetDate = new Date(manualCountdownConfig.target.getTime());
    eventStartDate = new Date(manualCountdownConfig.start.getTime());
  }

  updateDynamicEventDate();
  updateUpdateDateControl();
}

function getCachedCountdownConfig() {
  try {
    const raw = localStorage.getItem(COUNTDOWN_CONFIG_CACHE_KEY);
    return raw ? parseCountdownConfig(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

async function fetchSharedCountdownConfig() {
  const response = await fetch(
    PORTAL_API_URL + "?action=countdown&cache=" + Date.now(),
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Could not load countdown settings");
  }

  const data = await response.json();
  return parseCountdownConfig(data);
}

async function loadSharedCountdownConfig() {
  const cachedConfig = getCachedCountdownConfig();

  if (cachedConfig) {
    applyManualCountdownConfig(cachedConfig);
  }

  try {
    const sharedConfig = await fetchSharedCountdownConfig();

    if (sharedConfig) {
      cacheCountdownConfig(sharedConfig);
      applyManualCountdownConfig(sharedConfig);
    } else {
      cacheCountdownConfig(null);
      applyManualCountdownConfig(null);
    }
  } catch (error) {
    console.warn("Shared countdown date could not be loaded:", error);

    if (!cachedConfig) {
      applyManualCountdownConfig(null);
    }
  }
}

function toDateTimeLocalValue(date) {
  if (!date || !Number.isFinite(date.getTime())) return "";

  const pad = (value) => String(value).padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

function updateUpdateDateControl() {
  if (updateDateCurrent && targetDate) {
    updateDateCurrent.textContent = formatUpdateDate(targetDate);
  }

  if (updateDateInput && targetDate && document.activeElement !== updateDateInput) {
    updateDateInput.value = toDateTimeLocalValue(targetDate);
  }
}

function getStartForManualTarget(now = new Date()) {
  const currentCycle = getCurrentUpdateCycle(now);

  if (currentCycle.updateReleased) {
    return new Date(currentCycle.target.getTime());
  }

  return new Date(currentCycle.start.getTime());
}

async function saveManualUpdateDate() {
  if (!isOwnerMode || !updateDateInput) return;

  const selectedDate = new Date(updateDateInput.value);
  const now = new Date();

  if (
    !updateDateInput.value ||
    !Number.isFinite(selectedDate.getTime()) ||
    selectedDate.getTime() <= now.getTime()
  ) {
    showToast(getText("updateDateInvalid"));
    return;
  }

  const candidate = {
    target: selectedDate,
    start: getStartForManualTarget(now)
  };

  if (candidate.start.getTime() >= candidate.target.getTime()) {
    candidate.start = new Date(now.getTime());
  }

  if (saveUpdateDateBtn) saveUpdateDateBtn.disabled = true;

  try {
    await fetch(PORTAL_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "setCountdownDate",
        targetDate: candidate.target.toISOString(),
        startDate: candidate.start.toISOString()
      })
    });

    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    const verifiedConfig = await fetchSharedCountdownConfig();

    if (
      !verifiedConfig ||
      Math.abs(verifiedConfig.target.getTime() - candidate.target.getTime()) > 60000
    ) {
      throw new Error("Countdown date was not stored by the backend");
    }

    cacheCountdownConfig(verifiedConfig);
    applyManualCountdownConfig(verifiedConfig);
    updateCountdown();
    showToast(getText("updateDateSaved"));
    updateDateMenu?.classList.remove("open");
  } catch (error) {
    console.warn("Countdown date could not be saved:", error);
    showToast(getText("updateDateSaveError"));
    await loadSharedCountdownConfig();
    updateCountdown();
  } finally {
    if (saveUpdateDateBtn) saveUpdateDateBtn.disabled = false;
  }
}

async function resetManualUpdateDate() {
  if (!isOwnerMode) return;

  if (resetUpdateDateBtn) resetUpdateDateBtn.disabled = true;

  try {
    await fetch(PORTAL_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "resetCountdownDate"
      })
    });

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const verifiedConfig = await fetchSharedCountdownConfig();

    if (verifiedConfig) {
      throw new Error("Manual countdown date is still active");
    }

    cacheCountdownConfig(null);
    applyManualCountdownConfig(null);
    syncCurrentCycle();
    updateCountdown();
    showToast(getText("updateDateReset"));
    updateDateMenu?.classList.remove("open");
  } catch (error) {
    console.warn("Countdown date could not be reset:", error);
    showToast(getText("updateDateSaveError"));
  } finally {
    if (resetUpdateDateBtn) resetUpdateDateBtn.disabled = false;
  }
}

function getNextMondayAfter(date) {
  const nextMonday = new Date(date);
  nextMonday.setHours(0, 0, 0, 0);

  const day = nextMonday.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;

  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  return nextMonday;
}

function getCurrentUpdateCycle(now) {
  if (manualCountdownConfig) {
    const target = new Date(manualCountdownConfig.target.getTime());
    const start = new Date(manualCountdownConfig.start.getTime());

    return {
      target,
      start,
      updateReleased: now.getTime() >= target.getTime()
    };
  }

  const firstTargetTime = FIRST_TARGET_DATE.getTime();
  const nowTime = now.getTime();

  if (nowTime < firstTargetTime) {
    const target = new Date(firstTargetTime);

    return {
      target,
      start: new Date(target.getTime() - UPDATE_CYCLE_MS),
      updateReleased: false
    };
  }

  const completedCycles = Math.floor(
    (nowTime - firstTargetTime) / UPDATE_CYCLE_MS
  );

  const latestTarget = new Date(
    firstTargetTime + completedCycles * UPDATE_CYCLE_MS
  );

  const restartDate = getNextMondayAfter(latestTarget);

  if (nowTime < restartDate.getTime()) {
    return {
      target: latestTarget,
      start: new Date(latestTarget.getTime() - UPDATE_CYCLE_MS),
      updateReleased: true
    };
  }

  return {
    target: new Date(latestTarget.getTime() + UPDATE_CYCLE_MS),
    start: restartDate,
    updateReleased: false
  };
}

function syncCurrentCycle(now = new Date()) {
  const cycle = getCurrentUpdateCycle(now);

  targetDate = cycle.target;
  eventStartDate = cycle.start;

  return cycle;
}

function formatUpdateDate(date, lang = currentLang) {
  const config = UPDATE_DATE_DISPLAY[lang] || UPDATE_DATE_DISPLAY.en;

  const datePart = new Intl.DateTimeFormat(config.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: config.timeZone
  }).format(date);

  const timePart = new Intl.DateTimeFormat(config.locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: config.timeZone
  }).format(date);

  return `${datePart.toLocaleUpperCase(config.locale)} • ${timePart} ${config.city}`;
}

function updateDynamicEventDate() {
  const eventDateEl = document.querySelector('[data-i18n="eventDate"]');

  if (!eventDateEl || !targetDate) return;

  eventDateEl.textContent = formatUpdateDate(targetDate);
}

function restoreCountdownTimer() {
  if (!timer || !isReleaseMessageVisible) return;

  timer.innerHTML = countdownTimerMarkup;

  daysEl = document.getElementById("days");
  hoursEl = document.getElementById("hours");
  minutesEl = document.getElementById("minutes");
  secondsEl = document.getElementById("seconds");

  isReleaseMessageVisible = false;
  lastSeconds = null;
}

function showUpdateReleased() {
  if (!timer) return;

  if (!isReleaseMessageVisible) {
    timer.innerHTML = `<div class="started"></div>`;
    isReleaseMessageVisible = true;
  }

  const startedEl = timer.querySelector(".started");
  if (startedEl) startedEl.textContent = getText("started");
}

function updateCountdown() {
  const now = new Date();
  const cycle = syncCurrentCycle(now);

  updateDynamicEventDate();

  if (cycle.updateReleased) {
    showUpdateReleased();
    updateProgress();
    return;
  }

  restoreCountdownTimer();

  const distance = targetDate.getTime() - now.getTime();

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");

  updateAtmosphere(days);
  updateProgress();

  if (secondsEl && lastSeconds !== seconds) {
    secondsEl.classList.remove("tick");
    void secondsEl.offsetWidth;
    secondsEl.classList.add("tick");
    lastSeconds = seconds;
  }
}

function updateProgress() {
  if (!progressFill || !progressPercent || !progressText) return;

  const now = new Date().getTime();
  const start = eventStartDate.getTime();
  const end = targetDate.getTime();

  const total = end - start;
  const passed = now - start;

  let percent = 100;

  if (total > 0) {
    percent = Math.round((passed / total) * 100);
    percent = Math.max(0, Math.min(100, percent));
  }

  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";
  progressText.textContent = getText("progressText");

  if (progressRingValue) {
    const radius = Number(progressRingValue.getAttribute("r")) || 66;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent / 100);

    progressRingValue.style.strokeDasharray = String(circumference);
    progressRingValue.style.strokeDashoffset = String(offset);
  }
}

function updateAtmosphere(daysLeft) {
  document.body.classList.remove(
    "near-100",
    "near-75",
    "near-50",
    "near-25",
    "near-7",
    "near-1"
  );

  if (daysLeft <= 100) document.body.classList.add("near-100");
  if (daysLeft <= 75) document.body.classList.add("near-75");
  if (daysLeft <= 50) document.body.classList.add("near-50");
  if (daysLeft <= 25) document.body.classList.add("near-25");
  if (daysLeft <= 7) document.body.classList.add("near-7");
  if (daysLeft <= 1) document.body.classList.add("near-1");
}

function setLanguage(lang) {
  currentLang = translations[lang] ? lang : "en";
  localStorage.setItem("selectedLang", currentLang);

  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.innerHTML = getText(key);
  });

  if (theoryName) {
    theoryName.placeholder = getText("commentNamePlaceholder");
  }

  if (theoryText) {
    theoryText.placeholder = getText("theoryPlaceholder");
  }

  document.querySelectorAll("#languageMenu .lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });

  syncCurrentCycle();
  updateDynamicEventDate();
  updateUpdateDateControl();
  updateProgress();
  updateTheoryCounter();
  renderVideoHub();
  renderTheories();

  if (languageMenu) languageMenu.classList.remove("open");
  if (downloadMenu) downloadMenu.classList.remove("open");
  if (backgroundMenu) backgroundMenu.classList.remove("open");
  if (portalMenu) portalMenu.classList.remove("open");
}

function setMode(mode) {
  if (!timer || !progressPanel) return;

  timer.classList.toggle("hidden", mode !== "countdown");
  progressPanel.classList.toggle("active", mode === "progress");

  countdownModeBtn?.classList.toggle("active", mode === "countdown");
  progressModeBtn?.classList.toggle("active", mode === "progress");
}

function setActiveSection(sectionId) {
  const requestedId = sectionId || "countdownSection";
  const requestedSection = document.getElementById(requestedId);
  const targetId =
    requestedSection?.classList.contains("app-section")
      ? requestedId
      : "countdownSection";

  activeSection = targetId;
  localStorage.setItem("activeSection", activeSection);

  appSections.forEach((section) => {
    section.classList.toggle("active", section.id === activeSection);
  });

mainNavButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.sectionTarget === activeSection);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function getYoutubeThumbnail(videoId) {
  if (!videoId) return "";

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function createVideoCard(video) {
  const safeUrl = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;
  const thumb = getYoutubeThumbnail(video.videoId);

  return `
    <a class="video-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer">
      <img
        src="${thumb}"
        alt="${escapeHtml(video.title)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg';"
      />
      <span class="video-card-title">${escapeHtml(video.title)}</span>
    </a>
  `;
}

function renderVideoHub() {
  const videoHub = document.querySelector(".video-hub");

  if (!videoHub) return;

  const portalGrid = videoHub.querySelector(".video-section .video-grid");

  if (portalGrid) {
    portalGrid.innerHTML = PORTAL_VIDEOS.map(createVideoCard).join("");
  }

  const portalTitle = videoHub.querySelector(".video-section h3");

  if (portalTitle) {
    portalTitle.textContent = getText("portalVideosTitle");
  }
}

function updateTheoryCounter() {
  if (!theoryText || !theoryCounter) return;

  const maxLength = Number(theoryText.getAttribute("maxlength") || THEORY_MAX_LENGTH);
  const length = theoryText.value.length;
  const left = Math.max(0, maxLength - length);

  theoryCounter.textContent = `${length} / ${maxLength}`;

  theoryCounter.classList.toggle("warning", left <= 80 && left > 0);
  theoryCounter.classList.toggle("limit", left === 0);
}

async function getStoredTheories() {
  try {
    const url =
      COMMENTS_API_URL +
      "?cache=" + Date.now() +
      "&room=theories" +
      "&userKey=" + encodeURIComponent(COMMENT_USER_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not load theories");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.warn("Theories could not be loaded:", error);
    return [];
  }
}

function isLegacyInternalTheoryRecord(theory) {
  const message = String(theory?.message || theory?.text || "").trim();
  return message.startsWith("__PKXD_");
}

async function renderTheories() {
  if (!userTheoriesList) return;

  const theories = (await getStoredTheories()).filter(
    (theory) => !isLegacyInternalTheoryRecord(theory)
  );

  if (!theories.length) {
    userTheoriesList.innerHTML = `
      <div class="comment-empty">
        ${escapeHtml(getText("theoriesComingSoon"))}
      </div>
    `;
    return;
  }

  userTheoriesList.innerHTML = theories
    .slice(-50)
    .reverse()
    .map((theory, index) => {
      const name = theory.name || "Player";
      const message = theory.message || theory.text || "";
      const createdAt =
        theory.time ||
        theory.createdAt ||
        theory.timestamp ||
        theory.date ||
        "";
      const theoryKey = getTheoryKey(theory, index);
      const userReaction = getStoredTheoryReactions()[theoryKey] || "";

      const reactionsMarkup = THEORY_REACTION_TYPES.map((type) => {
        const count = getTheoryReactionCount(theory, type.key, theoryKey);
        const activeClass = userReaction === type.key ? " active" : "";

        return `
          <button type="button" class="theory-reaction-btn${activeClass}" data-theory-key="${escapeHtml(theoryKey)}" data-reaction="${type.key}" aria-label="${type.key}">
            <span class="reaction-icon">${renderReactionIcon(type)}</span>
            <span class="reaction-count">${count}</span>
          </button>
        `;
      }).join("");

      return `
        <div class="comm-message theory-message">
          <div class="comm-top">
            <strong>${escapeHtml(name)}</strong>
            <span>${formatTheoryTime(createdAt)}</span>
          </div>

          <p>${escapeHtml(message)}</p>

          <div class="theory-reactions">
            ${reactionsMarkup}
          </div>
        </div>
      `;
    })
    .join("");
}

async function sendTheory(name, text) {
  const cleanName = String(name || "").trim().slice(0, 18);
  const cleanText = String(text || "").trim().slice(0, THEORY_MAX_LENGTH);

  if (!cleanName || !cleanText || isSendingTheory) return;

  localStorage.setItem("portalUserName", cleanName);

  isSendingTheory = true;

  if (theorySubmitBtn) {
    theorySubmitBtn.disabled = true;
    theorySubmitBtn.textContent = "…";
  }

  try {
    await fetch(COMMENTS_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        name: cleanName,
        message: cleanText,
        rating: 0,
        parentId: "",
        room: "theories",
        team: "",
        userKey: COMMENT_USER_KEY
      })
    });

    window.setTimeout(() => {
      renderTheories();
    }, 1800);
  } catch (error) {
    console.warn("Theory could not be sent:", error);
  } finally {
    window.setTimeout(() => {
      isSendingTheory = false;

      if (theorySubmitBtn) {
        theorySubmitBtn.disabled = false;
        theorySubmitBtn.textContent = getText("submitTheoryBtn");
      }
    }, 1200);
  }
}

document.querySelectorAll("#languageMenu .lang-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

if (langToggle) {
  langToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    languageMenu?.classList.toggle("open");
    downloadMenu?.classList.remove("open");
    backgroundMenu?.classList.remove("open");
    updateDateMenu?.classList.remove("open");
    themeMenu?.classList.remove("open");
    portalMenu?.classList.remove("open");
  });
}

if (downloadToggle) {
  downloadToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    backgroundMenu?.classList.remove("open");
    updateDateMenu?.classList.remove("open");
    portalMenu?.classList.remove("open");
  });
}

if (backgroundToggle) {
  backgroundToggle.addEventListener("click", (event) => {
    if (!isOwnerMode) return;
    event.stopPropagation();
    backgroundMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    downloadMenu?.classList.remove("open");
    updateDateMenu?.classList.remove("open");
    themeMenu?.classList.remove("open");
    portalMenu?.classList.remove("open");
  });
}

if (updateDateToggle) {
  updateDateToggle.addEventListener("click", (event) => {
    if (!isOwnerMode) return;
    event.stopPropagation();
    updateUpdateDateControl();
    updateDateMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    downloadMenu?.classList.remove("open");
    backgroundMenu?.classList.remove("open");
    themeMenu?.classList.remove("open");
    portalMenu?.classList.remove("open");
  });
}

if (saveUpdateDateBtn) {
  saveUpdateDateBtn.addEventListener("click", () => {
    saveManualUpdateDate();
  });
}

if (resetUpdateDateBtn) {
  resetUpdateDateBtn.addEventListener("click", () => {
    resetManualUpdateDate();
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", (event) => {
    if (!isOwnerMode) return;
    event.stopPropagation();
    themeMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    downloadMenu?.classList.remove("open");
    backgroundMenu?.classList.remove("open");
    updateDateMenu?.classList.remove("open");
    portalMenu?.classList.remove("open");
  });
}

themePrimaryInput?.addEventListener("input", previewThemeFromInputs);
themeSecondaryInput?.addEventListener("input", previewThemeFromInputs);

if (saveThemeBtn) {
  saveThemeBtn.addEventListener("click", () => {
    saveThemeConfig();
  });
}

if (resetThemeBtn) {
  resetThemeBtn.addEventListener("click", () => {
    resetThemeConfig();
  });
}

if (uploadBackgroundBtn) {
  uploadBackgroundBtn.addEventListener("click", () => {
    if (!isOwnerMode) return;
    backgroundFileInput?.click();
    backgroundMenu?.classList.remove("open");
  });
}

if (resetBackgroundBtn) {
  resetBackgroundBtn.addEventListener("click", () => {
    if (!isOwnerMode) return;
    resetCustomBackground();
    backgroundMenu?.classList.remove("open");
  });
}

if (backgroundFileInput) {
  backgroundFileInput.addEventListener("change", async () => {
    if (!isOwnerMode) return;

    const file = backgroundFileInput.files?.[0];
    if (!file) return;

    try {
      const optimizedImage = await optimizeBackgroundFile(file);
      saveCustomBackground(optimizedImage);
    } catch (error) {
      console.warn("Background image could not be processed:", error);
      showToast(getText("backgroundTooLarge"));
    } finally {
      backgroundFileInput.value = "";
    }
  });
}

if (portalToggle) {
  portalToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    portalMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    downloadMenu?.classList.remove("open");
    backgroundMenu?.classList.remove("open");
    updateDateMenu?.classList.remove("open");
    themeMenu?.classList.remove("open");
  });
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const url = window.location.href.split("#")[0];

    try {
      await navigator.clipboard.writeText(url);
      showToast(getText("shareCopied"));
    } catch (error) {
      console.warn("Could not copy link:", error);
      showToast(getText("shareCopied"));
    }
  });
}

if (countdownModeBtn) {
  countdownModeBtn.addEventListener("click", () => {
    setMode("countdown");
  });
}

if (progressModeBtn) {
  progressModeBtn.addEventListener("click", () => {
    setMode("progress");
  });
}

mainNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const sectionId = button.dataset.sectionTarget;

    if (!sectionId) return;

    setActiveSection(sectionId);
  });
});

document.querySelectorAll("[data-section-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    const sectionId = button.dataset.sectionJump;
    if (sectionId) setActiveSection(sectionId);
  });
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canUsePointerEffects = window.matchMedia("(pointer: fine)");

if (cursorGlow && canUsePointerEffects.matches && !prefersReducedMotion.matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = event.clientX + "px";
    cursorGlow.style.top = event.clientY + "px";
  }, { passive: true });
}

if (canUsePointerEffects.matches && !prefersReducedMotion.matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = y * -1.8;
      const rotateY = x * 1.8;

      card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

if (userTheoriesList) {
  userTheoriesList.addEventListener("click", (event) => {
    const reactionBtn = event.target.closest(".theory-reaction-btn");
    if (!reactionBtn) return;

    const theoryKey = reactionBtn.dataset.theoryKey || "";
    const reaction = reactionBtn.dataset.reaction || "";

    if (!theoryKey || !reaction) return;

    const stored = getStoredTheoryReactions();
    stored[theoryKey] = stored[theoryKey] === reaction ? "" : reaction;
    if (!stored[theoryKey]) {
      delete stored[theoryKey];
    }
    saveStoredTheoryReactions(stored);
    renderTheories();
  });
}

if (theoryName) {
  const savedName = localStorage.getItem("portalUserName") || "";

  if (savedName && !theoryName.value) {
    theoryName.value = savedName;
  }

  theoryName.addEventListener("input", () => {
    localStorage.setItem("portalUserName", theoryName.value.trim().slice(0, 18));
  });
}

if (theoryText) {
  theoryText.setAttribute("maxlength", String(THEORY_MAX_LENGTH));
  theoryText.addEventListener("input", updateTheoryCounter);
}

if (theoryForm && theoryName && theoryText) {
  theoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const today = new Date().toISOString().slice(0, 10);
    const lastTheoryDate = localStorage.getItem("lastTheoryDate");

    if (lastTheoryDate === today) {
      showToast(getText("oneTheoryPerDay"));
      return;
    }

    const name = theoryName.value.trim().slice(0, 18);
    const text = theoryText.value.trim().slice(0, THEORY_MAX_LENGTH);

    if (!name || !text) return;

    await sendTheory(name, text);

    localStorage.setItem("lastTheoryDate", today);

    theoryText.value = "";
    updateTheoryCounter();
    theoryText.focus();
  });
}

document.addEventListener("click", (event) => {
  const clickedInsideLang = event.target.closest(".language-wrapper");
  const clickedInsideDownload = event.target.closest(".download-wrapper");
  const clickedInsideBackground = event.target.closest(".background-wrapper");
  const clickedInsideUpdateDate = event.target.closest(".update-date-wrapper");
  const clickedInsideTheme = event.target.closest(".theme-wrapper");
  const clickedInsidePortal = event.target.closest(".portal-wrapper");

  if (!clickedInsideLang && languageMenu) {
    languageMenu.classList.remove("open");
  }

  if (!clickedInsideDownload && downloadMenu) {
    downloadMenu.classList.remove("open");
  }

  if (!clickedInsideBackground && backgroundMenu) {
    backgroundMenu.classList.remove("open");
  }

  if (!clickedInsideUpdateDate && updateDateMenu) {
    updateDateMenu.classList.remove("open");
  }

  if (!clickedInsideTheme && themeMenu) {
    themeMenu.classList.remove("open");
  }

  if (!clickedInsidePortal && portalMenu) {
    portalMenu.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (languageMenu) languageMenu.classList.remove("open");
    if (downloadMenu) downloadMenu.classList.remove("open");
    if (backgroundMenu) backgroundMenu.classList.remove("open");
    if (updateDateMenu) updateDateMenu.classList.remove("open");
    if (themeMenu) themeMenu.classList.remove("open");
    if (portalMenu) portalMenu.classList.remove("open");
  }
});

const savedLang = localStorage.getItem("selectedLang") || "en";

async function bootPortal() {
  await initializeOwnerMode();
  await loadSharedCountdownConfig();
  await loadSharedThemeConfig();
  loadSavedBackground();
  setLanguage(savedLang);
  renderVideoHub();
  renderTheories();
  updateCountdown();
  updateTheoryCounter();
  setMode("countdown");
  setActiveSection(activeSection);

  countdownInterval = setInterval(updateCountdown, 1000);
  setInterval(renderTheories, 60000);
}

bootPortal();
