// ═══════════════════════════════════════════════════════
//  MIDAS v5 — Konstantalar
// ═══════════════════════════════════════════════════════

export const PHONE_REGEX = /^\+998[0-9]{9}$/;

// ── SOHALAR (Tadbirkor) ──────────────────────────────────
export const SECTORS = [
  { v:"construction",   icon:"🏗", l_uz:"Qurilish",           l_ru:"Строительство",
    sub:[{v:"residential",l_uz:"Uy-joy qurilishi",l_ru:"Жилое строительство"},{v:"commercial",l_uz:"Tijorat qurilishi",l_ru:"Коммерческое"},{v:"renovation",l_uz:"Ta'mirlash",l_ru:"Ремонт"},{v:"interior",l_uz:"Interer dizayn",l_ru:"Интерьер"}]},
  { v:"realestate",     icon:"🏠", l_uz:"Ko'chmas mulk",       l_ru:"Недвижимость",
    sub:[{v:"sale",l_uz:"Sotish",l_ru:"Продажа"},{v:"rent",l_uz:"Ijara",l_ru:"Аренда"},{v:"invest",l_uz:"Investitsiya",l_ru:"Инвестиции"}]},
  { v:"materials",      icon:"🧱", l_uz:"Qurilish mollari",    l_ru:"Стройматериалы",
    sub:[{v:"wholesale",l_uz:"Ulgurji",l_ru:"Оптовые"},{v:"retail",l_uz:"Chakana",l_ru:"Розничные"},{v:"import",l_uz:"Import",l_ru:"Импорт"}]},
  { v:"manufacturing",  icon:"🏭", l_uz:"Ishlab chiqarish",    l_ru:"Производство",
    sub:[{v:"food",l_uz:"Oziq-ovqat",l_ru:"Продукты питания"},{v:"textile",l_uz:"To'qimachilik",l_ru:"Текстиль"},{v:"furniture",l_uz:"Mebel",l_ru:"Мебель"},{v:"other",l_uz:"Boshqa",l_ru:"Другое"}]},
  { v:"education",      icon:"📚", l_uz:"Ta'lim",              l_ru:"Образование",
    sub:[{v:"courses",l_uz:"Kurslar",l_ru:"Курсы"},{v:"school",l_uz:"Maktab",l_ru:"Школа"},{v:"university",l_uz:"Oliy ta'lim",l_ru:"ВУЗ"},{v:"online",l_uz:"Online ta'lim",l_ru:"Онлайн"}]},
  { v:"finance",        icon:"💰", l_uz:"Moliya va bank",      l_ru:"Финансы и банк",
    sub:[{v:"bank",l_uz:"Bank",l_ru:"Банк"},{v:"lombard",l_uz:"Lombard",l_ru:"Ломбард"},{v:"insurance",l_uz:"Sug'urta",l_ru:"Страхование"},{v:"crypto",l_uz:"Kripto",l_ru:"Крипто"}]},
  { v:"auto",           icon:"🚗", l_uz:"Avtomobil",           l_ru:"Автомобили",
    sub:[{v:"sale",l_uz:"Sotish",l_ru:"Продажа"},{v:"service",l_uz:"Servis",l_ru:"Сервис"},{v:"parts",l_uz:"Ehtiyot qismlar",l_ru:"Запчасти"},{v:"rent",l_uz:"Ijara",l_ru:"Аренда"}]},
  { v:"restaurant",     icon:"🍽", l_uz:"Restoran va kafe",    l_ru:"Ресторан и кафе",
    sub:[{v:"restaurant",l_uz:"Restoran",l_ru:"Ресторан"},{v:"cafe",l_uz:"Kafe",l_ru:"Кафе"},{v:"fastfood",l_uz:"Tezkor taom",l_ru:"Фастфуд"},{v:"delivery",l_uz:"Yetkazib berish",l_ru:"Доставка"}]},
  { v:"retail",         icon:"🛒", l_uz:"Chakana savdo",       l_ru:"Розничная торговля",
    sub:[{v:"clothing",l_uz:"Kiyim-kechak",l_ru:"Одежда"},{v:"electronics",l_uz:"Elektronika",l_ru:"Электроника"},{v:"cosmetics",l_uz:"Kosmetika",l_ru:"Косметика"},{v:"sports",l_uz:"Sport",l_ru:"Спорт"}]},
  { v:"household",      icon:"🛋", l_uz:"Uy-ro'zg'or",        l_ru:"Товары для дома",
    sub:[{v:"appliances",l_uz:"Maishiy texnika",l_ru:"Бытовая техника"},{v:"furniture",l_uz:"Mebel",l_ru:"Мебель"},{v:"decor",l_uz:"Dekor",l_ru:"Декор"}]},
  { v:"beverages",      icon:"🥤", l_uz:"Ichimliklar",         l_ru:"Напитки",
    sub:[{v:"soft",l_uz:"Sharbat/suv",l_ru:"Соки/вода"},{v:"tea",l_uz:"Choy/qahva",l_ru:"Чай/кофе"},{v:"energy",l_uz:"Energy drink",l_ru:"Энергетики"}]},
  { v:"medical",        icon:"💊", l_uz:"Tibbiyot",            l_ru:"Медицина",
    sub:[{v:"clinic",l_uz:"Klinika",l_ru:"Клиника"},{v:"pharmacy",l_uz:"Dorixona",l_ru:"Аптека"},{v:"dental",l_uz:"Stomatologiya",l_ru:"Стоматология"},{v:"cosmetology",l_uz:"Kosmetologiya",l_ru:"Косметология"}]},
  { v:"internet",       icon:"🌐", l_uz:"Internet xizmatlari", l_ru:"Интернет-услуги",
    sub:[{v:"ecommerce",l_uz:"E-commerce",l_ru:"E-commerce"},{v:"saas",l_uz:"SaaS",l_ru:"SaaS"},{v:"app",l_uz:"Mobil ilova",l_ru:"Мобильное приложение"},{v:"agency",l_uz:"Agentlik",l_ru:"Агентство"}]},
  { v:"travel",         icon:"✈️", l_uz:"Sayohat",             l_ru:"Туризм",
    sub:[{v:"tours",l_uz:"Turlar",l_ru:"Туры"},{v:"hotel",l_uz:"Mehmonxona",l_ru:"Отель"},{v:"visa",l_uz:"Viza",l_ru:"Виза"}]},
  { v:"recreation",     icon:"🏖", l_uz:"Dam olish",           l_ru:"Отдых и развлечения",
    sub:[{v:"sport",l_uz:"Sport markazi",l_ru:"Спортзал"},{v:"entertainment",l_uz:"O'yin-kulgi",l_ru:"Развлечения"},{v:"beauty",l_uz:"Go'zallik saloni",l_ru:"Салон красоты"}]},
];

// ── PLATFORMALAR ────────────────────────────────────────
export const PLATFORMS_ONLINE = [
  { v:"instagram",   icon:"📸", l_uz:"Instagram",       l_ru:"Instagram",   color:"#E1306C" },
  { v:"youtube",     icon:"▶️", l_uz:"YouTube",          l_ru:"YouTube",     color:"#FF0000" },
  { v:"tiktok",      icon:"🎵", l_uz:"TikTok",           l_ru:"TikTok",      color:"#000000" },
  { v:"telegram",    icon:"✈️", l_uz:"Telegram kanal",  l_ru:"Telegram канал", color:"#0088cc" },
  { v:"telegram_bot",icon:"🤖", l_uz:"Telegram bot",    l_ru:"Telegram бот", color:"#0088cc" },
  { v:"mobile_app",  icon:"📱", l_uz:"Mobil ilova",     l_ru:"Мобильное приложение", color:"#6b46c1" },
  { v:"website",     icon:"🌐", l_uz:"Veb-sayt",        l_ru:"Веб-сайт",    color:"#2d6a4f" },
];

export const PLATFORMS_OFFLINE = [
  { v:"billboard",   icon:"🪧", l_uz:"Billboard",       l_ru:"Билборд",     color:"#c9a84c" },
  { v:"led",         icon:"📺", l_uz:"LED Monitor",     l_ru:"LED Монитор", color:"#e53e3e" },
  { v:"consulting",  icon:"🤝", l_uz:"Suhbatda maslahat", l_ru:"Консультация", color:"#38a169" },
  { v:"events",      icon:"🎪", l_uz:"Tadbirlar",       l_ru:"Мероприятия", color:"#805ad5" },
];

export const PLATFORMS_ALL = [...PLATFORMS_ONLINE, ...PLATFORMS_OFFLINE];

// Match uchun platforma filtri
export const MATCH_PLATFORMS = [...PLATFORMS_ALL];

// ── YOSH GURUHLARI ──────────────────────────────────────
export const AGE_OPTIONS = [
  { v:"13-17",  l_uz:"13–17",  l_ru:"13–17"  },
  { v:"18-24",  l_uz:"18–24",  l_ru:"18–24"  },
  { v:"25-34",  l_uz:"25–34",  l_ru:"25–34"  },
  { v:"35-44",  l_uz:"35–44",  l_ru:"35–44"  },
  { v:"45-54",  l_uz:"45–54",  l_ru:"45–54"  },
  { v:"55+",    l_uz:"55+",    l_ru:"55+"    },
];

// ── OBUNACHI ORALIG'I ───────────────────────────────────
export const FOLLOWER_RANGES = [
  { v:"5k_50k",   l_uz:"5K – 50K",   l_ru:"5K – 50K",   min:5000,    max:50000   },
  { v:"50k_250k", l_uz:"50K – 250K", l_ru:"50K – 250K", min:50000,   max:250000  },
  { v:"250k_1m",  l_uz:"250K – 1M",  l_ru:"250K – 1M",  min:250000,  max:1000000 },
  { v:"1m_5m",    l_uz:"1M – 5M",    l_ru:"1M – 5M",    min:1000000, max:5000000 },
  { v:"5m_plus",  l_uz:"5M+",        l_ru:"5M+",        min:5000000, max:999999999 },
];

// ── HUDUDLAR ────────────────────────────────────────────
export const LOCATIONS = [
  { v:"all",          l_uz:"Butun O'zbekiston", l_ru:"Весь Узбекистан" },
  { v:"toshkent",     l_uz:"Toshkent shahri",   l_ru:"г. Ташкент"      },
  { v:"toshkent_v",   l_uz:"Toshkent viloyati", l_ru:"Ташкентская обл."},
  { v:"samarkand",    l_uz:"Samarqand",          l_ru:"Самарканд"       },
  { v:"buxoro",       l_uz:"Buxoro",             l_ru:"Бухара"          },
  { v:"namangan",     l_uz:"Namangan",           l_ru:"Наманган"        },
  { v:"andijan",      l_uz:"Andijon",            l_ru:"Андижан"         },
  { v:"fergana",      l_uz:"Farg'ona",           l_ru:"Фергана"         },
  { v:"qashqadaryo",  l_uz:"Qashqadaryo",        l_ru:"Кашкадарья"      },
  { v:"surxandaryo",  l_uz:"Surxondaryo",        l_ru:"Сурхандарья"     },
  { v:"xorazm",       l_uz:"Xorazm",             l_ru:"Хорезм"          },
  { v:"navoiy",       l_uz:"Navoiy",             l_ru:"Навои"           },
  { v:"jizzax",       l_uz:"Jizzax",             l_ru:"Джизак"          },
  { v:"sirdaryo",     l_uz:"Sirdaryo",           l_ru:"Сырдарья"        },
  { v:"qoraqalpog",   l_uz:"Qoraqalpog'iston",  l_ru:"Каракалпакстан"  },
];

// ── KAMPANIYA MAQSADLARI ────────────────────────────────
export const CAMPAIGN_GOALS = [
  { v:"brand",       icon:"✨", l_uz:"Brendni tanitish",              l_ru:"Узнаваемость бренда"   },
  { v:"leads",       icon:"🎯", l_uz:"Yangi mijozlarni jalb qilish",  l_ru:"Привлечение клиентов"  },
  { v:"sales",       icon:"💰", l_uz:"Sotuv amalga oshirish",         l_ru:"Увеличение продаж"     },
  { v:"discount",    icon:"🏷", l_uz:"Chegirmalar haqida bildirish",  l_ru:"Акции и скидки"        },
  { v:"loyalty",     icon:"👑", l_uz:"Doimiy liderlik",               l_ru:"Лояльность клиентов"   },
  { v:"other",       icon:"✏️", l_uz:"Boshqa maqsad (o'zingiz yozing)", l_ru:"Другая цель (напишите)" },
];

// ── QIZIQISHLAR (sohaga bog'liq) ─────────────────────────
export const SECTOR_INTERESTS = {
  construction:  ["Qurilish texnologiyalari","Uy dizayni","Investitsiya","Ko'chmas mulk","Smart home"],
  realestate:    ["Ko'chmas mulk","Investitsiya","Ipoteka","Uy dizayni","Qurilish"],
  education:     ["Online ta'lim","Karriera","IT","Til o'rganish","Biznes"],
  auto:          ["Avtomobil","Sport","Texnologiya","Turizm"],
  restaurant:    ["Ovqatlanish","Milliy taomlar","Dam olish","Salomatlik"],
  medical:       ["Salomatlik","Sport","Go'zallik","Oziq-ovqat"],
  retail:        ["Moda","Texnologiya","Go'zallik","Sport","Uy"],
  finance:       ["Investitsiya","Kripto","Biznes","Ko'chmas mulk"],
  travel:        ["Turizm","Dam olish","Sport","Fotografiya"],
  internet:      ["IT","Startap","Marketing","Dizayn","E-commerce"],
  default:       ["Biznes","Marketing","Texnologiya","Moda","Sport","Oziq-ovqat","Sayohat","San'at","Musiqa","O'yin","Ko'chmas mulk","Salomatlik","Ta'lim","Avtomobil","Go'zallik"],
};

// ── REVIEW TEGLARI ──────────────────────────────────────
export const REVIEW_TAGS = {
  uz: ["Aloqa yaxshi","O'z vaqtida","Sifatli ish","Kafolatli","Narx mos","Tavsiya qilaman","Professional","Qaytadan ishlayman"],
  ru: ["Хорошая связь","Вовремя","Качественная работа","Надёжный","Цена подходит","Рекомендую","Профессионал","Снова обращусь"],
};

// ── ACHIEVEMENT BADGES ──────────────────────────────────
export const BADGES = {
  first_deal:   { icon:"🥇", l_uz:"Birinchi bitim",     l_ru:"Первая сделка"   },
  five_star:    { icon:"⭐", l_uz:"5 yulduzli hamkor",  l_ru:"5-звёздный партнёр" },
  trusted:      { icon:"🛡", l_uz:"Ishonchli hamkor",   l_ru:"Надёжный партнёр"},
  premium:      { icon:"💎", l_uz:"Premium a'zo",       l_ru:"Premium участник" },
  top_match:    { icon:"🎯", l_uz:"Top Match",          l_ru:"Top Match"       },
  verified:     { icon:"✅", l_uz:"Tasdiqlangan",       l_ru:"Верифицирован"   },
  hundred_deals:{ icon:"💯", l_uz:"100 bitim",          l_ru:"100 сделок"      },
};

// ── PREMIUM TARIFLAR ────────────────────────────────────
export const PREMIUM_PLANS = {
  uz: [
    { id:"monthly", name:"Oylik",   price:"99 000 so'm",  period:"/ oy",  features:["Top ko'rinish","AI maslahat","Cheksiz taklif","Analytics"] },
    { id:"yearly",  name:"Yillik",  price:"790 000 so'm", period:"/ yil", features:["Top ko'rinish","AI maslahat","Cheksiz taklif","Analytics","Boost x2","Agentlik panel"], best:true },
  ],
  ru: [
    { id:"monthly", name:"Месячный", price:"99 000 сум", period:"/ мес",  features:["Top видимость","AI советник","Безлимит предл.","Аналитика"] },
    { id:"yearly",  name:"Годовой",  price:"790 000 сум", period:"/ год", features:["Top видимость","AI советник","Безлимит предл.","Аналитика","Boost x2","Агентство панель"], best:true },
  ],
};
