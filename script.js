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

const COMMENT_MAX_LENGTH = 300;

const COMMENTS_API_URL =
  "https://script.google.com/macros/s/AKfycbwrHPXsWqy71GDFN-WmbhBbWwQo3WU_duQr1AjXuW9oTKp8s5m6VgtSizytMVYEgX3G/exec";

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

const translations = {
  en: {
    eventDate: "JUNE 11, 2026 • 09:00 NEW YORK",
    titleTop: "Until",
    titleMain: "Zero Gravity",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    credit: "Website created by <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicLabel: "Music",
    musicOn: "🔊",
    musicOff: "🔇",
    started: "🚀 Zero Gravity has begun",
    fanCountdown: "Fan countdown for PK XD",
    disclaimer: "This is a fan-made countdown created by PK XD PORTAL for the community. PK XD, the PK XD logo, the background image and the music belong to Afterverse. This site is not official and is not affiliated with Afterverse.",
    dateNote: "The countdown date is based on community speculation and logical observation, since Zero Gravity events usually appear in June. The date may change if official information is announced.",
    feedbackText: "For website improvements, new languages, questions, or contact requests, message us through one of our social links above.",
    afterverseContact: "If someone from Afterverse sees this site and wants us to change, credit, remove, or adjust anything, please contact us through our social links. We will gladly cooperate to keep the project respectful and within the rules.",
    downloadTitle: "Download / Update PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Language",
    downloadLabel: "Download",
    shareLabel: "Share",
    countdownMode: "Countdown",
    progressMode: "Progress",
    theoriesMode: "Theories",
    progressPassed: "Passed",
    progressLeft: "Left",
    progressText: "Event progress",
    shareCopied: "Link copied!",
    teamEnergyTitle: "ZERO GRAVITY TEAM VOTE 2026",
    noTeamSelected: "Choose your team to activate its energy.",
    chooseTeamBtn: "Choose Team",
    selectedTeamPrefix: "Your team:",
    teamAlreadySelected: "Selected",
    voteStatus: "Votes update automatically from the community form.",
    changeVoteText: "Need to change your vote? Contact PK XD PORTAL.",
    currentLeader: "Current leader:",
    totalVotes: "Total votes:",
    teamActivated: "activated",
    voteVolts: "⚡ Vote Volts",
    voteFlame: "🔥 Vote Flame",
    voteLeaf: "🍃 Vote Leaf",
    theoriesTitle: "ZERO GRAVITY THEORIES",
    theoriesSubtitle: "Fan theories by PK XD PORTAL. Nothing here is official.",
    theoryGravityTitle: "New gravity mechanics",
    theoryGravityText: "Players may float, jump higher or move differently during the event.",
    theoryItemsTitle: "Space-style items",
    theoryItemsText: "The update could bring space outfits, effects, pets or vehicles.",
    theoryTeamsTitle: "Team energy",
    theoryTeamsText: "Volts, Flame and Leaf may be connected to the event theme.",
    theoryGamesTitle: "New mini-games",
    theoryGamesText: "The event may include flying, floating or low-gravity challenges.",
    theoryMapTitle: "Map changes",
    theoryMapText: "The island may receive temporary Zero Gravity decorations.",
    theoryRewardsTitle: "Special rewards",
    theoryRewardsText: "There may be limited rewards connected to the event.",
    videoHubTitle: "ZERO GRAVITY VIDEO HUB",
    videoHubText: "Watch PK XD PORTAL updates and selected community videos about Zero Gravity.",
    watchMoreTitle: "ZERO GRAVITY VIDEO HUB",
    watchMoreText: "Watch PK XD PORTAL updates and selected community videos about Zero Gravity.",
    portalVideosBtn: "View all",
    zeroGravityVideosBtn: "View all",
    portalVideosTitle: "PK XD PORTAL Videos",
    communityVideosTitle: "Community Zero Gravity Videos",
    portalVideoSectionTitle: "PK XD PORTAL Videos",
    communityVideoSectionTitle: "Community Zero Gravity Videos",
    communityCommsTitle: "Community Comms",
    communityCommsText: "Write a message for the Zero Gravity community.",
    commentNamePlaceholder: "Your name",
    commPlaceholder: "Transmit your message to the community...",
    commentsLocalNote: "Messages are visible to everyone after sending.",
    noCommentsYet: "No messages yet. Be the first.",
    teams: {
      volts: {
        icon: "⚡",
        title: "TEAM VOLTS",
        text: "PURE LIGHTNING ENERGY! I am full of joy and energy!"
      },
      flame: {
        icon: "🔥",
        title: "TEAM FLAME",
        text: "THE INTENSITY OF FLAME! I am warm and fierce!"
      },
      leaf: {
        icon: "🍃",
        title: "TEAM LEAF",
        text: "THE POWER INSIDE EVERY LEAF! I am righteous and strong, like nature!"
      }
    }
  },

  ru: {
    eventDate: "11 ИЮНЯ 2026 • 16:00 МОСКВА",
    titleTop: "До начала",
    titleMain: "Невесомости",
    days: "дней",
    hours: "часов",
    minutes: "минут",
    seconds: "секунд",
    credit: "Сайт создан командой <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicLabel: "Музыка",
    musicOn: "🔊",
    musicOff: "🔇",
    started: "🚀 Невесомость началась",
    fanCountdown: "Фанатский отсчёт для PK XD",
    disclaimer: "Это фанатский отсчёт, созданный PK XD PORTAL для сообщества. PK XD, логотип PK XD, фоновое изображение и музыка принадлежат Afterverse. Этот сайт не является официальным и не связан с Afterverse.",
    dateNote: "Дата отсчёта основана на предположении сообщества и логическом наблюдении, потому что события Невесомости обычно появляются в июне. Дата может измениться, если появится официальная информация.",
    feedbackText: "По вопросам улучшения сайта, новых языков, вопросов или связи пишите нам через одну из социальных ссылок выше.",
    afterverseContact: "Если кто-то из Afterverse увидит этот сайт и захочет, чтобы мы что-то изменили, указали авторство, удалили или исправили, пожалуйста, свяжитесь с нами через наши социальные ссылки. Мы с радостью пойдём навстречу, чтобы проект оставался уважительным и соответствовал правилам.",
    downloadTitle: "Скачать / обновить PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Язык",
    downloadLabel: "Скачать",
    shareLabel: "Поделиться",
    countdownMode: "Отсчёт",
    progressMode: "Прогресс",
    theoriesMode: "Теории",
    progressPassed: "Прошло",
    progressLeft: "Осталось",
    progressText: "Прогресс до события",
    shareCopied: "Ссылка скопирована!",
    teamEnergyTitle: "НЕВЕСОМОСТЬ: ГОЛОСОВАНИЕ КОМАНД 2026",
    noTeamSelected: "Выбери команду, чтобы активировать её энергию.",
    chooseTeamBtn: "Выбрать команду",
    selectedTeamPrefix: "Твоя команда:",
    teamAlreadySelected: "Выбрано",
    voteStatus: "Голоса автоматически обновляются из формы сообщества.",
    changeVoteText: "Нужно изменить голос? Свяжись с PK XD PORTAL.",
    currentLeader: "Лидер сейчас:",
    totalVotes: "Всего голосов:",
    teamActivated: "активирована",
    voteVolts: "⚡ Голосовать за Молнию",
    voteFlame: "🔥 Голосовать за Пламя",
    voteLeaf: "🍃 Голосовать за Листья",
    theoriesTitle: "ТЕОРИИ О НЕВЕСОМОСТИ",
    theoriesSubtitle: "Фанатские теории PK XD PORTAL. Это не официальная информация.",
    theoryGravityTitle: "Новая механика гравитации",
    theoryGravityText: "Игроки могут парить, прыгать выше или двигаться иначе во время события.",
    theoryItemsTitle: "Космические предметы",
    theoryItemsText: "Обновление может принести костюмы, эффекты, питомцев или транспорт в космическом стиле.",
    theoryTeamsTitle: "Энергия команд",
    theoryTeamsText: "Молния, Пламя и Листья могут быть связаны с темой события.",
    theoryGamesTitle: "Новые мини-игры",
    theoryGamesText: "В событии могут появиться полёты, парение или испытания с низкой гравитацией.",
    theoryMapTitle: "Изменения карты",
    theoryMapText: "Остров может получить временное оформление в стиле Невесомости.",
    theoryRewardsTitle: "Особые награды",
    theoryRewardsText: "Могут появиться ограниченные награды, связанные с событием.",
    videoHubTitle: "ВИДЕОЦЕНТР НЕВЕСОМОСТИ",
    videoHubText: "Смотри обновления PK XD PORTAL и выбранные видео сообщества о Невесомости.",
    watchMoreTitle: "ВИДЕОЦЕНТР НЕВЕСОМОСТИ",
    watchMoreText: "Смотри обновления PK XD PORTAL и выбранные видео сообщества о Невесомости.",
    portalVideosBtn: "Смотреть все",
    zeroGravityVideosBtn: "Смотреть все",
    portalVideosTitle: "Видео PK XD PORTAL",
    communityVideosTitle: "Видео сообщества о Невесомости",
    portalVideoSectionTitle: "Видео PK XD PORTAL",
    communityVideoSectionTitle: "Видео сообщества о Невесомости",
    communityCommsTitle: "Сообщения сообщества",
    communityCommsText: "Напиши сообщение для сообщества Невесомости.",
    commentNamePlaceholder: "Твоё имя",
    commPlaceholder: "Передай сообщение сообществу...",
    commentsLocalNote: "Сообщения после отправки видны всем.",
    noCommentsYet: "Сообщений пока нет. Будь первым.",
    teams: {
      volts: {
        icon: "⚡",
        title: "КОМАНДА МОЛНИИ",
        text: "ЧИСТАЯ ЭНЕРГИЯ МОЛНИИ! Я полон радости и энергии!"
      },
      flame: {
        icon: "🔥",
        title: "КОМАНДА ПЛАМЕНИ",
        text: "ИНТЕНСИВНОСТЬ ПЛАМЕНИ! Я тёплый и яростный!"
      },
      leaf: {
        icon: "🍃",
        title: "КОМАНДА ЛИСТЬЕВ",
        text: "СИЛА ВНУТРИ КАЖДОГО ЛИСТА! Я праведный и сильный, как природа!"
      }
    }
  }
};

const languageOverrides = {
  de: {
    eventDate: "11. JUNI 2026 • 15:00 BERLIN",
    titleTop: "Bis",
    titleMain: "Zero Gravity",
    days: "Tage",
    hours: "Stunden",
    minutes: "Minuten",
    seconds: "Sekunden",
    musicLabel: "Musik",
    started: "🚀 Zero Gravity hat begonnen",
    fanCountdown: "Fan-Countdown für PK XD",
    languageLabel: "Sprache",
    downloadLabel: "Download",
    shareLabel: "Teilen",
    countdownMode: "Countdown",
    progressMode: "Fortschritt",
    theoriesMode: "Theorien",
    progressPassed: "Vergangen",
    progressLeft: "Übrig",
    progressText: "Fortschritt bis zum Event",
    shareCopied: "Link kopiert!",
    noTeamSelected: "Wähle dein Team, um seine Energie zu aktivieren.",
    chooseTeamBtn: "Team wählen",
    selectedTeamPrefix: "Dein Team:",
    teamAlreadySelected: "Gewählt",
    currentLeader: "Aktueller Favorit:",
    totalVotes: "Stimmen insgesamt:",
    teamActivated: "aktiviert",
    videoHubTitle: "ZERO GRAVITY VIDEO HUB",
    videoHubText: "Verfolge PK XD PORTAL Updates und ausgewählte Community-Videos zu Zero Gravity.",
    portalVideosBtn: "Alle ansehen",
    zeroGravityVideosBtn: "Alle ansehen",
    portalVideosTitle: "PK XD PORTAL Videos",
    communityVideosTitle: "Community-Videos",
    portalVideoSectionTitle: "PK XD PORTAL Videos",
    communityVideoSectionTitle: "Community-Videos",
    communityCommsTitle: "Community Comms",
    communityCommsText: "Schreibe eine Nachricht für die Zero-Gravity-Community.",
    commentNamePlaceholder: "Dein Name",
    commPlaceholder: "Sende deine Nachricht an die Community...",
    commentsLocalNote: "Nachrichten sind nach dem Senden für alle sichtbar.",
    noCommentsYet: "Noch keine Nachrichten. Sei der Erste.",
    teams: {
      volts: { icon: "⚡", title: "TEAM VOLTS", text: "REINE BLITZENERGIE! Ich bin voller Freude und Energie!" },
      flame: { icon: "🔥", title: "TEAM FLAME", text: "DIE INTENSITÄT DER FLAMME! Ich bin warm und wild!" },
      leaf: { icon: "🍃", title: "TEAM LEAF", text: "DIE KRAFT IN JEDEM BLATT! Ich bin gerecht und stark wie die Natur!" }
    }
  },

  fr: {
    eventDate: "11 JUIN 2026 • 15:00 PARIS",
    titleTop: "Jusqu’à",
    titleMain: "Zéro Gravité",
    days: "jours",
    hours: "heures",
    minutes: "minutes",
    seconds: "secondes",
    musicLabel: "Musique",
    started: "🚀 Zéro Gravité a commencé",
    fanCountdown: "Compte à rebours de fan pour PK XD",
    languageLabel: "Langue",
    downloadLabel: "Télécharger",
    shareLabel: "Partager",
    countdownMode: "Compte à rebours",
    progressMode: "Progression",
    theoriesMode: "Théories",
    progressPassed: "Passé",
    progressLeft: "Restant",
    progressText: "Progression jusqu’à l’événement",
    shareCopied: "Lien copié !",
    noTeamSelected: "Choisis ton équipe pour activer son énergie.",
    chooseTeamBtn: "Choisir l’équipe",
    selectedTeamPrefix: "Ton équipe :",
    teamAlreadySelected: "Choisie",
    currentLeader: "Équipe en tête :",
    totalVotes: "Total des votes :",
    teamActivated: "activée",
    videoHubTitle: "HUB VIDÉO ZÉRO GRAVITÉ",
    videoHubText: "Suis les mises à jour de PK XD PORTAL et des vidéos sélectionnées de la communauté.",
    portalVideosBtn: "Voir tout",
    zeroGravityVideosBtn: "Voir tout",
    portalVideosTitle: "Vidéos PK XD PORTAL",
    communityVideosTitle: "Vidéos de la communauté",
    portalVideoSectionTitle: "Vidéos PK XD PORTAL",
    communityVideoSectionTitle: "Vidéos de la communauté",
    communityCommsTitle: "Messages de la communauté",
    communityCommsText: "Écris un message pour la communauté Zéro Gravité.",
    commentNamePlaceholder: "Ton nom",
    commPlaceholder: "Transmets ton message à la communauté...",
    commentsLocalNote: "Les messages sont visibles par tous après l’envoi.",
    noCommentsYet: "Aucun message pour l’instant. Sois le premier.",
    teams: {
      volts: { icon: "⚡", title: "ÉQUIPE VOLTS", text: "ÉNERGIE PURE DE LA FOUDRE ! Je suis plein de joie et d’énergie !" },
      flame: { icon: "🔥", title: "ÉQUIPE FLAME", text: "L’INTENSITÉ DE LA FLAMME ! Je suis chaleureux et féroce !" },
      leaf: { icon: "🍃", title: "ÉQUIPE LEAF", text: "LA FORCE DANS CHAQUE FEUILLE ! Je suis juste et fort comme la nature !" }
    }
  },

  pl: {
    eventDate: "11 CZERWCA 2026 • 15:00 WARSZAWA",
    titleTop: "Do",
    titleMain: "Nieważkości",
    days: "dni",
    hours: "godziny",
    minutes: "minuty",
    seconds: "sekundy",
    musicLabel: "Muzyka",
    started: "🚀 Nieważkość się rozpoczęła",
    fanCountdown: "Fanowski licznik dla PK XD",
    languageLabel: "Język",
    downloadLabel: "Pobierz",
    shareLabel: "Udostępnij",
    countdownMode: "Odliczanie",
    progressMode: "Postęp",
    theoriesMode: "Teorie",
    progressPassed: "Minęło",
    progressLeft: "Zostało",
    progressText: "Postęp do wydarzenia",
    shareCopied: "Link skopiowany!",
    noTeamSelected: "Wybierz drużynę, aby aktywować jej energię.",
    chooseTeamBtn: "Wybierz drużynę",
    selectedTeamPrefix: "Twoja drużyna:",
    teamAlreadySelected: "Wybrano",
    currentLeader: "Aktualny lider:",
    totalVotes: "Łącznie głosów:",
    teamActivated: "aktywowana",
    videoHubTitle: "CENTRUM WIDEO NIEWAŻKOŚCI",
    videoHubText: "Śledź aktualizacje PK XD PORTAL i oglądaj wybrane filmy społeczności.",
    portalVideosBtn: "Zobacz wszystko",
    zeroGravityVideosBtn: "Zobacz wszystko",
    portalVideosTitle: "Filmy PK XD PORTAL",
    communityVideosTitle: "Filmy społeczności",
    portalVideoSectionTitle: "Filmy PK XD PORTAL",
    communityVideoSectionTitle: "Filmy społeczności",
    communityCommsTitle: "Wiadomości społeczności",
    communityCommsText: "Napisz wiadomość dla społeczności Nieważkości.",
    commentNamePlaceholder: "Twoje imię",
    commPlaceholder: "Wyślij wiadomość do społeczności...",
    commentsLocalNote: "Wiadomości po wysłaniu są widoczne dla wszystkich.",
    noCommentsYet: "Brak wiadomości. Bądź pierwszy.",
    teams: {
      volts: { icon: "⚡", title: "DRUŻYNA VOLTS", text: "CZYSTA ENERGIA BŁYSKAWICY! Jestem pełen radości i energii!" },
      flame: { icon: "🔥", title: "DRUŻYNA FLAME", text: "INTENSYWNOŚĆ PŁOMIENIA! Jestem ciepły i zaciekły!" },
      leaf: { icon: "🍃", title: "DRUŻYNA LEAF", text: "SIŁA W KAŻDYM LIŚCIU! Jestem prawy i silny jak natura!" }
    }
  },

  pt: {
    eventDate: "11 JUNHO 2026 • 10:00 BRASÍLIA",
    titleTop: "Até",
    titleMain: "Gravidade Zero",
    days: "dias",
    hours: "horas",
    minutes: "minutos",
    seconds: "segundos",
    musicLabel: "Música",
    started: "🚀 Gravidade Zero começou",
    fanCountdown: "Contagem regressiva feita por fãs para PK XD",
    languageLabel: "Idioma",
    downloadLabel: "Baixar",
    shareLabel: "Compartilhar",
    countdownMode: "Contagem",
    progressMode: "Progresso",
    theoriesMode: "Teorias",
    progressPassed: "Passou",
    progressLeft: "Falta",
    progressText: "Progresso até o evento",
    shareCopied: "Link copiado!",
    noTeamSelected: "Escolha seu time para ativar sua energia.",
    chooseTeamBtn: "Escolher time",
    selectedTeamPrefix: "Seu time:",
    teamAlreadySelected: "Escolhido",
    currentLeader: "Líder atual:",
    totalVotes: "Total de votos:",
    teamActivated: "ativado",
    videoHubTitle: "CENTRAL DE VÍDEOS GRAVIDADE ZERO",
    videoHubText: "Acompanhe as atualizações da PK XD PORTAL e vídeos selecionados da comunidade.",
    portalVideosBtn: "Ver todos",
    zeroGravityVideosBtn: "Ver todos",
    portalVideosTitle: "Vídeos da PK XD PORTAL",
    communityVideosTitle: "Vídeos da comunidade",
    portalVideoSectionTitle: "Vídeos da PK XD PORTAL",
    communityVideoSectionTitle: "Vídeos da comunidade",
    communityCommsTitle: "Mensagens da comunidade",
    communityCommsText: "Escreva uma mensagem para a comunidade Gravidade Zero.",
    commentNamePlaceholder: "Seu nome",
    commPlaceholder: "Transmita sua mensagem para a comunidade...",
    commentsLocalNote: "As mensagens ficam visíveis para todos após o envio.",
    noCommentsYet: "Ainda não há mensagens. Seja o primeiro.",
    teams: {
      volts: { icon: "⚡", title: "TIME VOLTS", text: "ENERGIA PURA DE RAIO!" },
      flame: { icon: "🔥", title: "TIME FLAME", text: "INTENSIDADE DO FOGO!" },
      leaf: { icon: "🍃", title: "TIME LEAF", text: "FORÇA DA NATUREZA!" }
    }
  },

  tr: {
    eventDate: "11 HAZİRAN 2026 • 16:00 ISTANBUL",
    titleTop: "Kalan Süre",
    titleMain: "Sıfır Yerçekimi",
    days: "gün",
    hours: "saat",
    minutes: "dakika",
    seconds: "saniye",
    musicLabel: "Müzik",
    started: "🚀 Sıfır Yerçekimi başladı",
    fanCountdown: "PK XD için hayran geri sayımı",
    languageLabel: "Dil",
    downloadLabel: "İndir",
    shareLabel: "Paylaş",
    countdownMode: "Geri Sayım",
    progressMode: "İlerleme",
    theoriesMode: "Teoriler",
    progressPassed: "Geçti",
    progressLeft: "Kaldı",
    progressText: "Etkinliğe kalan ilerleme",
    shareCopied: "Bağlantı kopyalandı!",
    noTeamSelected: "Enerjisini etkinleştirmek için takımını seç.",
    chooseTeamBtn: "Takımı seç",
    selectedTeamPrefix: "Takımın:",
    teamAlreadySelected: "Seçildi",
    currentLeader: "Şu an lider:",
    totalVotes: "Toplam oy:",
    teamActivated: "etkinleştirildi",
    videoHubTitle: "SIFIR YERÇEKİMİ VİDEO MERKEZİ",
    videoHubText: "PK XD PORTAL güncellemelerini ve seçilmiş topluluk videolarını izle.",
    portalVideosBtn: "Tümünü gör",
    zeroGravityVideosBtn: "Tümünü gör",
    portalVideosTitle: "PK XD PORTAL Videoları",
    communityVideosTitle: "Topluluk Videoları",
    portalVideoSectionTitle: "PK XD PORTAL Videoları",
    communityVideoSectionTitle: "Topluluk Videoları",
    communityCommsTitle: "Topluluk Mesajları",
    communityCommsText: "Sıfır Yerçekimi topluluğu için mesaj yaz.",
    commentNamePlaceholder: "Adın",
    commPlaceholder: "Mesajını topluluğa gönder...",
    commentsLocalNote: "Mesajlar gönderildikten sonra herkes tarafından görülebilir.",
    noCommentsYet: "Henüz mesaj yok. İlk sen ol.",
    teams: {
      volts: { icon: "⚡", title: "VOLTS TAKIMI", text: "SAF YILDIRIM ENERJİSİ!" },
      flame: { icon: "🔥", title: "FLAME TAKIMI", text: "ATEŞİN YOĞUNLUĞU!" },
      leaf: { icon: "🍃", title: "LEAF TAKIMI", text: "DOĞANIN GÜCÜ!" }
    }
  },

  id: {
    eventDate: "11 JUNI 2026 • 20:00 JAKARTA",
    titleTop: "Menuju",
    titleMain: "Gravitasi Nol",
    days: "hari",
    hours: "jam",
    minutes: "menit",
    seconds: "detik",
    musicLabel: "Musik",
    started: "🚀 Gravitasi Nol dimulai",
    fanCountdown: "Hitung mundur penggemar untuk PK XD",
    languageLabel: "Bahasa",
    downloadLabel: "Unduh",
    shareLabel: "Bagikan",
    countdownMode: "Hitung Mundur",
    progressMode: "Progres",
    theoriesMode: "Teori",
    progressPassed: "Berlalu",
    progressLeft: "Tersisa",
    progressText: "Progres menuju event",
    shareCopied: "Link disalin!",
    noTeamSelected: "Pilih tim untuk mengaktifkan energinya.",
    chooseTeamBtn: "Pilih Tim",
    selectedTeamPrefix: "Tim kamu:",
    teamAlreadySelected: "Dipilih",
    currentLeader: "Pemimpin saat ini:",
    totalVotes: "Total vote:",
    teamActivated: "diaktifkan",
    videoHubTitle: "PUSAT VIDEO GRAVITASI NOL",
    videoHubText: "Ikuti update PK XD PORTAL dan video komunitas pilihan.",
    portalVideosBtn: "Lihat semua",
    zeroGravityVideosBtn: "Lihat semua",
    portalVideosTitle: "Video PK XD PORTAL",
    communityVideosTitle: "Video komunitas",
    portalVideoSectionTitle: "Video PK XD PORTAL",
    communityVideoSectionTitle: "Video komunitas",
    communityCommsTitle: "Pesan komunitas",
    communityCommsText: "Tulis pesan untuk komunitas Gravitasi Nol.",
    commentNamePlaceholder: "Nama kamu",
    commPlaceholder: "Kirim pesanmu ke komunitas...",
    commentsLocalNote: "Pesan akan terlihat oleh semua orang setelah dikirim.",
    noCommentsYet: "Belum ada pesan. Jadilah yang pertama.",
    teams: {
      volts: { icon: "⚡", title: "TIM VOLTS", text: "ENERGI PETIR MURNI!" },
      flame: { icon: "🔥", title: "TIM FLAME", text: "INTENSITAS API!" },
      leaf: { icon: "🍃", title: "TIM LEAF", text: "KEKUATAN ALAM!" }
    }
  },

  es: {
    eventDate: "11 JUNIO 2026 • 07:00 MEXICO CITY",
    titleTop: "Hasta",
    titleMain: "Gravedad Cero",
    days: "días",
    hours: "horas",
    minutes: "minutos",
    seconds: "segundos",
    musicLabel: "Música",
    started: "🚀 Gravedad Cero comenzó",
    fanCountdown: "Cuenta regresiva hecha por fans para PK XD",
    languageLabel: "Idioma",
    downloadLabel: "Descargar",
    shareLabel: "Compartir",
    countdownMode: "Cuenta regresiva",
    progressMode: "Progreso",
    theoriesMode: "Teorías",
    progressPassed: "Pasó",
    progressLeft: "Falta",
    progressText: "Progreso hasta el evento",
    shareCopied: "¡Enlace copiado!",
    noTeamSelected: "Elige tu equipo para activar su energía.",
    chooseTeamBtn: "Elegir equipo",
    selectedTeamPrefix: "Tu equipo:",
    teamAlreadySelected: "Elegido",
    currentLeader: "Líder actual:",
    totalVotes: "Votos totales:",
    teamActivated: "activado",
    videoHubTitle: "CENTRO DE VIDEOS GRAVEDAD CERO",
    videoHubText: "Mira actualizaciones de PK XD PORTAL y videos seleccionados de la comunidad.",
    portalVideosBtn: "Ver todos",
    zeroGravityVideosBtn: "Ver todos",
    portalVideosTitle: "Videos de PK XD PORTAL",
    communityVideosTitle: "Videos de la comunidad",
    portalVideoSectionTitle: "Videos de PK XD PORTAL",
    communityVideoSectionTitle: "Videos de la comunidad",
    communityCommsTitle: "Mensajes de la comunidad",
    communityCommsText: "Escribe un mensaje para la comunidad de Gravedad Cero.",
    commentNamePlaceholder: "Tu nombre",
    commPlaceholder: "Transmite tu mensaje a la comunidad...",
    commentsLocalNote: "Los mensajes serán visibles para todos después de enviarlos.",
    noCommentsYet: "Aún no hay mensajes. Sé el primero.",
    teams: {
      volts: { icon: "⚡", title: "EQUIPO VOLTS", text: "¡ENERGÍA PURA DEL RAYO!" },
      flame: { icon: "🔥", title: "EQUIPO FLAME", text: "¡INTENSIDAD DEL FUEGO!" },
      leaf: { icon: "🍃", title: "EQUIPO LEAF", text: "¡FUERZA DE LA NATURALEZA!" }
    }
  },

  hi: {
    eventDate: "11 जून 2026 • 18:30 NEW DELHI",
    titleTop: "शुरू होने तक",
    titleMain: "शून्य गुरुत्वाकर्षण",
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट",
    seconds: "सेकंड",
    musicLabel: "संगीत",
    started: "🚀 शून्य गुरुत्वाकर्षण शुरू हो गया",
    fanCountdown: "PK XD के लिए फैन काउंटडाउन",
    languageLabel: "भाषा",
    downloadLabel: "डाउनलोड",
    shareLabel: "शेयर",
    countdownMode: "काउंटडाउन",
    progressMode: "प्रगति",
    theoriesMode: "थ्योरी",
    progressPassed: "बीता",
    progressLeft: "बाकी",
    progressText: "इवेंट तक प्रगति",
    shareCopied: "लिंक कॉपी हो गया!",
    noTeamSelected: "अपनी टीम चुनें ताकि उसकी ऊर्जा सक्रिय हो सके।",
    chooseTeamBtn: "टीम चुनें",
    selectedTeamPrefix: "आपकी टीम:",
    teamAlreadySelected: "चुनी गई",
    currentLeader: "मौजूदा लीडर:",
    totalVotes: "कुल वोट:",
    teamActivated: "सक्रिय",
    videoHubTitle: "शून्य गुरुत्वाकर्षण वीडियो हब",
    videoHubText: "PK XD PORTAL अपडेट्स और चुने हुए कम्युनिटी वीडियो देखें।",
    portalVideosBtn: "सभी देखें",
    zeroGravityVideosBtn: "सभी देखें",
    portalVideosTitle: "PK XD PORTAL वीडियो",
    communityVideosTitle: "कम्युनिटी वीडियो",
    portalVideoSectionTitle: "PK XD PORTAL वीडियो",
    communityVideoSectionTitle: "कम्युनिटी वीडियो",
    communityCommsTitle: "कम्युनिटी संदेश",
    communityCommsText: "शून्य गुरुत्वाकर्षण कम्युनिटी के लिए संदेश लिखें।",
    commentNamePlaceholder: "आपका नाम",
    commPlaceholder: "अपना संदेश कम्युनिटी को भेजें...",
    commentsLocalNote: "भेजने के बाद संदेश सभी को दिखाई देंगे।",
    noCommentsYet: "अभी कोई संदेश नहीं। पहले बनें।",
    teams: {
      volts: { icon: "⚡", title: "टीम VOLTS", text: "शुद्ध बिजली ऊर्जा!" },
      flame: { icon: "🔥", title: "टीम FLAME", text: "आग की तीव्रता!" },
      leaf: { icon: "🍃", title: "टीम LEAF", text: "प्रकृति की शक्ति!" }
    }
  }
};

Object.keys(languageOverrides).forEach((lang) => {
  translations[lang] = {
    ...translations.en,
    ...languageOverrides[lang],
    teams: languageOverrides[lang].teams || translations.en.teams
  };
});

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
let selectedRating = 5;

function getText(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function getTeamData(team) {
  return translations[currentLang]?.teams?.[team] || translations.en.teams[team];
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

  if (popupIcon) popupIcon.textContent = data.icon;
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

  if (selectedTeam) {
    document.body.classList.add("selected-" + selectedTeam);
  }

  currentPopupTeam = null;
}

function chooseTeam(team) {
  if (!team || !translations.en.teams[team]) return;

  selectedTeam = team;
  localStorage.setItem("selectedTeam", selectedTeam);

  applySelectedTeamTheme();
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

  if (!selectedTeam) return;

  document.body.classList.add("selected-" + selectedTeam);

  const selectedButton = document.querySelector(`.team-btn[data-team="${selectedTeam}"]`);

  if (selectedButton) {
    selectedButton.classList.add("selected");
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
    selectedTeamText.textContent = `${getText("selectedTeamPrefix")} ${team.icon} ${team.title}`;
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

  voteLeader.textContent = `${getText("currentLeader")} ${leaderData.icon} ${leaderData.title} — ${leader.value}%`;
}

function showTeamActivated(team) {
  if (!teamActivatedToast) return;

  const teamData = getTeamData(team);

  if (!teamData) return;

  teamActivatedToast.textContent = `${teamData.icon} ${teamData.title} ${getText("teamActivated")}`;
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
    const response = await fetch(COMMENTS_API_URL + "?cache=" + Date.now());

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

async function renderComments() {
  if (!commentsList) return;

  const comments = await getStoredComments();

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
        <div class="comm-message">
          <div class="comm-top">
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(stars)} ${formatCommentTime(createdAt)}</span>
          </div>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
    })
    .join("");
}

async function addComment(name, text) {
  const cleanName = String(name || "").trim().slice(0, 18);
  const cleanText = String(text || "").trim().slice(0, COMMENT_MAX_LENGTH);

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
        rating: selectedRating
      })
    });

    window.setTimeout(renderComments, 1200);
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
    star.classList.toggle("active", value <= selectedRating);
  });
}

ratingStars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.rating) || 5;
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

if (commentForm && commentName && commentText) {
  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await addComment(commentName.value, commentText.value);

    commentText.value = "";
    updateCommentCounter();
    commentText.focus();
  });
}

const savedLang = localStorage.getItem("selectedLang") || "en";

setLanguage(savedLang);
applySelectedTeamTheme();
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
