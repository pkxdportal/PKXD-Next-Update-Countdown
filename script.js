const targetDate = new Date("2026-07-30T13:00:00Z");
const eventStartDate = new Date("2026-07-09T00:00:00Z");

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
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const langToggle = document.getElementById("langToggle");
const languageMenu = document.getElementById("languageMenu");

const downloadToggle = document.getElementById("downloadToggle");
const downloadMenu = document.getElementById("downloadMenu");

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

const theoryName = document.getElementById("theoryName");
const theoryText = document.getElementById("theoryText");
const theoryCounter = document.getElementById("theoryCounter");
const theoryForm = document.getElementById("theoryForm");
const theorySubmitBtn = document.getElementById("theorySubmitBtn");
const userTheoriesList = document.getElementById("userTheoriesList");

const dailyIntro = document.getElementById("dailyIntro");
const skipIntroBtn = document.getElementById("skipIntroBtn");

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

function updateCountdown() {
  const now = new Date();
  const distance = targetDate.getTime() - now.getTime();

  if (distance <= 0) {
    if (countdownInterval) clearInterval(countdownInterval);

    if (timer) {
      timer.innerHTML = `
        <div class="started">
          ${getText("started")}
        </div>
      `;
    }

    updateProgress();
    return;
  }

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

  let percent = Math.round((passed / total) * 100);
  percent = Math.max(0, Math.min(100, percent));

  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";
  progressText.textContent = getText("progressText");
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

  updateProgress();
  updateTheoryCounter();
  renderVideoHub();
  renderTheories();

  if (languageMenu) languageMenu.classList.remove("open");
  if (downloadMenu) downloadMenu.classList.remove("open");
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
    .map((theory) => {
      const name = theory.name || "Player";
      const message = theory.message || theory.text || "";
      const createdAt =
        theory.time ||
        theory.createdAt ||
        theory.timestamp ||
        theory.date ||
        "";

      return `
        <div class="comm-message theory-message">
          <div class="comm-top">
            <strong>${escapeHtml(name)}</strong>
            <span>${formatTheoryTime(createdAt)}</span>
          </div>

          <p>${escapeHtml(message)}</p>
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
    portalMenu?.classList.remove("open");
  });
}

if (portalToggle) {
  portalToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    portalMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
    downloadMenu?.classList.remove("open");
  });
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const url = window.location.href.split("#")[0];

    try {
      await navigator.clipboard.writeText(url);
      alert(getText("shareCopied"));
    } catch (error) {
      console.warn("Could not copy link:", error);
      alert(getText("shareCopied"));
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
      alert(getText("oneTheoryPerDay"));
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
  const clickedInsidePortal = event.target.closest(".portal-wrapper");

  if (!clickedInsideLang && languageMenu) {
    languageMenu.classList.remove("open");
  }

  if (!clickedInsideDownload && downloadMenu) {
    downloadMenu.classList.remove("open");
  }

  if (!clickedInsidePortal && portalMenu) {
    portalMenu.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (languageMenu) languageMenu.classList.remove("open");
    if (downloadMenu) downloadMenu.classList.remove("open");
    if (portalMenu) portalMenu.classList.remove("open");
  }
});

const savedLang = localStorage.getItem("selectedLang") || "en";

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
