const targetDate = new Date("2026-06-11T13:00:00Z");
const eventStartDate = new Date("2025-06-26T00:00:00Z");

let currentLang = "en";
let lastSeconds = null;
let isPlaying = false;
let countdownInterval = null;
let currentPopupTeam = null;
let selectedTeam = localStorage.getItem("selectedTeam") || null;
let totalVotes = 0;
let isSendingComment = false;
let previewTheme = localStorage.getItem("previewTheme") || "default";

const COMMENT_MAX_LENGTH = 300;

const COMMENTS_API_URL =
  "https://script.google.com/macros/s/AKfycby7xTcqXuiBBDc4GyTzUTMO7WK_yfBkUgY94oyC400Vnqv1OgfN8Wgxiu5Srn9aO08/exec";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSWxR6NP3qLfM_-Fi_qoRjpgEA0qiUCUTze8P3XHmNea9ROrpIGMp2kKxd_5FaqZvNi3j28G1-nmlQ/pub?gid=747099020&single=true&output=csv";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd59BlXBH9tvS96vOtui6jvHhJyGLsFP0gJFZdW7-F1EtN-Nw/viewform?usp=dialog";

const GOOGLE_FORM_PREFILLED_URLS = {
  volts: "",
  flame: "",
  leaf: ""
};

/*
  ВИДЕО МЕНЯТЬ ЗДЕСЬ.

  Правило:
  https://youtu.be/sZszBFUDbt0?si=EeKDuwUQBumjEq5B
  videoId = "sZszBFUDbt0"

  https://youtube.com/shorts/cSBDn6gM2Fc?si=QGCXKXqoG852Sw6p
  videoId = "cSBDn6gM2Fc"

  Всё бесплатно. YouTube API не нужен.
*/

const PORTAL_VIDEOS = [
  {
    title: "WELCOME TO PK XD PORTAL",
    videoId: "sZszBFUDbt0",
    url: "https://youtu.be/sZszBFUDbt0?si=EeKDuwUQBumjEq5B"
  },
  {
    title: "⚡ PK XD Zero Gravity Countdown Has Started 🔥",
    videoId: "cSBDn6gM2Fc",
    url: "https://youtube.com/shorts/cSBDn6gM2Fc?si=QGCXKXqoG852Sw6p"
  },
  {
    title: "Who Will Win Zero Gravity 2026? 👀🔥⚡🍃",
    videoId: "8-JdJ_r6qZQ",
    url: "https://youtube.com/shorts/8-JdJ_r6qZQ?si=lFu3fKhWuJ8_ozTt"
  }
];

const COMMUNITY_VIDEOS = [
  {
    title: "ALL THE ZERO GRAVITY UPDATE IN PKXD 🤯✨",
    videoId: "PW3GhuICSv4",
    url: "https://youtu.be/PW3GhuICSv4?si=_Wlo4SiU6v4rJy-X"
  },
  {
    title: "NOVA ATUALIZAÇÃO GRAVIDADE ZERO 2026 NO PK XD",
    videoId: "iGo3KxKexBc",
    url: "https://youtu.be/iGo3KxKexBc?si=T4Bbawm1pr5v6wSK"
  },
  {
    title: "😦🌠 NEW UPDATE ALL SECRETS: Zero Gravity 2026 PK XD",
    videoId: "Jt2Ob6PaDxc",
    url: "https://youtu.be/Jt2Ob6PaDxc?si=Jq641GJAISLzoAaS"
  }
];

let teamEnergyData = {
  volts: 0,
  flame: 0,
  leaf: 0
};

let teamVoteCounts = {
  volts: 0,
  flame: 0,
  leaf: 0
};

const timer = document.getElementById("timer");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const popup = document.getElementById("teamPopup");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");
const closePopup = document.getElementById("closePopup");
const chooseTeamBtn = document.getElementById("chooseTeamBtn");

const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

const langToggle = document.getElementById("langToggle");
const languageMenu = document.getElementById("languageMenu");

const downloadToggle = document.getElementById("downloadToggle");
const downloadMenu = document.getElementById("downloadMenu");

const shareBtn = document.getElementById("shareBtn");
const themeToggle = document.getElementById("themeToggle");

const countdownModeBtn = document.getElementById("countdownModeBtn");
const progressModeBtn = document.getElementById("progressModeBtn");
const theoriesModeBtn = document.getElementById("theoriesModeBtn");

const progressPanel = document.getElementById("progressPanel");
const theoriesPanel = document.getElementById("theoriesPanel");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");

const selectedTeamText = document.getElementById("selectedTeamText");
const totalVotesText = document.getElementById("totalVotesText");

const voltsPercent = document.getElementById("voltsPercent");
const flamePercent = document.getElementById("flamePercent");
const leafPercent = document.getElementById("leafPercent");

const voteLeader = document.getElementById("voteLeader");
const teamActivatedToast = document.getElementById("teamActivatedToast");

const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentName = document.getElementById("commentName");
const commentText = document.getElementById("commentText");
const commentCounter = document.getElementById("commentCounter");
const commentSubmitBtn = document.getElementById("commentSubmitBtn");
const ratingStars = document.querySelectorAll(".rating-star");
let selectedRating = 0;

const averageStars = document.getElementById("averageStars");
const averageRating = document.getElementById("averageRating");
const ratingCount = document.getElementById("ratingCount");

const COMMENT_REACTIONS = [
  { key: "volts", icon: "icon-volts.png", fallback: "⚡" },
  { key: "flame", icon: "icon-flame.png", fallback: "🔥" },
  { key: "leaf", icon: "icon-leaf.png", fallback: "🍃" },
  { key: "eyes", icon: "icon-eyes.png", fallback: "👀" },
  { key: "laugh", icon: "icon-laugh.png", fallback: "😂" },
  { key: "love", icon: "icon-love.png", fallback: "💖" }
];

let isSendingReaction = false;
let activeReactionCommentId = null;
let activeReactionMenu = null;
let longPressTimer = null;

const COMMENT_USER_KEY =
  localStorage.getItem("commentUserKey") ||
  "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 12);

localStorage.setItem("commentUserKey", COMMENT_USER_KEY);

function getText(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function getTeamData(team) {
  return translations[currentLang]?.teams?.[team] || translations.en.teams[team];
}

function getTeamIconSrc(team) {
  const icons = {
    volts: "icon-volts.png",
    flame: "icon-flame.png",
    leaf: "icon-leaf.png"
  };

  return icons[team] || "";
}

function getTeamIconHtml(team, className = "inline-team-icon") {
  const src = getTeamIconSrc(team);

  if (!src) return "";

  return `<img src="${src}" class="${className}" alt="" />`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

  if (commentName) {
    commentName.placeholder = getText("commentNamePlaceholder");
  }

  if (commentText) {
    commentText.placeholder = getText("commPlaceholder");
  }

  document.querySelectorAll("#languageMenu .lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });

  updateMusicButton();
  updateProgress();
  updateTeamEnergy();
  updateChooseButton();
  updateCommentCounter();
  renderVideoHub();
  renderComments();

  if (languageMenu) languageMenu.classList.remove("open");
  if (downloadMenu) downloadMenu.classList.remove("open");
}

function setMode(mode) {
  if (!timer || !progressPanel || !theoriesPanel) return;

  timer.classList.toggle("hidden", mode !== "countdown");
  progressPanel.classList.toggle("active", mode === "progress");
  theoriesPanel.classList.toggle("active", mode === "theories");

  countdownModeBtn?.classList.toggle("active", mode === "countdown");
  progressModeBtn?.classList.toggle("active", mode === "progress");
  theoriesModeBtn?.classList.toggle("active", mode === "theories");
}

function openPopup(team) {
  const data = getTeamData(team);

  if (!data || !popup) return;

  currentPopupTeam = team;

  popup.className = "team-popup active " + team;
  popup.setAttribute("aria-hidden", "false");

  if (popupIcon) {
    popupIcon.innerHTML = getTeamIconHtml(team, "popup-team-icon");
  }

  if (popupTitle) popupTitle.textContent = data.title;
  if (popupText) popupText.textContent = data.text;

  document.body.classList.remove("team-volts", "team-flame", "team-leaf");
  document.body.classList.add("team-" + team);

  updateChooseButton();
}

function closeTeamPopup() {
  if (!popup) return;

  popup.className = "team-popup";
  popup.setAttribute("aria-hidden", "true");

  document.body.classList.remove("team-volts", "team-flame", "team-leaf");

  applyPreviewTheme();

  currentPopupTeam = null;
}

function chooseTeam(team) {
  if (!team || !translations.en.teams[team]) return;

  selectedTeam = team;
  localStorage.setItem("selectedTeam", selectedTeam);

  applySelectedTeamTheme();
  applyPreviewTheme();
  updateTeamEnergy();
  updateChooseButton();
  closeTeamPopup();
  showTeamActivated(team);

  const voteUrl = GOOGLE_FORM_PREFILLED_URLS[team] || GOOGLE_FORM_URL;

  if (voteUrl) {
    window.open(voteUrl, "_blank", "noopener,noreferrer");
  }
}

function applySelectedTeamTheme() {
  document.body.classList.remove(
    "selected-volts",
    "selected-flame",
    "selected-leaf"
  );

  document.querySelectorAll(".team-btn").forEach((button) => {
    button.classList.remove("selected");
  });

  if (selectedTeam) {
    const selectedButton = document.querySelector(`.team-btn[data-team="${selectedTeam}"]`);

    if (selectedButton) {
      selectedButton.classList.add("selected");
    }
  }

  applyPreviewTheme();
}

function applyPreviewTheme() {
  document.body.classList.remove(
    "team-volts",
    "team-flame",
    "team-leaf",
    "selected-volts",
    "selected-flame",
    "selected-leaf"
  );

  if (previewTheme !== "default") {
    document.body.classList.add("selected-" + previewTheme);
  }

  if (themeToggle) {
    const icons = {
      default: "🌀",
      volts: '<img src="icon-volts.png" class="top-team-icon" alt="Volts" />',
      flame: '<img src="icon-flame.png" class="top-team-icon" alt="Flame" />',
      leaf: '<img src="icon-leaf.png" class="top-team-icon" alt="Leaf" />'
    };

    themeToggle.innerHTML = icons[previewTheme] || icons.default;
  }
}

function updateChooseButton() {
  if (!chooseTeamBtn || !currentPopupTeam) return;

  if (selectedTeam === currentPopupTeam) {
    chooseTeamBtn.textContent = getText("teamAlreadySelected");
    chooseTeamBtn.disabled = true;
  } else {
    chooseTeamBtn.textContent = getText("chooseTeamBtn");
    chooseTeamBtn.disabled = false;
  }
}

function updateTeamEnergy() {
  if (voltsPercent) voltsPercent.textContent = teamEnergyData.volts + "%";
  if (flamePercent) flamePercent.textContent = teamEnergyData.flame + "%";
  if (leafPercent) leafPercent.textContent = teamEnergyData.leaf + "%";

  if (totalVotesText) {
    totalVotesText.textContent = `${getText("totalVotes")} ${totalVotes}`;
  }

  const voltsFill = document.querySelector(".energy-row.volts .energy-fill");
  const flameFill = document.querySelector(".energy-row.flame .energy-fill");
  const leafFill = document.querySelector(".energy-row.leaf .energy-fill");

  if (voltsFill) voltsFill.style.width = teamEnergyData.volts + "%";
  if (flameFill) flameFill.style.width = teamEnergyData.flame + "%";
  if (leafFill) leafFill.style.width = teamEnergyData.leaf + "%";

  document.querySelectorAll(".energy-row").forEach((row) => {
    row.classList.remove("selected");
  });

  if (!selectedTeam) {
    if (selectedTeamText) {
      selectedTeamText.textContent = getText("noTeamSelected");
    }

    updateVoteLeader();
    return;
  }

  const team = getTeamData(selectedTeam);

  if (selectedTeamText && team) {
    selectedTeamText.innerHTML = `
      ${escapeHtml(getText("selectedTeamPrefix"))}
      ${getTeamIconHtml(selectedTeam)}
      ${escapeHtml(team.title)}
    `;
  }

  const selectedEnergyRow = document.querySelector(`.energy-row.${selectedTeam}`);

  if (selectedEnergyRow) {
    selectedEnergyRow.classList.add("selected");
  }

  updateVoteLeader();
}

function updateVoteLeader() {
  if (!voteLeader) return;

  const teams = [
    { key: "volts", value: teamEnergyData.volts },
    { key: "flame", value: teamEnergyData.flame },
    { key: "leaf", value: teamEnergyData.leaf }
  ];

  const leader = teams.reduce((max, team) => {
    return team.value > max.value ? team : max;
  }, teams[0]);

  const leaderData = getTeamData(leader.key);

  if (!leaderData || leader.value <= 0 || totalVotes <= 0) {
    voteLeader.textContent = `${getText("currentLeader")} —`;
    return;
  }

  voteLeader.innerHTML = `
    ${escapeHtml(getText("currentLeader"))}
    ${getTeamIconHtml(leader.key)}
    ${escapeHtml(leaderData.title)} — ${leader.value}%
  `;
}

function showTeamActivated(team) {
  if (!teamActivatedToast) return;

  const teamData = getTeamData(team);

  if (!teamData) return;

  teamActivatedToast.innerHTML = `
    ${getTeamIconHtml(team)}
    ${escapeHtml(teamData.title)}
    ${escapeHtml(getText("teamActivated"))}
  `;

  teamActivatedToast.className = "team-activated-toast show " + team;
  teamActivatedToast.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    teamActivatedToast.className = "team-activated-toast";
    teamActivatedToast.setAttribute("aria-hidden", "true");
  }, 1800);
}

function normalizeTeamName(value) {
  const team = String(value || "").trim().toLowerCase();

  if (team.includes("volt") || team.includes("молн")) return "volts";
  if (team.includes("flame") || team.includes("fire") || team.includes("плам")) return "flame";
  if (team.includes("leaf") || team.includes("лист")) return "leaf";

  return team;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

async function loadTeamEnergyFromSheet() {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL + "&cache=" + Date.now());

    if (!response.ok) {
      throw new Error("Could not load team stats");
    }

    const csvText = await response.text();

    teamEnergyData = { volts: 0, flame: 0, leaf: 0 };
    teamVoteCounts = { volts: 0, flame: 0, leaf: 0 };
    totalVotes = 0;

    if (!csvText.trim()) {
      updateTeamEnergy();
      return;
    }

    const rows = csvText
      .trim()
      .split(/\r?\n/)
      .map(parseCsvLine);

    rows.slice(1).forEach((row) => {
      const team = normalizeTeamName(row[0]);
      const count = Number(String(row[1] || "0").replace("%", "").trim());
      const percent = Number(String(row[2] || "0").replace("%", "").trim());

      if (Object.prototype.hasOwnProperty.call(teamEnergyData, team)) {
        teamVoteCounts[team] = Number.isNaN(count) ? 0 : count;
        teamEnergyData[team] = Number.isNaN(percent) ? 0 : percent;
      }
    });

    totalVotes =
      teamVoteCounts.volts +
      teamVoteCounts.flame +
      teamVoteCounts.leaf;

    updateTeamEnergy();
  } catch (error) {
    console.warn("Team stats could not be loaded. Using local fallback.", error);
    updateTeamEnergy();
  }
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
  const watchMore = document.querySelector(".watch-more");

  if (videoHub) {
    const oldPortalGrid = videoHub.querySelector(".video-section:nth-of-type(1) .video-grid");
    const oldCommunityGrid = videoHub.querySelector(".video-section:nth-of-type(2) .video-grid");

    if (oldPortalGrid) {
      oldPortalGrid.innerHTML = PORTAL_VIDEOS.map(createVideoCard).join("");
    }

    if (oldCommunityGrid) {
      oldCommunityGrid.innerHTML = COMMUNITY_VIDEOS.map(createVideoCard).join("");
    }

    const portalTitle = videoHub.querySelector(".video-section:nth-of-type(1) h3");
    const communityTitle = videoHub.querySelector(".video-section:nth-of-type(2) h3");

    if (portalTitle) portalTitle.textContent = getText("portalVideoSectionTitle");
    if (communityTitle) communityTitle.textContent = getText("communityVideoSectionTitle");

    return;
  }

  if (!watchMore) return;

  const oldVideoSections = watchMore.querySelector(".video-sections");
  if (oldVideoSections) oldVideoSections.remove();

  const videoSections = document.createElement("div");
  videoSections.className = "video-sections";

  videoSections.innerHTML = `
    <div class="video-group">
      <h4>${getText("portalVideoSectionTitle")}</h4>
      <div class="video-grid">
        ${PORTAL_VIDEOS.map(createVideoCard).join("")}
      </div>
    </div>

    <div class="video-group">
      <h4>${getText("communityVideoSectionTitle")}</h4>
      <div class="video-grid">
        ${COMMUNITY_VIDEOS.map(createVideoCard).join("")}
      </div>
    </div>
  `;

  watchMore.appendChild(videoSections);
}

function updateMusicButton() {
  if (!musicToggle) return;

  musicToggle.innerHTML = isPlaying ? getText("musicOff") : getText("musicOn");
  musicToggle.classList.toggle("active", isPlaying);
  musicToggle.setAttribute("aria-label", isPlaying ? "Turn music off" : "Turn music on");
}

function updateCommentCounter() {
  if (!commentText || !commentCounter) return;

  const length = commentText.value.length;
  const left = Math.max(0, COMMENT_MAX_LENGTH - length);

  commentCounter.textContent = `${length} / ${COMMENT_MAX_LENGTH}`;

  commentCounter.classList.toggle("warning", left <= 60 && left > 0);
  commentCounter.classList.toggle("limit", left === 0);
}

async function getStoredComments() {
  try {
    const url =
      COMMENTS_API_URL +
      "?cache=" + Date.now() +
      "&userKey=" + encodeURIComponent(COMMENT_USER_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not load comments");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.warn("Comments could not be loaded:", error);
    return [];
  }
}

function updateAverageRating(comments) {
  if (!averageStars || !averageRating || !ratingCount) return;

  const ratings = comments
    .map((comment) => Number(comment.rating || 0))
    .filter((rating) => rating >= 1 && rating <= 5);

  if (!ratings.length) {
    averageStars.textContent = "☆☆☆☆☆";
    averageRating.textContent = "0.0 / 5";
    ratingCount.textContent = getText("ratingCountEmpty");
    return;
  }

  const sum = ratings.reduce((total, rating) => total + rating, 0);
  const average = sum / ratings.length;
  const rounded = Math.round(average);

  averageStars.textContent =
    "★".repeat(rounded) + "☆".repeat(5 - rounded);

  averageRating.textContent = `${average.toFixed(1)} / 5`;
  ratingCount.textContent = getText("ratingCountText").replace("{count}", ratings.length);
}

function formatCommentTime(timestamp) {
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

function getReactionIconHtml(reaction) {
  return `
    <span class="reaction-icon-wrap">
      <img
        src="${reaction.icon}"
        class="reaction-icon"
        alt=""
        onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
      />
      <span class="reaction-fallback">${reaction.fallback}</span>
    </span>
  `;
}

function createReactionSummary(comment) {
  const reactions = comment.reactions || {};
  const myReaction = comment.myReaction || "";

  const activeReactions = COMMENT_REACTIONS
    .map((reaction) => {
      const count = Number(reactions[reaction.key] || 0);

      if (count <= 0) return "";

      return `
        <span
          class="reaction-summary-item ${myReaction === reaction.key ? "mine" : ""}"
          data-reaction="${escapeHtml(reaction.key)}"
        >
          ${getReactionIconHtml(reaction)}
          <span class="reaction-summary-count">${count}</span>
        </span>
      `;
    })
    .filter(Boolean)
    .join("");

  return `
    <div class="reaction-summary">
      <div class="reaction-summary-list">
        ${activeReactions}
      </div>

      <button
        type="button"
        class="reaction-open-btn"
        data-comment-id="${escapeHtml(comment.id || "")}"
        aria-label="React"
      >
        ＋
      </button>
    </div>
  `;
}

function closeReactionMenu() {
  if (activeReactionMenu) {
    activeReactionMenu.remove();
    activeReactionMenu = null;
    activeReactionCommentId = null;
  }
}

function openReactionMenu(commentId, targetElement) {
  if (!commentId || !targetElement) return;

  closeReactionMenu();

  activeReactionCommentId = commentId;

  const menu = document.createElement("div");
  menu.className = "reaction-menu";
  menu.innerHTML = COMMENT_REACTIONS.map((reaction) => {
    return `
      <button
        type="button"
        class="reaction-menu-btn"
        data-reaction="${escapeHtml(reaction.key)}"
        aria-label="${escapeHtml(reaction.key)} reaction"
      >
        ${getReactionIconHtml(reaction)}
      </button>
    `;
  }).join("");

  document.body.appendChild(menu);

  const rect = targetElement.getBoundingClientRect();
  const menuWidth = 280;

  let left = rect.left + rect.width / 2 - menuWidth / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - menuWidth - 12));

  let top = rect.top - 58;

  if (top < 12) {
    top = rect.bottom + 10;
  }

  menu.style.left = left + "px";
  menu.style.top = top + "px";

  activeReactionMenu = menu;
}

async function sendReaction(commentId, reactionKey) {
  if (!commentId || !reactionKey || isSendingReaction) return;

  isSendingReaction = true;
  closeReactionMenu();

  const messageEl =
    document.querySelector(`.comm-message[data-comment-id="${CSS.escape(commentId)}"]`) ||
    document.querySelector(`.comm-reply[data-comment-id="${CSS.escape(commentId)}"]`);

  if (messageEl) {
    const summaryList = messageEl.querySelector(".reaction-summary-list");

    if (summaryList) {
      const currentMine = summaryList.querySelector(".reaction-summary-item.mine");
      const currentMineReaction = currentMine?.dataset?.reaction || "";
      const sameReaction = currentMineReaction === reactionKey;

      if (currentMine) {
        const currentCountEl = currentMine.querySelector(".reaction-summary-count");
        const currentCount = Number(currentCountEl?.textContent || 0);
        const nextCount = Math.max(0, currentCount - 1);

        if (nextCount <= 0) {
          currentMine.remove();
        } else {
          currentMine.classList.remove("mine");

          if (currentCountEl) {
            currentCountEl.textContent = String(nextCount);
          }
        }
      }

      if (!sameReaction) {
        const reaction = COMMENT_REACTIONS.find((item) => item.key === reactionKey);

        if (reaction) {
          let targetItem = summaryList.querySelector(
            `.reaction-summary-item[data-reaction="${reactionKey}"]`
          );

          if (targetItem) {
            const countEl = targetItem.querySelector(".reaction-summary-count");
            const currentCount = Number(countEl?.textContent || 0);

            targetItem.classList.add("mine");

            if (countEl) {
              countEl.textContent = String(currentCount + 1);
            }
          } else {
            summaryList.insertAdjacentHTML("beforeend", `
              <span class="reaction-summary-item mine" data-reaction="${escapeHtml(reactionKey)}">
                ${getReactionIconHtml(reaction)}
                <span class="reaction-summary-count">1</span>
              </span>
            `);
          }
        }
      }
    }
  }

  try {
    await fetch(COMMENTS_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "react",
        id: commentId,
        reaction: reactionKey,
        userKey: COMMENT_USER_KEY
      })
    });

    window.setTimeout(() => {
      renderComments();
    }, 700);
  } catch (error) {
    console.warn("Reaction could not be sent:", error);
  } finally {
    window.setTimeout(() => {
      isSendingReaction = false;
    }, 350);
  }
}

async function renderComments() {
  if (!commentsList) return;

  const comments = await getStoredComments();

  updateAverageRating(comments);

  if (!comments.length) {
    commentsList.innerHTML = `
      <div class="comment-empty">
        ${escapeHtml(getText("noCommentsYet"))}
      </div>
    `;
    return;
  }

  commentsList.innerHTML = comments
    .slice(0, 30)
    .map((comment) => {
      const name = comment.name || "Player";
      const message = comment.message || comment.text || "";
      const createdAt =
        comment.time ||
        comment.createdAt ||
        comment.timestamp ||
        comment.date ||
        "";

      const rating = Number(comment.rating || 0);
      const stars = rating > 0 ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";

      return `
        <div class="comm-message" data-comment-id="${escapeHtml(comment.id || "")}">
          <div class="comm-top">
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(stars)} ${formatCommentTime(createdAt)}</span>
          </div>

          <p>${escapeHtml(message)}</p>

          ${createReactionSummary(comment)}
        </div>
      `;
    })
    .join("");
}

async function addComment(name, text) {
  const cleanName = String(name || "").trim().slice(0, 18);
  const cleanText = String(text || "").trim().slice(0, COMMENT_MAX_LENGTH);
  const cleanRating = Number(selectedRating || 0);

  if (!cleanName || !cleanText || isSendingComment) return;

  isSendingComment = true;

  if (commentSubmitBtn) {
    commentSubmitBtn.disabled = true;
    commentSubmitBtn.textContent = "…";
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
        rating: cleanRating
      })
    });

    window.setTimeout(() => {
      renderComments();
    }, 1800);
  } catch (error) {
    console.warn("Comment could not be sent:", error);
  } finally {
    window.setTimeout(() => {
      isSendingComment = false;

      if (commentSubmitBtn) {
        commentSubmitBtn.disabled = false;
        commentSubmitBtn.textContent = "➤";
      }
    }, 1200);
  }
}

function updateRatingStars() {
  ratingStars.forEach((star) => {
    const value = Number(star.dataset.rating);
    star.classList.toggle("active", selectedRating > 0 && value <= selectedRating);
  });
}

ratingStars.forEach((star) => {
  star.addEventListener("click", () => {
    const clickedRating = Number(star.dataset.rating) || 0;

    if (selectedRating === clickedRating) {
      selectedRating = 0;
    } else {
      selectedRating = clickedRating;
    }

    updateRatingStars();
  });
});

updateRatingStars();

document.querySelectorAll(".theories-grid").forEach((element) => {
  element.classList.add("theory-grid");
});

document.querySelectorAll(".team-btn").forEach((button) => {
  button.addEventListener("click", () => {
    openPopup(button.dataset.team);
  });
});

document.querySelectorAll("#languageMenu .lang-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

if (closePopup) {
  closePopup.addEventListener("click", closeTeamPopup);
}

if (chooseTeamBtn) {
  chooseTeamBtn.addEventListener("click", () => {
    chooseTeam(currentPopupTeam);
  });
}

if (langToggle) {
  langToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    languageMenu?.classList.toggle("open");
    downloadMenu?.classList.remove("open");
  });
}

if (downloadToggle) {
  downloadToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadMenu?.classList.toggle("open");
    languageMenu?.classList.remove("open");
  });
}

document.addEventListener("click", (event) => {
  const clickedInsidePopup = popup?.contains(event.target);
  const clickedTeamButton = event.target.closest(".team-btn");
  const clickedInsideLang = event.target.closest(".language-wrapper");
  const clickedInsideDownload = event.target.closest(".download-wrapper");

  if (
    popup &&
    popup.classList.contains("active") &&
    !clickedInsidePopup &&
    !clickedTeamButton
  ) {
    closeTeamPopup();
  }

  if (!clickedInsideLang && languageMenu) {
    languageMenu.classList.remove("open");
  }

  if (!clickedInsideDownload && downloadMenu) {
    downloadMenu.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTeamPopup();

    if (languageMenu) languageMenu.classList.remove("open");
    if (downloadMenu) downloadMenu.classList.remove("open");
  }
});

if (musicToggle && music) {
  musicToggle.addEventListener("click", () => {
    if (!isPlaying) {
      music.play().then(() => {
        isPlaying = true;
        updateMusicButton();
      }).catch((error) => {
        console.warn("Music could not be started:", error);
      });
    } else {
      music.pause();
      isPlaying = false;
      updateMusicButton();
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

if (theoriesModeBtn) {
  theoriesModeBtn.addEventListener("click", () => {
    setMode("theories");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const themes = ["default", "volts", "flame", "leaf"];
    const currentIndex = themes.indexOf(previewTheme);
    const nextIndex = (currentIndex + 1) % themes.length;

    previewTheme = themes[nextIndex];
    localStorage.setItem("previewTheme", previewTheme);

    applyPreviewTheme();
  });
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert(getText("shareCopied"));
      }
    } catch (error) {
      await navigator.clipboard.writeText(url);
      alert(getText("shareCopied"));
    }
  });
}

if (commentText) {
  commentText.setAttribute("maxlength", String(COMMENT_MAX_LENGTH));

  commentText.addEventListener("input", () => {
    updateCommentCounter();
  });
}

if (commentsList) {
  commentsList.addEventListener("click", (event) => {
    const summaryItem = event.target.closest(".reaction-summary-item.mine");

    if (summaryItem) {
      event.stopPropagation();

      const message = summaryItem.closest(".comm-message, .comm-reply");
      const commentId = message?.dataset?.commentId;
      const reactionKey = summaryItem.dataset.reaction;

      sendReaction(commentId, reactionKey);
      return;
    }

    const openButton = event.target.closest(".reaction-open-btn");

    if (openButton) {
      event.stopPropagation();

      const commentId = openButton.dataset.commentId;
      openReactionMenu(commentId, openButton);
      return;
    }
  });

  commentsList.addEventListener("contextmenu", (event) => {
    const message = event.target.closest(".comm-message, .comm-reply");

    if (!message) return;

    event.preventDefault();

    const commentId = message.dataset.commentId;

    openReactionMenu(commentId, message);
  });

  commentsList.addEventListener("touchstart", (event) => {
    const message = event.target.closest(".comm-message, .comm-reply");

    if (!message) return;

    longPressTimer = window.setTimeout(() => {
      openReactionMenu(message.dataset.commentId, message);
    }, 520);
  }, { passive: true });

  commentsList.addEventListener("touchend", () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  });

  commentsList.addEventListener("touchmove", () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  });
}

document.addEventListener("click", (event) => {
  const clickedReactionMenu = event.target.closest(".reaction-menu");
  const clickedReactionOpen = event.target.closest(".reaction-open-btn");

  if (!clickedReactionMenu && !clickedReactionOpen) {
    closeReactionMenu();
  }
});

document.addEventListener("click", (event) => {
  const reactionMenuButton = event.target.closest(".reaction-menu-btn");

  if (!reactionMenuButton || !activeReactionCommentId) return;

  const reactionKey = reactionMenuButton.dataset.reaction;

  sendReaction(activeReactionCommentId, reactionKey);
});

if (commentForm && commentName && commentText) {
  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await addComment(commentName.value, commentText.value);

    commentText.value = "";
    selectedRating = 0;
    updateRatingStars();
    updateCommentCounter();
    commentText.focus();
  });
}

const savedLang = localStorage.getItem("selectedLang") || "en";

setLanguage(savedLang);
applySelectedTeamTheme();
applyPreviewTheme();
updateTeamEnergy();
renderVideoHub();
renderComments();
loadTeamEnergyFromSheet();
updateCountdown();
updateCommentCounter();
setMode("countdown");

countdownInterval = setInterval(updateCountdown, 1000);
setInterval(loadTeamEnergyFromSheet, 60000);
setInterval(renderComments, 60000);
