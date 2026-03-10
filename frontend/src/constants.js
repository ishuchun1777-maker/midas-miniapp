// ═══════════════════════════════════════════════════════
// MIDAS V8 — KONSTANTALAR
// ═══════════════════════════════════════════════════════

// ── 5 ROL ─────────────────────────────────────────────
export const ROLES = [
  { v: "tadbirkor",   icon: "🏢", l_uz: "Tadbirkor",   l_ru: "Предприниматель", desc_uz: "Biznesimni reklamalashni xohlayman", desc_ru: "Хочу рекламировать свой бизнес" },
  { v: "reklamachi",  icon: "📢", l_uz: "Reklamachi",  l_ru: "Рекламодатель",   desc_uz: "Reklama xizmatlarini taklif qilaman", desc_ru: "Предлагаю рекламные услуги" },
  { v: "agentlik",    icon: "🏆", l_uz: "Agentlik",    l_ru: "Агентство",       desc_uz: "Bir nechta reklamachilarni boshqaraman", desc_ru: "Управляю несколькими рекламщиками" },
  { v: "dizayner",    icon: "🎨", l_uz: "Dizayner",    l_ru: "Дизайнер",        desc_uz: "Kontent va dizayn yarataman", desc_ru: "Создаю контент и дизайн" },
  { v: "media_buyer", icon: "📊", l_uz: "Media Buyer", l_ru: "Медиабаер",       desc_uz: "Reklama byudjetlarini boshqaraman", desc_ru: "Управляю рекламными бюджетами" },
];

// ── SOHALAR ───────────────────────────────────────────
export const SECTORS = [
  { v: "construction",  icon: "🏗", l_uz: "Qurilish",           l_ru: "Строительство" },
  { v: "realestate",    icon: "🏠", l_uz: "Ko'chmas mulk",      l_ru: "Недвижимость" },
  { v: "materials",     icon: "🧱", l_uz: "Qurilish materiallari", l_ru: "Стройматериалы" },
  { v: "manufacturing", icon: "🏭", l_uz: "Ishlab chiqarish",   l_ru: "Производство" },
  { v: "education",     icon: "🎓", l_uz: "Ta'lim",             l_ru: "Образование" },
  { v: "finance",       icon: "💰", l_uz: "Moliya / Bank",      l_ru: "Финансы / Банк" },
  { v: "auto",          icon: "🚗", l_uz: "Avtomobil",          l_ru: "Авто" },
  { v: "restaurant",    icon: "🍽", l_uz: "Restoran / Cafe",    l_ru: "Ресторан / Кафе" },
  { v: "retail",        icon: "🛍", l_uz: "Savdo / Do'kon",     l_ru: "Торговля / Магазин" },
  { v: "household",     icon: "🏡", l_uz: "Uy-ro'zg'or",        l_ru: "Товары для дома" },
  { v: "fashion",       icon: "👗", l_uz: "Moda / Kiyim",       l_ru: "Мода / Одежда" },
  { v: "beauty",        icon: "💄", l_uz: "Go'zallik / Spa",    l_ru: "Красота / Спа" },
  { v: "medical",       icon: "🏥", l_uz: "Tibbiyot",           l_ru: "Медицина" },
  { v: "pharma",        icon: "💊", l_uz: "Farmatsevtika",      l_ru: "Фармацевтика" },
  { v: "internet",      icon: "💻", l_uz: "Internet / IT",      l_ru: "Интернет / IT" },
  { v: "ecommerce",     icon: "🛒", l_uz: "E-commerce",         l_ru: "Электронная торговля" },
  { v: "travel",        icon: "✈️", l_uz: "Sayohat / Turizm",   l_ru: "Туризм / Путешествия" },
  { v: "recreation",    icon: "🎭", l_uz: "O'yin-kulgi",        l_ru: "Развлечения" },
  { v: "logistics",     icon: "🚚", l_uz: "Logistika",          l_ru: "Логистика" },
  { v: "agro",          icon: "🌾", l_uz: "Qishloq xo'jaligi", l_ru: "Сельское хозяйство" },
  { v: "beverages",     icon: "🥤", l_uz: "Oziq-ovqat / Ichimlik", l_ru: "Продукты / Напитки" },
  { v: "sport",         icon: "⚽", l_uz: "Sport / Fitness",    l_ru: "Спорт / Фитнес" },
  { v: "legal",         icon: "⚖️", l_uz: "Yuridik xizmatlar", l_ru: "Юридические услуги" },
  { v: "other",         icon: "📦", l_uz: "Boshqa",             l_ru: "Другое" },
];

// ── HUDUDLAR ──────────────────────────────────────────
export const REGIONS = [
  { v: "toshkent_sh",   icon: "🌆", l_uz: "Toshkent shahri",   l_ru: "г. Ташкент" },
  { v: "toshkent_v",    icon: "🏙", l_uz: "Toshkent viloyati", l_ru: "Ташкентская обл." },
  { v: "samarqand",     icon: "🕌", l_uz: "Samarqand",         l_ru: "Самарканд" },
  { v: "buxoro",        icon: "🏯", l_uz: "Buxoro",            l_ru: "Бухара" },
  { v: "andijon",       icon: "🏔", l_uz: "Andijon",           l_ru: "Андижан" },
  { v: "fargona",       icon: "🌸", l_uz: "Farg'ona",          l_ru: "Фергана" },
  { v: "namangan",      icon: "🌿", l_uz: "Namangan",          l_ru: "Наманган" },
  { v: "qashqadaryo",   icon: "🌄", l_uz: "Qashqadaryo",       l_ru: "Кашкадарья" },
  { v: "surxondaryo",   icon: "🌅", l_uz: "Surxondaryo",       l_ru: "Сурхандарья" },
  { v: "xorazm",        icon: "🌊", l_uz: "Xorazm",            l_ru: "Хорезм" },
  { v: "navoiy",        icon: "💎", l_uz: "Navoiy",            l_ru: "Навои" },
  { v: "jizzax",        icon: "🌻", l_uz: "Jizzax",            l_ru: "Джизак" },
  { v: "sirdaryo",      icon: "🌾", l_uz: "Sirdaryo",          l_ru: "Сырдарья" },
  { v: "qoraqalpog",    icon: "🏜", l_uz: "Qoraqalpog'iston", l_ru: "Каракалпакстан" },
  { v: "butun_uz",      icon: "🇺🇿", l_uz: "Butun O'zbekiston", l_ru: "Весь Узбекистан" },
];

// ── PLATFORMALAR ──────────────────────────────────────
export const PLATFORMS_ONLINE = [
  { v: "instagram",  icon: "📸", l_uz: "Instagram",  l_ru: "Instagram" },
  { v: "telegram",   icon: "✈️", l_uz: "Telegram",   l_ru: "Telegram" },
  { v: "tiktok",     icon: "🎵", l_uz: "TikTok",     l_ru: "TikTok" },
  { v: "youtube",    icon: "▶️", l_uz: "YouTube",    l_ru: "YouTube" },
  { v: "facebook",   icon: "👥", l_uz: "Facebook",   l_ru: "Facebook" },
  { v: "twitter",    icon: "🐦", l_uz: "X (Twitter)", l_ru: "X (Twitter)" },
  { v: "vk",         icon: "🔵", l_uz: "VK",         l_ru: "ВКонтакте" },
  { v: "website",    icon: "🌐", l_uz: "Website / Blog", l_ru: "Сайт / Блог" },
];

export const PLATFORMS_OFFLINE = [
  { v: "billboard",  icon: "🪧", l_uz: "Billboard",     l_ru: "Билборд" },
  { v: "tv",         icon: "📺", l_uz: "Televideniye",  l_ru: "Телевидение" },
  { v: "radio",      icon: "📻", l_uz: "Radio",         l_ru: "Радио" },
  { v: "print",      icon: "📰", l_uz: "Matbuot",       l_ru: "Пресса" },
  { v: "event",      icon: "🎪", l_uz: "Tadbir / Event", l_ru: "Мероприятие" },
  { v: "influencer", icon: "⭐", l_uz: "Influencer",    l_ru: "Инфлюенсер" },
];

export const PLATFORMS_ALL = [...PLATFORMS_ONLINE, ...PLATFORMS_OFFLINE];

// ── YOSH GURUHLARI ────────────────────────────────────
export const AGE_GROUPS = [
  { v: "13-17",  l_uz: "13–17 yosh",  l_ru: "13–17 лет" },
  { v: "18-24",  l_uz: "18–24 yosh",  l_ru: "18–24 лет" },
  { v: "25-34",  l_uz: "25–34 yosh",  l_ru: "25–34 лет" },
  { v: "35-44",  l_uz: "35–44 yosh",  l_ru: "35–44 лет" },
  { v: "45-54",  l_uz: "45–54 yosh",  l_ru: "45–54 лет" },
  { v: "55+",    l_uz: "55+ yosh",    l_ru: "55+ лет" },
];

// ── SOHA BO'YICHA QIZIQISHLAR (AI asosida) ────────────
export const SECTOR_INTERESTS = {
  construction:  ["Qurilish texnologiyalari", "Uy dizayni", "Interior", "Ko'chmas mulk", "Investitsiya", "Repair & Renovation"],
  realestate:    ["Uy sotib olish", "Ipoteka", "Investitsiya", "Ko'chmas mulk bozori", "Interior dizayn", "Yangi quruvchilar"],
  education:     ["Online ta'lim", "Kurslar", "Bolalar ta'limi", "IELTS/SAT", "Kasbiy rivojlanish", "Til o'rganish", "Universitetlar"],
  finance:       ["Investitsiya", "Kredit", "Sug'urta", "Kriptovalyuta", "Tejash", "Pul o'tkazish"],
  auto:          ["Mashina yangiliklari", "Avtoservis", "Ehtiyot qismlar", "Avtokredid", "Turing mashinalari"],
  restaurant:    ["Oziq-ovqat", "Brunch", "Fast food", "Milliy taomlar", "Delivery", "Ovqatlanish joylari"],
  retail:        ["Chegirmalar", "Online xarid", "Hamyonbop do'konlar", "Brendlar", "Aktsiyalar"],
  fashion:       ["Moda trendlari", "Premium kiyim", "Ko'cha uslubi", "Sport kiyimi", "Aksessuarlar"],
  beauty:        ["Kosmetika", "Mehnatkash ayollar", "Sog'lom turmush", "Spa va go'zallik", "Parfyumeriya"],
  medical:       ["Sog'liq", "Klinikalar", "Dori-darmon", "Profilaktika", "Tibbiy asbob-uskunalar"],
  internet:      ["Texnologiya", "Gadgetlar", "Dasturlash", "Gaming", "Startup", "Ilovalar", "Kiberxavfsizlik"],
  travel:        ["Sayohat", "Avantyura", "Mehmonxonalar", "Aviachiptalar", "Backpacking", "Turizm"],
  sport:         ["Fitness", "Sog'lom ovqatlanish", "Trening", "Sport yangiliklari", "Outdoor"],
  beverages:     ["Sog'lom oziq-ovqat", "Ekologik mahsulotlar", "Organik", "Restoran va kafe", "Fast food"],
  agro:          ["Fermerlik", "Organic", "Qishloq xo'jaligi texnikasi", "Eksport", "Agrobiznes"],
  ecommerce:     ["Online xarid", "Brendlar", "Chegirmalar", "Logistika", "Dropshipping"],
  logistics:     ["Yuk tashish", "Eksport/Import", "Xalqaro yetkazib berish", "Omborxona"],
  manufacturing: ["Sanoat", "Eksport", "Ishlab chiqarish texnologiyalari", "B2B"],
  default:       ["Biznes", "Reklama", "Marketing", "Ijtimoiy tarmoqlar", "Brendlash"],
};

// ── OBUNACHI SONI ─────────────────────────────────────
export const FOLLOWER_RANGES = [
  { v: "micro",   l_uz: "1K–10K (Micro)",   l_ru: "1K–10K (Микро)" },
  { v: "mid",     l_uz: "10K–50K",          l_ru: "10K–50K" },
  { v: "large",   l_uz: "50K–200K",         l_ru: "50K–200K" },
  { v: "macro",   l_uz: "200K–1M (Macro)",  l_ru: "200K–1M (Макро)" },
  { v: "mega",    l_uz: "1M+ (Mega)",       l_ru: "1M+ (Мега)" },
];

// ── REKLAMA MAQSADLARI ────────────────────────────────
export const AD_GOALS = [
  { v: "awareness", icon: "📢", l_uz: "Brend tanishtiruv",     l_ru: "Узнаваемость бренда" },
  { v: "reach",     icon: "👁", l_uz: "Ko'proq qamrov",        l_ru: "Охват аудитории" },
  { v: "traffic",   icon: "🌐", l_uz: "Saytga tashrif",        l_ru: "Трафик на сайт" },
  { v: "leads",     icon: "📋", l_uz: "Mijoz jalb qilish",     l_ru: "Привлечение клиентов" },
  { v: "sales",     icon: "💰", l_uz: "Savdoni oshirish",      l_ru: "Увеличение продаж" },
  { v: "install",   icon: "📱", l_uz: "Ilova yuklamalari",     l_ru: "Установки приложения" },
  { v: "event",     icon: "🎪", l_uz: "Tadbir targ'iboti",     l_ru: "Продвижение события" },
  { v: "retention", icon: "🔄", l_uz: "Mijozlarni saqlab qolish", l_ru: "Удержание клиентов" },
];

// ── KAFOLAT TURLARI ───────────────────────────────────
export const PROOF_TYPES = [
  { v: "screenshot", icon: "📸", l_uz: "Screenshot",         l_ru: "Скриншот" },
  { v: "link",       icon: "🔗", l_uz: "Post havolasi",      l_ru: "Ссылка на пост" },
  { v: "stats",      icon: "📊", l_uz: "Statistika (reach)", l_ru: "Статистика (охват)" },
  { v: "video",      icon: "🎬", l_uz: "Video dalil",        l_ru: "Видео-доказательство" },
];

// ── PREMIUM REJALAR ───────────────────────────────────
export const PREMIUM_PLANS = [
  {
    id: "starter",
    icon: "⚡",
    l_uz: "Starter",    l_ru: "Стартер",
    price_uz: 49900, price_ru: 49900,
    days: 30,
    features_uz: ["Top ko'rinish", "50 ta taklif/oy", "AI maslahat", "Analytics"],
    features_ru: ["Топ-позиция", "50 предложений/мес", "AI советы", "Аналитика"],
  },
  {
    id: "pro",
    icon: "🚀",
    l_uz: "Pro",         l_ru: "Про",
    price_uz: 99900, price_ru: 99900,
    days: 30,
    popular: true,
    features_uz: ["Barcha Starter imkoniyatlari", "Cheksiz takliflar", "Kafolat tizimi", "Prioritet qo'llab-quvvatlash", "Bozor analitikasi"],
    features_ru: ["Все из Стартера", "Безлимит предложений", "Система гарантий", "Приоритетная поддержка", "Анализ рынка"],
  },
  {
    id: "business",
    icon: "👑",
    l_uz: "Business",   l_ru: "Бизнес",
    price_uz: 199900, price_ru: 199900,
    days: 30,
    features_uz: ["Barcha Pro imkoniyatlari", "Agentlik boshqaruvi", "Maxsus shartnomalar", "Dedicated manager", "API integratsiya"],
    features_ru: ["Все из Про", "Управление агентством", "Специальные контракты", "Выделенный менеджер", "API интеграция"],
  },
];

// ── SHARH TEGLARI ─────────────────────────────────────
export const REVIEW_TAGS = {
  positive: {
    uz: ["O'z vaqtida", "Professional", "Sifatli ish", "Ijodiy yondashuv", "Yana ishlardim", "Tavsiya qilaman", "Narxi qulay", "Muloqot yaxshi"],
    ru: ["Вовремя", "Профессионал", "Качественная работа", "Творческий подход", "Поработал бы снова", "Рекомендую", "Доступная цена", "Хорошая коммуникация"],
  },
  negative: {
    uz: ["Kechikish", "Sifat past", "Muloqot qiyin", "Kelishmovchilik", "Takrorlanmas"],
    ru: ["Задержка", "Низкое качество", "Сложная коммуникация", "Несоответствие", "Не повторю"],
  },
};

// ── SOHA BO'YICHA FILTER MUHIMLIGI ────────────────────
export const SECTOR_FILTER_IMPORTANCE = {
  construction:  { location: 3, age: 1, gender: 1 },
  realestate:    { location: 3, age: 3, gender: 1 },
  education:     { location: 2, age: 3, gender: 1 },
  finance:       { location: 2, age: 3, gender: 1 },
  auto:          { location: 2, age: 2, gender: 3 },
  restaurant:    { location: 3, age: 2, gender: 1 },
  retail:        { location: 2, age: 2, gender: 3 },
  fashion:       { location: 2, age: 3, gender: 3 },
  beauty:        { location: 2, age: 3, gender: 3 },
  medical:       { location: 3, age: 3, gender: 1 },
  internet:      { location: 1, age: 3, gender: 1 },
  travel:        { location: 1, age: 3, gender: 2 },
  sport:         { location: 2, age: 3, gender: 2 },
  beverages:     { location: 2, age: 2, gender: 1 },
  default:       { location: 2, age: 2, gender: 2 },
};
