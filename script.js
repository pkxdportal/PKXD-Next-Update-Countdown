const targetDate = new Date("2026-06-11T13:00:00Z");
const eventStartDate = new Date("2025-06-26T00:00:00Z");

let currentLang = "en";
let lastSeconds = null;
let isPlaying = false;
let countdownInterval = null;
let currentPopupTeam = null;
let selectedTeam = localStorage.getItem("selectedTeam") || null;

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSWxR6NP3qLfM_-Fi_qoRjpgEA0qiUCUTze8P3XHmNea9ROrpIGMp2kKxd_5FaqZvNi3j28G1-nmlQ/pub?gid=747099020&single=true&output=csv";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd59BlXBH9tvS96vOtui6jvHhJyGLsFP0gJFZdW7-F1EtN-Nw/viewform?usp=dialog";

const GOOGLE_FORM_PREFILLED_URLS = {
  volts: "",
  flame: "",
  leaf: ""
};

let teamEnergyData = {
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
    musicOn: "🔊 Music",
    musicOff: "🔇 Turn music off",
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
    progressPassed: "Passed",
    progressLeft: "Left",
    progressText: "Event progress",
    shareCopied: "Link copied!",
    teamEnergyTitle: "ZERO GRAVITY TEAM VOTE 2026",
    noTeamSelected: "Choose your team to activate its energy.",
    chooseTeamBtn: "Choose Team",
    selectedTeamPrefix: "Your team:",
    selectedTeamSaved: "Team selected:",
    teamAlreadySelected: "Selected",
    voteStatus: "Votes update automatically from the community form.",
    changeVoteText: "Need to change your vote? Contact PK XD PORTAL.",
    currentLeader: "Current leader:",
    teamActivated: "activated",
    voteVolts: "⚡ Vote Volts",
    voteFlame: "🔥 Vote Flame",
    voteLeaf: "🍃 Vote Leaf",

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
    musicOn: "🔊 Музыка",
    musicOff: "🔇 Выключить музыку",
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
    progressPassed: "Прошло",
    progressLeft: "Осталось",
    progressText: "Прогресс до события",
    shareCopied: "Ссылка скопирована!",
    teamEnergyTitle: "НЕВЕСОМОСТЬ: ГОЛОСОВАНИЕ КОМАНД 2026",
    noTeamSelected: "Выбери команду, чтобы активировать её энергию.",
    chooseTeamBtn: "Выбрать команду",
    selectedTeamPrefix: "Твоя команда:",
    selectedTeamSaved: "Команда выбрана:",
    teamAlreadySelected: "Выбрано",
    voteStatus: "Голоса автоматически обновляются из формы сообщества.",
    changeVoteText: "Нужно изменить голос? Свяжись с PK XD PORTAL.",
    currentLeader: "Лидер сейчас:",
    teamActivated: "активирована",
    voteVolts: "⚡ Голосовать за Молнию",
    voteFlame: "🔥 Голосовать за Пламя",
    voteLeaf: "🍃 Голосовать за Листья",

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
  },

  de: {
    eventDate: "11. JUNI 2026 • 15:00 BERLIN",
    titleTop: "Bis",
    titleMain: "Zero Gravity",
    days: "Tage",
    hours: "Stunden",
    minutes: "Minuten",
    seconds: "Sekunden",
    credit: "Website erstellt von <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Musik",
    musicOff: "🔇 Musik ausschalten",
    started: "🚀 Zero Gravity hat begonnen",
    fanCountdown: "Fan-Countdown für PK XD",
    disclaimer: "Dies ist ein von Fans erstellter Countdown, erstellt von PK XD PORTAL für die Community. PK XD, das PK XD-Logo, das Hintergrundbild und die Musik gehören Afterverse. Diese Website ist nicht offiziell und steht nicht in Verbindung mit Afterverse.",
    dateNote: "Das Countdown-Datum basiert auf Spekulationen der Community und logischer Beobachtung, da Zero-Gravity-Events normalerweise im Juni erscheinen. Das Datum kann sich ändern, wenn offizielle Informationen veröffentlicht werden.",
    feedbackText: "Für Website-Verbesserungen, neue Sprachen, Fragen oder Kontaktanfragen schreibe uns über einen unserer Social-Links oben.",
    afterverseContact: "Wenn jemand von Afterverse diese Website sieht und möchte, dass wir etwas ändern, nennen, entfernen oder anpassen, kontaktiert uns bitte über unsere Social-Links. Wir arbeiten gerne mit euch zusammen, damit das Projekt respektvoll bleibt und den Regeln entspricht.",
    downloadTitle: "PK XD herunterladen / aktualisieren",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Sprache",
    downloadLabel: "Download",
    shareLabel: "Teilen",
    countdownMode: "Countdown",
    progressMode: "Fortschritt",
    progressPassed: "Vergangen",
    progressLeft: "Übrig",
    progressText: "Fortschritt bis zum Event",
    shareCopied: "Link kopiert!",
    teamEnergyTitle: "Zero Gravity TEAM-ABSTIMMUNG 2026",
    noTeamSelected: "Wähle dein Team, um seine Energie zu aktivieren.",
    chooseTeamBtn: "Team wählen",
    selectedTeamPrefix: "Dein Team:",
    selectedTeamSaved: "Team gewählt:",
    teamAlreadySelected: "Gewählt",
    voteStatus: "Die Stimmen werden automatisch aus dem Community-Formular aktualisiert.",
    changeVoteText: "Du musst deine Stimme ändern? Kontaktiere PK XD PORTAL.",
    currentLeader: "Aktueller Favorit:",
    teamActivated: "aktiviert",
    voteVolts: "⚡ Stimme für Volts",
    voteFlame: "🔥 Stimme für Flame",
    voteLeaf: "🍃 Stimme für Leaf",

    teams: {
      volts: {
        icon: "⚡",
        title: "TEAM VOLTS",
        text: "REINE BLITZENERGIE! Ich bin voller Freude und Energie!"
      },
      flame: {
        icon: "🔥",
        title: "TEAM FLAME",
        text: "DIE INTENSITÄT DER FLAMME! Ich bin warm und wild!"
      },
      leaf: {
        icon: "🍃",
        title: "TEAM LEAF",
        text: "DIE KRAFT IN JEDEM BLATT! Ich bin gerecht und stark wie die Natur!"
      }
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
    credit: "Site créé par <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Musique",
    musicOff: "🔇 Couper la musique",
    started: "🚀 Zéro Gravité a commencé",
    fanCountdown: "Compte à rebours de fan pour PK XD",
    disclaimer: "Ceci est un compte à rebours créé par des fans par PK XD PORTAL pour la communauté. PK XD, le logo PK XD, l’image d’arrière-plan et la musique appartiennent à Afterverse. Ce site n’est pas officiel et n’est pas affilié à Afterverse.",
    dateNote: "La date du compte à rebours est basée sur les suppositions de la communauté et une observation logique, car les événements Zéro Gravité apparaissent généralement en juin. La date peut changer si des informations officielles sont annoncées.",
    feedbackText: "Pour améliorer le site, ajouter de nouvelles langues, poser des questions ou nous contacter, écris-nous via l’un de nos liens sociaux ci-dessus.",
    afterverseContact: "Si une personne d’Afterverse voit ce site et souhaite que nous modifiions, créditons, supprimions ou ajustions quelque chose, merci de nous contacter via nos liens sociaux. Nous coopérerons volontiers afin que le projet reste respectueux et conforme aux règles.",
    downloadTitle: "Télécharger / Mettre à jour PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Langue",
    downloadLabel: "Télécharger",
    shareLabel: "Partager",
    countdownMode: "Compte à rebours",
    progressMode: "Progression",
    progressPassed: "Passé",
    progressLeft: "Restant",
    progressText: "Progression jusqu’à l’événement",
    shareCopied: "Lien copié !",
    teamEnergyTitle: "VOTE DES ÉQUIPES ZÉRO GRAVITÉ 2026",
    noTeamSelected: "Choisis ton équipe pour activer son énergie.",
    chooseTeamBtn: "Choisir l’équipe",
    selectedTeamPrefix: "Ton équipe :",
    selectedTeamSaved: "Équipe choisie :",
    teamAlreadySelected: "Choisie",
    voteStatus: "Les votes sont automatiquement mis à jour depuis le formulaire de la communauté.",
    changeVoteText: "Besoin de changer ton vote ? Contacte PK XD PORTAL.",
    currentLeader: "Équipe en tête :",
    teamActivated: "activée",
    voteVolts: "⚡ Voter pour Volts",
    voteFlame: "🔥 Voter pour Flame",
    voteLeaf: "🍃 Voter pour Leaf",

    teams: {
      volts: {
        icon: "⚡",
        title: "ÉQUIPE VOLTS",
        text: "ÉNERGIE PURE DE LA FOUDRE ! Je suis plein de joie et d’énergie !"
      },
      flame: {
        icon: "🔥",
        title: "ÉQUIPE FLAME",
        text: "L’INTENSITÉ DE LA FLAMME ! Je suis chaleureux et féroce !"
      },
      leaf: {
        icon: "🍃",
        title: "ÉQUIPE LEAF",
        text: "LA FORCE DANS CHAQUE FEUILLE ! Je suis juste et fort comme la nature !"
      }
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
    credit: "Strona stworzona przez <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Muzyka",
    musicOff: "🔇 Wyłącz muzykę",
    started: "🚀 Nieważkość się rozpoczęła",
    fanCountdown: "Fanowski licznik dla PK XD",
    disclaimer: "To fanowski licznik stworzony przez PK XD PORTAL dla społeczności. PK XD, logo PK XD, obraz tła i muzyka należą do Afterverse. Ta strona nie jest oficjalna i nie jest powiązana z Afterverse.",
    dateNote: "Data odliczania jest oparta na przypuszczeniach społeczności i logicznej obserwacji, ponieważ wydarzenia Nieważkości zwykle pojawiają się w czerwcu. Data może się zmienić, jeśli pojawią się oficjalne informacje.",
    feedbackText: "W sprawie ulepszeń strony, nowych języków, pytań lub kontaktu napisz do nas przez jeden z linków społecznościowych powyżej.",
    afterverseContact: "Jeśli ktoś z Afterverse zobaczy tę stronę i będzie chciał, abyśmy coś zmienili, dodali kredyt, usunęli lub poprawili, prosimy o kontakt przez nasze linki społecznościowe. Chętnie będziemy współpracować, aby projekt pozostał zgodny z zasadami i pełen szacunku.",
    downloadTitle: "Pobierz / Zaktualizuj PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Język",
    downloadLabel: "Pobierz",
    shareLabel: "Udostępnij",
    countdownMode: "Odliczanie",
    progressMode: "Postęp",
    progressPassed: "Minęło",
    progressLeft: "Zostało",
    progressText: "Postęp do wydarzenia",
    shareCopied: "Link skopiowany!",
    teamEnergyTitle: "GŁOSOWANIE DRUŻYN NIEWAŻKOŚCI 2026",
    noTeamSelected: "Wybierz drużynę, aby aktywować jej energię.",
    chooseTeamBtn: "Wybierz drużynę",
    selectedTeamPrefix: "Twoja drużyna:",
    selectedTeamSaved: "Wybrana drużyna:",
    teamAlreadySelected: "Wybrano",
    voteStatus: "Głosy aktualizują się automatycznie z formularza społeczności.",
    changeVoteText: "Chcesz zmienić głos? Skontaktuj się z PK XD PORTAL.",
    currentLeader: "Aktualny lider:",
    teamActivated: "aktywowana",
    voteVolts: "⚡ Głosuj na Volts",
    voteFlame: "🔥 Głosuj na Flame",
    voteLeaf: "🍃 Głosuj na Leaf",

    teams: {
      volts: {
        icon: "⚡",
        title: "DRUŻYNA VOLTS",
        text: "CZYSTA ENERGIA BŁYSKAWICY! Jestem pełen radości i energii!"
      },
      flame: {
        icon: "🔥",
        title: "DRUŻYNA FLAME",
        text: "INTENSYWNOŚĆ PŁOMIENIA! Jestem ciepły i zaciekły!"
      },
      leaf: {
        icon: "🍃",
        title: "DRUŻYNA LEAF",
        text: "SIŁA W KAŻDYM LIŚCIU! Jestem prawy i silny jak natura!"
      }
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
    credit: "Site criado pela <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Música",
    musicOff: "🔇 Desligar música",
    started: "🚀 Gravidade Zero começou",
    fanCountdown: "Contagem regressiva feita por fãs para PK XD",
    disclaimer: "Esta é uma contagem regressiva feita por fãs, criada pela PK XD PORTAL para a comunidade. PK XD, o logotipo PK XD, a imagem de fundo e a música pertencem à Afterverse. Este site não é oficial e não possui afiliação com a Afterverse.",
    dateNote: "A data da contagem regressiva é baseada em especulação da comunidade e observação lógica, já que eventos de Gravidade Zero geralmente aparecem em junho. A data pode mudar se informações oficiais forem anunciadas.",
    feedbackText: "Para melhorias no site, novos idiomas, perguntas ou solicitações de contato, fale conosco por um dos links sociais acima.",
    afterverseContact: "Se alguém da Afterverse vir este site e quiser que alteremos, creditemos, removamos ou ajustemos algo, entre em contato conosco pelos nossos links sociais. Teremos prazer em cooperar para manter o projeto respeitoso e dentro das regras.",
    downloadTitle: "Baixar / Atualizar PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Idioma",
    downloadLabel: "Baixar",
    shareLabel: "Compartilhar",
    countdownMode: "Contagem",
    progressMode: "Progresso",
    progressPassed: "Passou",
    progressLeft: "Falta",
    progressText: "Progresso até o evento",
    shareCopied: "Link copiado!",
    teamEnergyTitle: "VOTAÇÃO DOS TIMES GRAVIDADE ZERO 2026",
    noTeamSelected: "Escolha seu time para ativar sua energia.",
    chooseTeamBtn: "Escolher time",
    selectedTeamPrefix: "Seu time:",
    selectedTeamSaved: "Time escolhido:",
    teamAlreadySelected: "Escolhido",
    voteStatus: "Os votos são atualizados automaticamente pelo formulário da comunidade.",
    changeVoteText: "Precisa mudar seu voto? Entre em contato com PK XD PORTAL.",
    currentLeader: "Líder atual:",
    teamActivated: "ativado",
    voteVolts: "⚡ Votar no Volts",
    voteFlame: "🔥 Votar no Flame",
    voteLeaf: "🍃 Votar no Leaf",

    teams: {
      volts: {
        icon: "⚡",
        title: "TIME VOLTS",
        text: "ENERGIA PURA DE RAIO!"
      },
      flame: {
        icon: "🔥",
        title: "TIME FLAME",
        text: "INTENSIDADE DO FOGO!"
      },
      leaf: {
        icon: "🍃",
        title: "TIME LEAF",
        text: "FORÇA DA NATUREZA!"
      }
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
    credit: "<b>PK XD PORTAL</b> tarafından oluşturuldu",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Müzik",
    musicOff: "🔇 Müziği Kapat",
    started: "🚀 Sıfır Yerçekimi başladı",
    fanCountdown: "PK XD için hayran geri sayımı",
    disclaimer: "Bu, topluluk için PK XD PORTAL tarafından oluşturulmuş bir hayran geri sayımıdır. PK XD, PK XD logosu, arka plan görseli ve müzik Afterverse’e aittir. Bu site resmi değildir ve Afterverse ile bağlantılı değildir.",
    dateNote: "Geri sayım tarihi topluluk tahmini ve mantıklı gözleme dayanmaktadır, çünkü Sıfır Yerçekimi etkinlikleri genellikle haziran ayında görünür. Resmi bilgi açıklanırsa tarih değişebilir.",
    feedbackText: "Site geliştirmeleri, yeni diller, sorular veya iletişim talepleri için yukarıdaki sosyal bağlantılarımızdan bize yazın.",
    afterverseContact: "Afterverse’ten biri bu siteyi görür ve bir şeyi değiştirmemizi, kaynak göstermemizi, kaldırmamızı veya düzenlememizi isterse lütfen sosyal bağlantılarımız üzerinden bize ulaşsın. Projeyi saygılı ve kurallara uygun tutmak için memnuniyetle iş birliği yaparız.",
    downloadTitle: "PK XD İndir / Güncelle",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Dil",
    downloadLabel: "İndir",
    shareLabel: "Paylaş",
    countdownMode: "Geri Sayım",
    progressMode: "İlerleme",
    progressPassed: "Geçti",
    progressLeft: "Kaldı",
    progressText: "Etkinliğe kalan ilerleme",
    shareCopied: "Bağlantı kopyalandı!",
    teamEnergyTitle: "SIFIR YERÇEKİMİ TAKIM OYLAMASI 2026",
    noTeamSelected: "Enerjisini etkinleştirmek için takımını seç.",
    chooseTeamBtn: "Takımı seç",
    selectedTeamPrefix: "Takımın:",
    selectedTeamSaved: "Takım seçildi:",
    teamAlreadySelected: "Seçildi",
    voteStatus: "Oylar topluluk formundan otomatik olarak güncellenir.",
    changeVoteText: "Oyunu değiştirmek mi istiyorsun? PK XD PORTAL ile iletişime geç.",
    currentLeader: "Şu an lider:",
    teamActivated: "etkinleştirildi",
    voteVolts: "⚡ Volts için oy ver",
    voteFlame: "🔥 Flame için oy ver",
    voteLeaf: "🍃 Leaf için oy ver",

    teams: {
      volts: {
        icon: "⚡",
        title: "VOLTS TAKIMI",
        text: "SAF YILDIRIM ENERJİSİ!"
      },
      flame: {
        icon: "🔥",
        title: "FLAME TAKIMI",
        text: "ATEŞİN YOĞUNLUĞU!"
      },
      leaf: {
        icon: "🍃",
        title: "LEAF TAKIMI",
        text: "DOĞANIN GÜCÜ!"
      }
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
    credit: "Website dibuat oleh <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Musik",
    musicOff: "🔇 Matikan musik",
    started: "🚀 Gravitasi Nol dimulai",
    fanCountdown: "Hitung mundur penggemar untuk PK XD",
    disclaimer: "Ini adalah hitung mundur buatan penggemar yang dibuat oleh PK XD PORTAL untuk komunitas. PK XD, logo PK XD, gambar latar, dan musik adalah milik Afterverse. Situs ini bukan situs resmi dan tidak berafiliasi dengan Afterverse.",
    dateNote: "Tanggal hitung mundur berdasarkan spekulasi komunitas dan pengamatan logis, karena event Gravitasi Nol biasanya muncul pada bulan Juni. Tanggal dapat berubah jika informasi resmi diumumkan.",
    feedbackText: "Untuk peningkatan situs, bahasa baru, pertanyaan, atau permintaan kontak, kirim pesan melalui salah satu tautan sosial kami di atas.",
    afterverseContact: "Jika seseorang dari Afterverse melihat situs ini dan ingin kami mengubah, memberi kredit, menghapus, atau menyesuaikan sesuatu, silakan hubungi kami melalui tautan sosial kami. Kami akan dengan senang hati bekerja sama agar proyek ini tetap menghormati aturan.",
    downloadTitle: "Unduh / Perbarui PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Bahasa",
    downloadLabel: "Unduh",
    shareLabel: "Bagikan",
    countdownMode: "Hitung Mundur",
    progressMode: "Progres",
    progressPassed: "Berlalu",
    progressLeft: "Tersisa",
    progressText: "Progres menuju event",
    shareCopied: "Link disalin!",
    teamEnergyTitle: "VOTE TIM GRAVITASI NOL 2026",
    noTeamSelected: "Pilih tim untuk mengaktifkan energinya.",
    chooseTeamBtn: "Pilih Tim",
    selectedTeamPrefix: "Tim kamu:",
    selectedTeamSaved: "Tim dipilih:",
    teamAlreadySelected: "Dipilih",
    voteStatus: "Vote diperbarui otomatis dari formulir komunitas.",
    changeVoteText: "Perlu mengubah vote? Hubungi PK XD PORTAL.",
    currentLeader: "Pemimpin saat ini:",
    teamActivated: "diaktifkan",
    voteVolts: "⚡ Pilih Volts",
    voteFlame: "🔥 Pilih Flame",
    voteLeaf: "🍃 Pilih Leaf",

    teams: {
      volts: {
        icon: "⚡",
        title: "TIM VOLTS",
        text: "ENERGI PETIR MURNI!"
      },
      flame: {
        icon: "🔥",
        title: "TIM FLAME",
        text: "INTENSITAS API!"
      },
      leaf: {
        icon: "🍃",
        title: "TIM LEAF",
        text: "KEKUATAN ALAM!"
      }
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
    credit: "Sitio creado por <b>PK XD PORTAL</b>",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 Música",
    musicOff: "🔇 Apagar música",
    started: "🚀 Gravedad Cero comenzó",
    fanCountdown: "Cuenta regresiva hecha por fans para PK XD",
    disclaimer: "Esta es una cuenta regresiva hecha por fans, creada por PK XD PORTAL para la comunidad. PK XD, el logotipo de PK XD, la imagen de fondo y la música pertenecen a Afterverse. Este sitio no es oficial y no está afiliado con Afterverse.",
    dateNote: "La fecha de la cuenta regresiva se basa en especulación de la comunidad y observación lógica, ya que los eventos de Gravedad Cero suelen aparecer en junio. La fecha puede cambiar si se anuncia información oficial.",
    feedbackText: "Para mejoras del sitio, nuevos idiomas, preguntas o solicitudes de contacto, escríbenos mediante uno de nuestros enlaces sociales de arriba.",
    afterverseContact: "Si alguien de Afterverse ve este sitio y quiere que cambiemos, demos crédito, eliminemos o ajustemos algo, por favor contáctenos a través de nuestros enlaces sociales. Cooperaremos con gusto para mantener el proyecto respetuoso y dentro de las reglas.",
    downloadTitle: "Descargar / Actualizar PK XD",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "Idioma",
    downloadLabel: "Descargar",
    shareLabel: "Compartir",
    countdownMode: "Cuenta regresiva",
    progressMode: "Progreso",
    progressPassed: "Pasó",
    progressLeft: "Falta",
    progressText: "Progreso hasta el evento",
    shareCopied: "¡Enlace copiado!",
    teamEnergyTitle: "VOTACIÓN DE EQUIPOS GRAVEDAD CERO 2026",
    noTeamSelected: "Elige tu equipo para activar su energía.",
    chooseTeamBtn: "Elegir equipo",
    selectedTeamPrefix: "Tu equipo:",
    selectedTeamSaved: "Equipo elegido:",
    teamAlreadySelected: "Elegido",
    voteStatus: "Los votos se actualizan automáticamente desde el formulario de la comunidad.",
    changeVoteText: "¿Necesitas cambiar tu voto? Contacta con PK XD PORTAL.",
    currentLeader: "Líder actual:",
    teamActivated: "activado",
    voteVolts: "⚡ Votar por Volts",
    voteFlame: "🔥 Votar por Flame",
    voteLeaf: "🍃 Votar por Leaf",

    teams: {
      volts: {
        icon: "⚡",
        title: "EQUIPO VOLTS",
        text: "¡ENERGÍA PURA DEL RAYO!"
      },
      flame: {
        icon: "🔥",
        title: "EQUIPO FLAME",
        text: "¡INTENSIDAD DEL FUEGO!"
      },
      leaf: {
        icon: "🍃",
        title: "EQUIPO LEAF",
        text: "¡FUERZA DE LA NATURALEZA!"
      }
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
    credit: "<b>PK XD PORTAL</b> द्वारा बनाया गया",
    telegramBtn: "Telegram",
    youtubeBtn: "YouTube",
    discordBtn: "Discord",
    musicOn: "🔊 संगीत",
    musicOff: "🔇 संगीत बंद करें",
    started: "🚀 शून्य गुरुत्वाकर्षण शुरू हो गया",
    fanCountdown: "PK XD के लिए फैन काउंटडाउन",
    disclaimer: "यह समुदाय के लिए PK XD PORTAL द्वारा बनाया गया एक फैन काउंटडाउन है। PK XD, PK XD लोगो, बैकग्राउंड इमेज और संगीत Afterverse के हैं। यह वेबसाइट आधिकारिक नहीं है और Afterverse से संबद्ध नहीं है।",
    dateNote: "काउंटडाउन की तारीख समुदाय के अनुमान और तार्किक अवलोकन पर आधारित है, क्योंकि शून्य गुरुत्वाकर्षण इवेंट आमतौर पर जून में आते हैं। आधिकारिक जानकारी आने पर तारीख बदल सकती है।",
    feedbackText: "वेबसाइट सुधार, नई भाषाएँ, सवाल या संपर्क अनुरोधों के लिए ऊपर दिए गए हमारे किसी भी सोशल लिंक से हमें संदेश भेजें।",
    afterverseContact: "अगर Afterverse से कोई इस साइट को देखता है और चाहता है कि हम कुछ बदलें, क्रेडिट दें, हटाएँ या समायोजित करें, तो कृपया हमारे सोशल लिंक के माध्यम से संपर्क करें। हम प्रोजेक्ट को सम्मानजनक और नियमों के भीतर रखने के लिए खुशी से सहयोग करेंगे।",
    downloadTitle: "PK XD डाउनलोड / अपडेट करें",
    googlePlayBtn: "Google Play",
    appStoreBtn: "App Store",
    languageLabel: "भाषा",
    downloadLabel: "डाउनलोड",
    shareLabel: "शेयर",
    countdownMode: "काउंटडाउन",
    progressMode: "प्रगति",
    progressPassed: "बीता",
    progressLeft: "बाकी",
    progressText: "इवेंट तक प्रगति",
    shareCopied: "लिंक कॉपी हो गया!",
    teamEnergyTitle: "शून्य गुरुत्वाकर्षण टीम वोट 2026",
    noTeamSelected: "अपनी टीम चुनें ताकि उसकी ऊर्जा सक्रिय हो सके।",
    chooseTeamBtn: "टीम चुनें",
    selectedTeamPrefix: "आपकी टीम:",
    selectedTeamSaved: "टीम चुनी गई:",
    teamAlreadySelected: "चुनी गई",
    voteStatus: "वोट कम्युनिटी फॉर्म से अपने आप अपडेट होते हैं।",
    changeVoteText: "अपना वोट बदलना है? PK XD PORTAL से संपर्क करें।",
    currentLeader: "मौजूदा लीडर:",
    teamActivated: "सक्रिय",
    voteVolts: "⚡ Volts को वोट दें",
    voteFlame: "🔥 Flame को वोट दें",
    voteLeaf: "🍃 Leaf को वोट दें",

    teams: {
      volts: {
        icon: "⚡",
        title: "टीम VOLTS",
        text: "शुद्ध बिजली ऊर्जा!"
      },
      flame: {
        icon: "🔥",
        title: "टीम FLAME",
        text: "आग की तीव्रता!"
      },
      leaf: {
        icon: "🍃",
        title: "टीम LEAF",
        text: "प्रकृति की शक्ति!"
      }
    }
  }
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

const countdownModeBtn = document.getElementById("countdownModeBtn");
const progressModeBtn = document.getElementById("progressModeBtn");
const progressPanel = document.getElementById("progressPanel");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");

const selectedTeamText = document.getElementById("selectedTeamText");
const voltsPercent = document.getElementById("voltsPercent");
const flamePercent = document.getElementById("flamePercent");
const leafPercent = document.getElementById("leafPercent");
const voteLeader = document.getElementById("voteLeader");
const teamActivatedToast = document.getElementById("teamActivatedToast");

function updateCountdown() {
  const now = new Date();
  const distance = targetDate.getTime() - now.getTime();

  if (distance <= 0) {
    if (countdownInterval) clearInterval(countdownInterval);

    if (timer) {
      timer.innerHTML = `
        <div class="started">
          ${translations[currentLang].started}
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
  progressText.textContent = translations[currentLang].progressText;
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

  const dict = translations[currentLang];

  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (dict[key]) {
      element.innerHTML = dict[key];
    }
  });

  document.querySelectorAll("#languageMenu .lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });

  if (musicToggle) {
    musicToggle.innerHTML = isPlaying ? dict.musicOff : dict.musicOn;
  }

  updateProgress();
  updateTeamEnergy();
  updateChooseButton();

  if (languageMenu) languageMenu.classList.remove("open");
  if (downloadMenu) downloadMenu.classList.remove("open");
}

function openPopup(team) {
  const data = translations[currentLang].teams[team];

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
  if (!team || !translations[currentLang].teams[team]) return;

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

  const dict = translations[currentLang];

  if (selectedTeam === currentPopupTeam) {
    chooseTeamBtn.textContent = dict.teamAlreadySelected;
    chooseTeamBtn.disabled = true;
  } else {
    chooseTeamBtn.textContent = dict.chooseTeamBtn;
    chooseTeamBtn.disabled = false;
  }
}

function updateTeamEnergy() {
  const dict = translations[currentLang];

  if (voltsPercent) voltsPercent.textContent = teamEnergyData.volts + "%";
  if (flamePercent) flamePercent.textContent = teamEnergyData.flame + "%";
  if (leafPercent) leafPercent.textContent = teamEnergyData.leaf + "%";

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
      selectedTeamText.textContent = dict.noTeamSelected;
    }

    updateVoteLeader();
    return;
  }

  const team = translations[currentLang].teams[selectedTeam];

  if (selectedTeamText && team) {
    selectedTeamText.textContent = `${dict.selectedTeamPrefix} ${team.icon} ${team.title}`;
  }

  const selectedEnergyRow = document.querySelector(`.energy-row.${selectedTeam}`);
  if (selectedEnergyRow) {
    selectedEnergyRow.classList.add("selected");
  }

  updateVoteLeader();
}

function updateVoteLeader() {
  if (!voteLeader) return;

  const dict = translations[currentLang];

  const teams = [
    { key: "volts", value: teamEnergyData.volts },
    { key: "flame", value: teamEnergyData.flame },
    { key: "leaf", value: teamEnergyData.leaf }
  ];

  const leader = teams.reduce((max, team) => {
    return team.value > max.value ? team : max;
  }, teams[0]);

  const leaderData = translations[currentLang].teams[leader.key];

  if (!leaderData || leader.value <= 0) {
    voteLeader.textContent = `${dict.currentLeader} —`;
    return;
  }

  voteLeader.textContent = `${dict.currentLeader} ${leaderData.icon} ${leaderData.title} — ${leader.value}%`;
}

function showTeamActivated(team) {
  if (!teamActivatedToast) return;

  const dict = translations[currentLang];
  const teamData = translations[currentLang].teams[team];

  if (!teamData) return;

  teamActivatedToast.textContent = `${teamData.icon} ${teamData.title} ${dict.teamActivated}`;
  teamActivatedToast.className = "team-activated-toast show " + team;
  teamActivatedToast.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    teamActivatedToast.className = "team-activated-toast";
    teamActivatedToast.setAttribute("aria-hidden", "true");
  }, 1800);
}

async function loadTeamEnergyFromSheet() {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL + "&cache=" + Date.now());

    if (!response.ok) {
      throw new Error("Could not load team stats");
    }

    const csvText = await response.text();

    const rows = csvText
      .trim()
      .split("\n")
      .map((row) => row.split(","));

    rows.slice(1).forEach((row) => {
      const team = row[0]?.trim();
      const percent = Number(row[2]?.trim());

      if (
        team &&
        !Number.isNaN(percent) &&
        Object.prototype.hasOwnProperty.call(teamEnergyData, team)
      ) {
        teamEnergyData[team] = percent;
      }
    });

    updateTeamEnergy();
  } catch (error) {
    console.warn("Team stats could not be loaded. Using local fallback.", error);
    updateTeamEnergy();
  }
}

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
    languageMenu.classList.toggle("open");
    downloadMenu.classList.remove("open");
  });
}

if (downloadToggle) {
  downloadToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadMenu.classList.toggle("open");
    languageMenu.classList.remove("open");
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
      music.play();
      musicToggle.classList.add("active");
      musicToggle.innerHTML = translations[currentLang].musicOff;
      isPlaying = true;
    } else {
      music.pause();
      musicToggle.classList.remove("active");
      musicToggle.innerHTML = translations[currentLang].musicOn;
      isPlaying = false;
    }
  });
}

if (countdownModeBtn && progressModeBtn && timer && progressPanel) {
  countdownModeBtn.addEventListener("click", () => {
    timer.classList.remove("hidden");
    progressPanel.classList.remove("active");

    countdownModeBtn.classList.add("active");
    progressModeBtn.classList.remove("active");
  });

  progressModeBtn.addEventListener("click", () => {
    timer.classList.add("hidden");
    progressPanel.classList.add("active");

    progressModeBtn.classList.add("active");
    countdownModeBtn.classList.remove("active");
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
        alert(translations[currentLang].shareCopied);
      }
    } catch (error) {
      await navigator.clipboard.writeText(url);
      alert(translations[currentLang].shareCopied);
    }
  });
}

const savedLang = localStorage.getItem("selectedLang") || "en";

setLanguage(savedLang);
applySelectedTeamTheme();
updateTeamEnergy();
loadTeamEnergyFromSheet();
updateCountdown();

countdownInterval = setInterval(updateCountdown, 1000);
setInterval(loadTeamEnergyFromSheet, 60000);
