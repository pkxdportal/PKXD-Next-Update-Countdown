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

let currentLang = "en";
let lastSeconds = null;
let countdownInterval = null;
let activeSection = localStorage.getItem("activeSection") || "countdownSection";
let isSendingTheory = false;

const COMMENTS_API_URL =
  "https://script.google.com/macros/s/AKfycbyApSkcMeOYFBS88Ich9qX18M4_3o9IunaY-NpecRVeLsF4koKWgy6Xc7bU8MF6XLUl/exec";

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

const dailyIntro = document.getElementById("dailyIntro");
const skipIntroBtn = document.getElementById("skipIntroBtn");
const portalToast = document.getElementById("portalToast");
const cursorGlow = document.querySelector(".cursor-glow");

const CUSTOM_BACKGROUND_KEY = "portalCustomBackground";
const OWNER_MODE_KEY = "pkxdPortalOwnerMode";
const OWNER_QUERY_PARAM = "ownerKey";
const OWNER_KEY_HASH = "8a66f2428ac63682e0b48c89e142b7c7a762255823e06c47f8d7591c0d12c649";
const ownerBackgroundControl = document.getElementById("ownerBackgroundControl");
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

function applyCustomBackground(imageUrl) {
  if (!backgroundLayer) return;

  if (imageUrl) {
    backgroundLayer.style.backgroundImage = `url("${imageUrl}")`;
    backgroundLayer.style.backgroundPosition = "center center";
    backgroundLayer.style.backgroundSize = "cover";
    backgroundLayer.style.backgroundRepeat = "no-repeat";
    backgroundLayer.style.backgroundAttachment = "fixed";
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

function loadSavedBackground() {
  if (!isOwnerMode) {
    applyCustomBackground("");
    return;
  }

  const savedImage = localStorage.getItem(CUSTOM_BACKGROUND_KEY);
  if (savedImage) applyCustomBackground(savedImage);
}

function saveCustomBackground(imageUrl) {
  if (!isOwnerMode) return;

  try {
    localStorage.setItem(CUSTOM_BACKGROUND_KEY, imageUrl);
    applyCustomBackground(imageUrl);
    showToast(getText("backgroundSaved"));
  } catch (error) {
    console.warn("Background could not be saved:", error);
    showToast(getText("backgroundTooLarge"));
  }
}

function resetCustomBackground() {
  if (!isOwnerMode) return;

  localStorage.removeItem(CUSTOM_BACKGROUND_KEY);
  applyCustomBackground("");
  showToast(getText("backgroundReset"));
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

function getNextMondayAfter(date) {
  const nextMonday = new Date(date);
  nextMonday.setHours(0, 0, 0, 0);

  const day = nextMonday.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;

  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  return nextMonday;
}

function getCurrentUpdateCycle(now) {
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
  const targetId = sectionId || "countdownSection";

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

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shouldShowIntroToday() {
  const today = getTodayKey();
  const lastIntroDate = localStorage.getItem("nextUpdateIntroDate");

  return lastIntroDate !== today;
}

function hideDailyIntro() {
  if (!dailyIntro) return;

  dailyIntro.classList.remove("show");
  dailyIntro.classList.add("hide");
  dailyIntro.setAttribute("aria-hidden", "true");

  localStorage.setItem("nextUpdateIntroDate", getTodayKey());

  window.setTimeout(() => {
    dailyIntro.style.display = "none";
  }, 650);
}

function showDailyIntro() {
  if (!dailyIntro) return;

  if (!shouldShowIntroToday()) {
    dailyIntro.style.display = "none";
    return;
  }

  dailyIntro.style.display = "grid";
  dailyIntro.classList.remove("hide");
  dailyIntro.classList.add("show");
  dailyIntro.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    hideDailyIntro();
  }, 4200);
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

async function renderTheories() {
  if (!userTheoriesList) return;

  const theories = await getStoredTheories();

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
    portalMenu?.classList.remove("open");
  });
}

if (downloadToggle) {
  downloadToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    backgroundMenu?.classList.remove("open");
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
    portalMenu?.classList.remove("open");
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

if (skipIntroBtn) {
  skipIntroBtn.addEventListener("click", () => {
    hideDailyIntro();
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

  if (!clickedInsidePortal && portalMenu) {
    portalMenu.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (languageMenu) languageMenu.classList.remove("open");
    if (downloadMenu) downloadMenu.classList.remove("open");
    if (backgroundMenu) backgroundMenu.classList.remove("open");
    if (portalMenu) portalMenu.classList.remove("open");
  }
});

const savedLang = localStorage.getItem("selectedLang") || "en";

async function bootPortal() {
  await initializeOwnerMode();
  loadSavedBackground();
  setLanguage(savedLang);
  renderVideoHub();
  renderTheories();
  updateCountdown();
  updateTheoryCounter();
  setMode("countdown");
  setActiveSection(activeSection);
  showDailyIntro();

  countdownInterval = setInterval(updateCountdown, 1000);
  setInterval(renderTheories, 60000);
}

bootPortal();
