import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// CONFIG
// ============================================================
const API_BASE = process.env.REACT_APP_API_URL || "https://your-app.onrender.com";
const tg = window.Telegram?.WebApp;

// ============================================================
// TRANSLATIONS
// ============================================================
const T = {
  uz: {
    appName: "MIDAS",
    loading: "Yuklanmoqda...",
    onb1Title: "MIDAS ga xush kelibsiz!",
    onb1Desc: "O'zbekistonning #1 reklama platformasi. Tadbirkorlar va reklamachilarni AI orqali birlashtiradi.",
    onb2Title: "AI Matching tizimi",
    onb2Desc: "100 ballik aqlli algoritm sizga eng mos hamkorni topadi.",
    onb3Title: "Xavfsiz muloqot",
    onb3Desc: "Platforma ichida bevosita chat, taklif va shartnoma imkoniyati.",
    next: "Davom →", start: "Boshlash 🚀",
    chooseRole: "Rolingizni tanlang",
    roleDesc: "Bu sizning tajribangizni moslashtiradi",
    tadbirkor: "Tadbirkor", tadbirkorDesc: "Biznesimni reklama qilish uchun reklamachi topaman",
    reklamachi: "Reklamachi", reklamachiDesc: "Kanalim orqali reklama qabul qilaman",
    yourInfo: "Ma'lumotlaringiz",
    fullName: "Ism Familiya", phone: "Telefon (ixtiyoriy)",
    register: "Ro'yxatdan o'tish ✓", saving: "⏳ Saqlanmoqda...",
    back: "← Orqaga", next2: "Davom →", save: "✓ Saqlash",
    step: "Qadam", of: "/",
    match: "Qidirish", offers: "Takliflar", chats: "Chatlar", profile: "Profil",
    all: "Hammasi", top: "⭐ Top (70+)", premium: "👑 Premium",
    searching: "Yuklanmoqda...", noMatch: "Hozircha hech kim topilmadi",
    noMatchSub: "Profilingizni to'ldiring yoki keyinroq qaytib keling",
    sendOffer: "📩 Taklif", sent: "✓ Yuborildi",
    detail: "Batafsil ↓", less: "Yig'ish ↑",
    incoming: "📥 Kelgan", outgoing: "📤 Yuborilgan", accepted: "✅ Qabul",
    pending: "Kutilmoqda", acceptedStatus: "Qabul qilindi", rejected: "Rad etildi",
    accept: "✓ Qabul", reject: "✗ Rad",
    rate: "Baholang:", noOffers: "Taklif yo'q",
    noChats: "Chatlar yo'q", noChatsSub: "Taklif qabul qilinganidan so'ng chat ochiladi",
    typeMessage: "Xabar yozing...", online: "Online",
    editProfile: "✏️ Profilni tahrirlash",
    deals: "Bitimlar", totalOffers: "Takliflar", totalChats: "Chatlar",
    notEntered: "Kiritilmagan", regDate: "Ro'yxat sanasi",
    sector: "Soha", chooseSector: "Biznesingiz sohasini tanlang",
    audience: "Maqsadli auditoriya", audienceSub: "Kimga reklama qilmoqchisiz?",
    ageGroup: "Yosh guruhi", gender: "Jins",
    male: "👨 Erkak", female: "👩 Ayol", both: "👥 Hammasi",
    region: "Hudud",
    interests: "Qiziqishlar", interestsSub: "Mijozlaringiz nimani yaxshi ko'radi?",
    requirements: "Reklamachi talablari", requirementsSub: "Qanday reklamachi kerak?",
    followers: "Obunachi",
    platform: "Platforma", platformSub: "Qaysi platformada faolsiz?",
    profileInfo: "Profil ma'lumotlari", profileInfoSub: "Sahifangiz haqida",
    username: "Foydalanuvchi nomi", profileLink: "Profil linki",
    followersCount: "Obunachi soni", engagement: "Aktivlik % (ER)",
    prices: "Narxlar", pricesSub: "Reklama narxlaringiz (so'm)",
    postPrice: "Post narxi", storyPrice: "Story narxi", videoPrice: "Video narxi",
    audienceInfo: "Auditoriya", audienceInfoSub: "Obunachilari kim?",
    ageMain: "Asosiy yosh guruhi", genderMain: "Asosiy auditoriya jinsi", mixed: "👥 Aralash",
    locationMain: "Auditoriya joylashuvi",
    interestsAud: "Qiziqishlar", interestsAudSub: "Auditoriyangiz nimaga qiziqadi?",
    notifications: "Bildirishnomalar", noNotif: "Bildirishnoma yo'q",
    markRead: "Barchasini o'qildi deb belgilash",
    adminPanel: "Admin panel",
    totalUsers: "Jami foydalanuvchilar",
    acceptedOffers: "Qabul qilingan takliflar",
    activeChats: "Faol chatlar",
    verifyQueue: "Tekshirish navbati",
    noQueue: "Navbat bo'sh",
    verify: "✅ Tasdiqlash", verifyReject: "❌ Rad etish",
    givePremium: "⭐ Premium berish", removePremium: "Premium olish",
    blockUser: "🚫 Bloklash", unblockUser: "🔓 Blokdan chiqarish",
    users: "Foydalanuvchilar",
    ball: "ball",
    obs: "obs",
    aiMatch: "AI matching natijalari",
    found: "ta topildi",
    offerMsg: "Sizga hamkorlik taklif qilmoqchiman. Ko'rib chiqishingizni so'rayman.",
    ago: "oldin", now: "Hozir", min: "daq", hour: "soat", day: "kun",
    error: "Xatolik", alreadySent: "Allaqachon yuborilgan",
    langUz: "🇺🇿 O'zbekcha", langRu: "🇷🇺 Русский",
  },
  ru: {
    appName: "MIDAS",
    loading: "Загрузка...",
    onb1Title: "Добро пожаловать в MIDAS!",
    onb1Desc: "Платформа #1 в Узбекистане. Объединяет предпринимателей и рекламщиков через AI.",
    onb2Title: "Система AI Matching",
    onb2Desc: "100-балльный алгоритм найдёт вам идеального партнёра.",
    onb3Title: "Безопасное общение",
    onb3Desc: "Чат, предложения и договоры прямо внутри платформы.",
    next: "Далее →", start: "Начать 🚀",
    chooseRole: "Выберите роль",
    roleDesc: "Это настроит ваш опыт",
    tadbirkor: "Предприниматель", tadbirkorDesc: "Ищу рекламщика для своего бизнеса",
    reklamachi: "Рекламщик", reklamachiDesc: "Принимаю рекламу через свой канал",
    yourInfo: "Ваши данные",
    fullName: "Имя Фамилия", phone: "Телефон (необязательно)",
    register: "Зарегистрироваться ✓", saving: "⏳ Сохранение...",
    back: "← Назад", next2: "Далее →", save: "✓ Сохранить",
    step: "Шаг", of: "/",
    match: "Поиск", offers: "Предложения", chats: "Чаты", profile: "Профиль",
    all: "Все", top: "⭐ Топ (70+)", premium: "👑 Премиум",
    searching: "Загрузка...", noMatch: "Никого не найдено",
    noMatchSub: "Заполните профиль или вернитесь позже",
    sendOffer: "📩 Предложить", sent: "✓ Отправлено",
    detail: "Подробнее ↓", less: "Свернуть ↑",
    incoming: "📥 Входящие", outgoing: "📤 Исходящие", accepted: "✅ Принятые",
    pending: "Ожидание", acceptedStatus: "Принято", rejected: "Отклонено",
    accept: "✓ Принять", reject: "✗ Отказать",
    rate: "Оцените:", noOffers: "Нет предложений",
    noChats: "Нет чатов", noChatsSub: "Чат открывается после принятия предложения",
    typeMessage: "Напишите сообщение...", online: "Онлайн",
    editProfile: "✏️ Редактировать профиль",
    deals: "Сделки", totalOffers: "Предложения", totalChats: "Чаты",
    notEntered: "Не указано", regDate: "Дата регистрации",
    sector: "Сфера", chooseSector: "Выберите сферу бизнеса",
    audience: "Целевая аудитория", audienceSub: "Кому вы хотите рекламировать?",
    ageGroup: "Возрастная группа", gender: "Пол",
    male: "👨 Мужской", female: "👩 Женский", both: "👥 Все",
    region: "Регион",
    interests: "Интересы", interestsSub: "Что любят ваши клиенты?",
    requirements: "Требования к рекламщику", requirementsSub: "Какой рекламщик нужен?",
    followers: "Подписчики",
    platform: "Платформа", platformSub: "На какой платформе вы активны?",
    profileInfo: "Данные профиля", profileInfoSub: "О вашей странице",
    username: "Имя пользователя", profileLink: "Ссылка на профиль",
    followersCount: "Количество подписчиков", engagement: "Активность % (ER)",
    prices: "Цены", pricesSub: "Цены на рекламу (сум)",
    postPrice: "Цена поста", storyPrice: "Цена сторис", videoPrice: "Цена видео",
    audienceInfo: "Аудитория", audienceInfoSub: "Кто ваши подписчики?",
    ageMain: "Основная возрастная группа", genderMain: "Пол аудитории", mixed: "👥 Смешанный",
    locationMain: "Локация аудитории",
    interestsAud: "Интересы", interestsAudSub: "Чем интересуется ваша аудитория?",
    notifications: "Уведомления", noNotif: "Нет уведомлений",
    markRead: "Отметить всё как прочитанное",
    adminPanel: "Панель администратора",
    totalUsers: "Всего пользователей",
    acceptedOffers: "Принятые предложения",
    activeChats: "Активные чаты",
    verifyQueue: "Очередь проверки",
    noQueue: "Очередь пуста",
    verify: "✅ Подтвердить", verifyReject: "❌ Отклонить",
    givePremium: "⭐ Дать Премиум", removePremium: "Убрать Премиум",
    blockUser: "🚫 Заблокировать", unblockUser: "🔓 Разблокировать",
    users: "Пользователи",
    ball: "балл",
    obs: "подп",
    aiMatch: "Результаты AI matching",
    found: "найдено",
    offerMsg: "Хочу предложить вам сотрудничество. Прошу рассмотреть.",
    ago: "назад", now: "Сейчас", min: "мин", hour: "ч", day: "д",
    error: "Ошибка", alreadySent: "Уже отправлено",
    langUz: "🇺🇿 O'zbekcha", langRu: "🇷🇺 Русский",
  }
};

// ============================================================
// CONSTANTS
// ============================================================
const SECTORS_UZ = [
  {l:"🏢 Ko'chmas mulk",v:"real_estate"},{l:"🏗 Qurilish mollari",v:"construction_materials"},
  {l:"🏭 Ishlab chiqarish",v:"manufacturing"},{l:"💰 Bank va lombard",v:"banking"},
  {l:"📚 Ta'lim",v:"education"},{l:"🚗 Avtomobil",v:"auto_transport"},
  {l:"🛒 Chakana savdo",v:"retail"},{l:"🍽 Restoran",v:"restaurant"},
  {l:"🛋 Uy jihozlari",v:"home_appliances"},{l:"🥤 Ichimliklar",v:"beverages"},
  {l:"💊 Tibbiyot",v:"medical"},{l:"🌐 Internet",v:"internet_services"},
];
const SECTORS_RU = [
  {l:"🏢 Недвижимость",v:"real_estate"},{l:"🏗 Стройматериалы",v:"construction_materials"},
  {l:"🏭 Производство",v:"manufacturing"},{l:"💰 Банки",v:"banking"},
  {l:"📚 Образование",v:"education"},{l:"🚗 Авто",v:"auto_transport"},
  {l:"🛒 Розничная торговля",v:"retail"},{l:"🍽 Ресторан",v:"restaurant"},
  {l:"🛋 Мебель",v:"home_appliances"},{l:"🥤 Напитки",v:"beverages"},
  {l:"💊 Медицина",v:"medical"},{l:"🌐 Интернет",v:"internet_services"},
];

const AGES = [
  {l:"18 yoshdan kichik / До 18",v:"under_18"},
  {l:"18–25",v:"18_25"},{l:"25–35",v:"25_35"},
  {l:"35–45",v:"35_45"},{l:"45–55",v:"45_55"},
  {l:"55+",v:"over_55"},
];

const LOCATIONS_UZ = [
  {l:"Toshkent shahri",v:"tashkent_city"},{l:"Toshkent viloyati",v:"tashkent_region"},
  {l:"Samarqand",v:"samarqand"},{l:"Buxoro",v:"buxoro"},
  {l:"Farg'ona",v:"fergana"},{l:"Andijon",v:"andijan"},
  {l:"Namangan",v:"namangan"},{l:"Qashqadaryo",v:"kashkadarya"},
  {l:"Surxondaryo",v:"surkhandarya"},{l:"Xorazm",v:"khorezm"},
  {l:"Jizzax",v:"jizzakh"},{l:"Navoiy",v:"navoi"},
  {l:"Sirdaryo",v:"syrdarya"},{l:"Qoraqalpog'iston",v:"karakalpakstan"},
  {l:"Butun O'zbekiston",v:"all"},
];
const LOCATIONS_RU = [
  {l:"г. Ташкент",v:"tashkent_city"},{l:"Ташкентская обл.",v:"tashkent_region"},
  {l:"Самарканд",v:"samarqand"},{l:"Бухара",v:"buxoro"},
  {l:"Фергана",v:"fergana"},{l:"Андижан",v:"andijan"},
  {l:"Наманган",v:"namangan"},{l:"Кашкадарья",v:"kashkadarya"},
  {l:"Сурхандарья",v:"surkhandarya"},{l:"Хорезм",v:"khorezm"},
  {l:"Джизак",v:"jizzakh"},{l:"Навои",v:"navoi"},
  {l:"Сырдарья",v:"syrdarya"},{l:"Каракалпакстан",v:"karakalpakstan"},
  {l:"Весь Узбекистан",v:"all"},
];

const INTERESTS = [
  "😄 Kulgu","📰 Yangiliklar","💼 Tadbirkorlik","📊 Moliya",
  "👔 Moda","💄 Go'zallik","📚 Ta'lim","💊 Salomatlik",
  "💻 IT","🚗 Avto","🍳 Taom","🎵 Musiqa",
  "✈️ Sayohat","⚽ Sport","🌟 Life style","👨‍👩‍👧 Oila",
];

const PLATFORMS = [
  {l:"📸 Instagram",v:"instagram"},{l:"🎥 YouTube",v:"youtube"},
  {l:"📱 Telegram kanal",v:"telegram_channel"},{l:"🤖 Telegram bot",v:"telegram_bot"},
  {l:"📲 Mobil ilova",v:"mobile_app"},{l:"📞 Offline",v:"offline"},
];

const FOLLOWER_PRESETS = [
  {l:"1K dan kam",v:0},{l:"1K–5K",v:1000},{l:"5K–15K",v:5000},
  {l:"15K–50K",v:15000},{l:"50K–150K",v:50000},
  {l:"150K–500K",v:150000},{l:"500K–1M",v:500000},{l:"1M+",v:1000000},
];

// ============================================================
// API
// ============================================================
const api = {
  headers(initData) {
    return { "Content-Type":"application/json", "X-Init-Data": initData||"" };
  },
  async get(path) {
    const r = await fetch(API_BASE+path);
    if(!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  },
  async post(path, body) {
    const r = await fetch(API_BASE+path, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  },
  async put(path, params={}) {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_BASE}${path}${qs?"?"+qs:""}`,{method:"PUT"});
    if(!r.ok) { const t = await r.text(); throw new Error(t); }
    return r.json();
  },
};

// ============================================================
// HELPERS
// ============================================================
function fmt(n) {
  if(n>=1e6) return (n/1e6).toFixed(1)+"M";
  if(n>=1e3) return (n/1e3).toFixed(0)+"K";
  return n;
}
function fmtPrice(n) {
  if(!n) return "—";
  return new Intl.NumberFormat("uz-UZ").format(n)+" so'm";
}
function timeAgo(ts, t) {
  const d=(Date.now()-new Date(ts).getTime())/1000;
  if(d<60) return t.now;
  if(d<3600) return Math.floor(d/60)+" "+t.min;
  if(d<86400) return Math.floor(d/3600)+" "+t.hour;
  return Math.floor(d/86400)+" "+t.day;
}

// ============================================================
// UI COMPONENTS
// ============================================================
const C = {
  // Colors
  bg: "#0A0F1E",
  card: "#111827",
  border: "#1F2937",
  text: "#F9FAFB",
  sub: "#6B7280",
  blue: "#3B82F6",
  indigo: "#6366F1",
  green: "#10B981",
  red: "#EF4444",
  gold: "#F59E0B",
};

function Btn({children, onClick, v="primary", full=false, disabled=false, sm=false}) {
  const pad = sm ? "6px 14px" : "12px 20px";
  const fs = sm ? 12 : 14;
  const bg = {
    primary:`linear-gradient(135deg,${C.blue},${C.indigo})`,
    success:`linear-gradient(135deg,${C.green},#059669)`,
    danger:`linear-gradient(135deg,${C.red},#DC2626)`,
    ghost:`transparent`,
    gold:`linear-gradient(135deg,${C.gold},#D97706)`,
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:pad, borderRadius:10, border:v==="ghost"?`1.5px solid ${C.border}`:"none",
      background:bg[v], color:v==="ghost"?"#9CA3AF":"#fff",
      fontSize:fs, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
      width:full?"100%":"auto", opacity:disabled?0.5:1, transition:"all 0.15s",
      fontFamily:"inherit",
    }}>{children}</button>
  );
}

function Chip({label, selected, onClick}) {
  return (
    <button onClick={onClick} style={{
      padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:500,
      border:selected?`1.5px solid ${C.blue}`:`1.5px solid ${C.border}`,
      background:selected?C.blue+"33":"#111827",
      color:selected?"#93C5FD":"#9CA3AF",
      cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s",
      fontFamily:"inherit",
    }}>{label}</button>
  );
}

function Card({children, style={}}) {
  return (
    <div style={{background:C.card, borderRadius:14, padding:16,
      border:`1px solid ${C.border}`, marginBottom:12, ...style}}>
      {children}
    </div>
  );
}

function Input({label, value, onChange, placeholder, type="text"}) {
  return (
    <div style={{marginBottom:14}}>
      {label && <label style={{display:"block",fontSize:11,color:C.sub,marginBottom:5,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,
          background:"#0F172A",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );
}

function ScoreRing({score}) {
  const color = score>=80?C.green:score>=60?C.blue:score>=40?C.gold:C.red;
  return (
    <div style={{width:50,height:50,borderRadius:"50%",border:`3px solid ${color}`,
      display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
      flexShrink:0,background:color+"15"}}>
      <span style={{fontSize:14,fontWeight:800,color}}>{score}</span>
      <span style={{fontSize:8,color:C.sub}}>ball</span>
    </div>
  );
}

function Badge({children, color=C.blue}) {
  return (
    <span style={{background:color+"22",color,border:`1px solid ${color}44`,
      borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>
      {children}
    </span>
  );
}

function StarRating({rating=5, size=13}) {
  const r = Math.round(rating);
  return (
    <span style={{color:C.gold,fontSize:size,letterSpacing:1}}>
      {"★".repeat(r)}{"☆".repeat(5-r)}
      <span style={{color:C.sub,fontSize:size-2,marginLeft:4}}>{Number(rating).toFixed(1)}</span>
    </span>
  );
}

function Avatar({role, size=46}) {
  return (
    <div style={{width:size,height:size,borderRadius:size/3,flexShrink:0,
      background:`linear-gradient(135deg,${C.blue},${C.indigo})`,
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45}}>
      {role==="tadbirkor"?"🏢":"📢"}
    </div>
  );
}

function ProgressBar({current, total}) {
  const p = Math.round((current/total)*100);
  return (
    <div>
      <div style={{height:3,background:"#1F2937",borderRadius:2}}>
        <div style={{height:"100%",width:p+"%",
          background:`linear-gradient(90deg,${C.blue},${C.indigo})`,
          borderRadius:2,transition:"width 0.3s"}}/>
      </div>
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

// --- ONBOARDING ---
function OnboardingPage({onFinish, t}) {
  const [step, setStep] = useState(0);
  const steps = [
    {icon:"🌟",title:t.onb1Title,desc:t.onb1Desc},
    {icon:"🎯",title:t.onb2Title,desc:t.onb2Desc},
    {icon:"💬",title:t.onb3Title,desc:t.onb3Desc},
  ];
  const s = steps[step];
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg},#1E1B4B)`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:28,textAlign:"center"}}>
      <div style={{fontSize:72,marginBottom:24}}>{s.icon}</div>
      <h1 style={{color:C.text,fontSize:24,fontWeight:800,margin:"0 0 12px"}}>{s.title}</h1>
      <p style={{color:"#9CA3AF",fontSize:15,lineHeight:1.7,maxWidth:300,margin:"0 0 40px"}}>{s.desc}</p>
      <div style={{display:"flex",gap:8,marginBottom:32}}>
        {steps.map((_,i)=>(
          <div key={i} style={{width:i===step?28:8,height:8,borderRadius:4,
            background:i===step?C.blue:"#1F2937",transition:"all 0.3s"}}/>
        ))}
      </div>
      <Btn full onClick={()=>step<steps.length-1?setStep(step+1):onFinish()}>
        {step<steps.length-1?t.next:t.start}
      </Btn>
    </div>
  );
}

// --- LANG SELECTOR ---
function LangSelector({onSelect}) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:28,textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:20}}>🌐</div>
      <h2 style={{color:C.text,fontSize:22,fontWeight:800,margin:"0 0 8px"}}>Tilni tanlang / Выберите язык</h2>
      <p style={{color:C.sub,fontSize:14,margin:"0 0 32px"}}>You can change this later</p>
      <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:300}}>
        <button onClick={()=>onSelect("uz")} style={{padding:"18px 20px",borderRadius:14,border:`2px solid ${C.border}`,
          background:"#111827",color:C.text,cursor:"pointer",fontSize:17,fontWeight:700,fontFamily:"inherit"}}>
          🇺🇿 O'zbekcha
        </button>
        <button onClick={()=>onSelect("ru")} style={{padding:"18px 20px",borderRadius:14,border:`2px solid ${C.border}`,
          background:"#111827",color:C.text,cursor:"pointer",fontSize:17,fontWeight:700,fontFamily:"inherit"}}>
          🇷🇺 Русский
        </button>
      </div>
    </div>
  );
}

// --- REGISTER ---
function RegisterPage({tgUser, onDone, t}) {
  const [roleStep, setRoleStep] = useState(true);
  const [role, setRole] = useState("");
  const [name, setName] = useState(tgUser?.first_name||"");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if(!name.trim()) return;
    setLoading(true);
    try {
      await api.post("/api/users/register", {
        telegram_id: tgUser?.id||99999,
        username: tgUser?.username||"user",
        full_name: name,
        role, phone: phone||null,
        lang: t === T.ru ? "ru" : "uz",
      });
      onDone(role);
    } catch(e) { alert(t.error+": "+e.message); }
    setLoading(false);
  };

  if(roleStep) return (
    <div style={{padding:"24px 20px",minHeight:"100vh",background:C.bg}}>
      <div style={{textAlign:"center",marginBottom:32,paddingTop:40}}>
        <div style={{fontSize:52,marginBottom:12}}>👤</div>
        <h2 style={{color:C.text,fontSize:22,fontWeight:800,margin:0}}>{t.chooseRole}</h2>
        <p style={{color:C.sub,fontSize:13,margin:"8px 0 0"}}>{t.roleDesc}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {[
          {v:"tadbirkor",icon:"🏢",title:t.tadbirkor,desc:t.tadbirkorDesc},
          {v:"reklamachi",icon:"📢",title:t.reklamachi,desc:t.reklamachiDesc},
        ].map(r=>(
          <button key={r.v} onClick={()=>{setRole(r.v);setRoleStep(false);}} style={{
            background:"#111827",border:`2px solid ${C.border}`,borderRadius:16,
            padding:"20px 18px",textAlign:"left",cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>
            <div style={{fontSize:36,marginBottom:8}}>{r.icon}</div>
            <div style={{color:C.text,fontWeight:700,fontSize:17}}>{r.title}</div>
            <div style={{color:C.sub,fontSize:13,marginTop:4}}>{r.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{padding:"24px 20px",minHeight:"100vh",background:C.bg}}>
      <button onClick={()=>setRoleStep(true)} style={{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:14,marginBottom:24,padding:0,fontFamily:"inherit"}}>{t.back}</button>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:48,marginBottom:12}}>{role==="tadbirkor"?"🏢":"📢"}</div>
        <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:0}}>{t.yourInfo}</h2>
      </div>
      <Input label={t.fullName} value={name} onChange={setName} placeholder="Sardor Aliyev"/>
      <Input label={t.phone} value={phone} onChange={setPhone} placeholder="+998901234567" type="tel"/>
      <Btn full onClick={handleRegister} disabled={loading||!name.trim()}>
        {loading?t.saving:t.register}
      </Btn>
    </div>
  );
}

// --- WIZARD WRAPPER ---
function Wizard({steps, onFinish, t}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const s = steps[step];
  const progress = step+1;

  return (
    <div style={{padding:"0 0 90px",minHeight:"100vh",background:C.bg}}>
      <div style={{padding:"20px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{color:C.sub,fontSize:11}}>{t.step} {step+1} {t.of} {steps.length}</span>
          <span style={{color:C.blue,fontSize:11,fontWeight:600}}>{Math.round((progress/steps.length)*100)}%</span>
        </div>
        <ProgressBar current={progress} total={steps.length}/>
        <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:"16px 0 4px"}}>{s.title}</h2>
        <p style={{color:C.sub,fontSize:13,margin:"0 0 20px"}}>{s.sub}</p>
      </div>
      <div style={{padding:"0 20px"}}>{s.content}</div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"14px 20px",
        background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",gap:10}}>
        {step>0 && <Btn v="ghost" onClick={()=>setStep(step-1)}>{t.back}</Btn>}
        <Btn full={step===0} disabled={s.valid&&!s.valid()||loading}
          v={step===steps.length-1?"success":"primary"}
          onClick={step===steps.length-1 ? async()=>{setLoading(true);await onFinish();setLoading(false);} : ()=>setStep(step+1)}>
          {loading?t.saving:step===steps.length-1?t.save:t.next2}
        </Btn>
      </div>
    </div>
  );
}

// --- BUSINESS TARGET SETUP ---
function BusinessTargetSetup({userId, onDone, t, lang}) {
  const SECTORS = lang==="ru"?SECTORS_RU:SECTORS_UZ;
  const LOCATIONS = lang==="ru"?LOCATIONS_RU:LOCATIONS_UZ;
  const [d, setD] = useState({sector:"",ages:[],target_gender:"all",location:[],interests:[],min_followers:1000,max_budget:0,campaign_goal:""});
  const tog=(k,v)=>setD(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));

  const steps = [
    {
      title:t.sector, sub:t.chooseSector,
      valid:()=>!!d.sector,
      content:(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {SECTORS.map(s=>(
            <button key={s.v} onClick={()=>setD(p=>({...p,sector:s.v}))} style={{
              padding:"10px 8px",borderRadius:10,
              border:`2px solid ${d.sector===s.v?C.blue:C.border}`,
              background:d.sector===s.v?C.blue+"33":"#111827",
              color:d.sector===s.v?"#93C5FD":"#9CA3AF",
              cursor:"pointer",fontSize:12,fontWeight:500,textAlign:"center",fontFamily:"inherit"}}>
              {s.l}
            </button>
          ))}
        </div>
      ),
    },
    {
      title:t.audience, sub:t.audienceSub,
      valid:()=>d.ages.length>0&&d.location.length>0,
      content:(
        <>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.ageGroup}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
            {AGES.map(a=><Chip key={a.v} label={a.l} selected={d.ages.includes(a.v)} onClick={()=>tog("ages",a.v)}/>)}
          </div>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.gender}</div>
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {[{l:t.male,v:"male"},{l:t.female,v:"female"},{l:t.both,v:"all"}].map(g=>(
              <Chip key={g.v} label={g.l} selected={d.target_gender===g.v} onClick={()=>setD(p=>({...p,target_gender:g.v}))}/>
            ))}
          </div>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.region}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {LOCATIONS.map(l=><Chip key={l.v} label={l.l} selected={d.location.includes(l.v)} onClick={()=>tog("location",l.v)}/>)}
          </div>
        </>
      ),
    },
    {
      title:t.interests, sub:t.interestsSub,
      valid:()=>d.interests.length>0,
      content:(
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {INTERESTS.map(i=><Chip key={i} label={i} selected={d.interests.includes(i)} onClick={()=>tog("interests",i)}/>)}
        </div>
      ),
    },
    {
      title:t.requirements, sub:t.requirementsSub,
      valid:()=>true,
      content:(
        <>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.followers}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {FOLLOWER_PRESETS.map(f=>(
              <Chip key={f.v} label={f.l} selected={d.min_followers===f.v} onClick={()=>setD(p=>({...p,min_followers:f.v}))}/>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <Wizard t={t} steps={steps} onFinish={async()=>{
      await api.post(`/api/business-targets/${userId}`, d);
      onDone();
    }}/>
  );
}

// --- REKLAMACHI PROFILE SETUP ---
function ReklamachiProfileSetup({userId, onDone, t, lang}) {
  const LOCATIONS = lang==="ru"?LOCATIONS_RU:LOCATIONS_UZ;
  const [d, setD] = useState({
    platform:"", username:"", profile_link:"",
    followers:0, engagement:0,
    price_post:0, price_story:0, price_video:0,
    audience_ages:[], audience_gender:"all",
    audience_location:"all", interests:[],
  });
  const tog=(k,v)=>setD(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));
  const num=(k,v)=>setD(p=>({...p,[k]:+v}));

  const NInput = ({label, k, placeholder, required=false})=>(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,color:C.sub,marginBottom:5,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{label}</label>
      <input type="number" value={d[k]||""} onChange={e=>num(k,e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,
          background:"#0F172A",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );

  const steps = [
    {
      title:t.platform, sub:t.platformSub,
      valid:()=>!!d.platform,
      content:(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {PLATFORMS.map(p=>(
            <button key={p.v} onClick={()=>setD(pr=>({...pr,platform:p.v}))} style={{
              padding:"12px 8px",borderRadius:10,
              border:`2px solid ${d.platform===p.v?C.blue:C.border}`,
              background:d.platform===p.v?C.blue+"33":"#111827",
              color:d.platform===p.v?"#93C5FD":"#9CA3AF",
              cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
              {p.l}
            </button>
          ))}
        </div>
      ),
    },
    {
      title:t.profileInfo, sub:t.profileInfoSub,
      valid:()=>!!d.username&&d.followers>0,
      content:(
        <>
          <Input label={t.username} value={d.username} onChange={v=>setD(p=>({...p,username:v}))} placeholder="@username"/>
          <Input label={t.profileLink} value={d.profile_link} onChange={v=>setD(p=>({...p,profile_link:v}))} placeholder="https://instagram.com/..."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <NInput label={t.followersCount} k="followers" placeholder="50000"/>
            <NInput label={t.engagement} k="engagement" placeholder="5.2"/>
          </div>
        </>
      ),
    },
    {
      title:t.prices, sub:t.pricesSub,
      valid:()=>d.price_post>0,
      content:(
        <>
          <NInput label={t.postPrice} k="price_post" placeholder="500000"/>
          <NInput label={t.storyPrice} k="price_story" placeholder="300000"/>
          <NInput label={t.videoPrice} k="price_video" placeholder="1000000"/>
        </>
      ),
    },
    {
      title:t.audienceInfo, sub:t.audienceInfoSub,
      valid:()=>d.audience_ages.length>0,
      content:(
        <>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.ageMain}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
            {AGES.map(a=><Chip key={a.v} label={a.l} selected={d.audience_ages.includes(a.v)} onClick={()=>tog("audience_ages",a.v)}/>)}
          </div>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.genderMain}</div>
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {[{l:t.male,v:"male"},{l:t.female,v:"female"},{l:t.mixed,v:"all"}].map(g=>(
              <Chip key={g.v} label={g.l} selected={d.audience_gender===g.v} onClick={()=>setD(p=>({...p,audience_gender:g.v}))}/>
            ))}
          </div>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.locationMain}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {LOCATIONS.map(l=>(
              <Chip key={l.v} label={l.l} selected={d.audience_location===l.v} onClick={()=>setD(p=>({...p,audience_location:l.v}))}/>
            ))}
          </div>
        </>
      ),
    },
    {
      title:t.interestsAud, sub:t.interestsAudSub,
      valid:()=>d.interests.length>0,
      content:(
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {INTERESTS.map(i=><Chip key={i} label={i} selected={d.interests.includes(i)} onClick={()=>tog("interests",i)}/>)}
        </div>
      ),
    },
  ];

  return (
    <Wizard t={t} steps={steps} onFinish={async()=>{
      await api.post(`/api/reklamachi-profiles/${userId}`, d);
      onDone();
    }}/>
  );
}

// --- MATCH CARD ---
function MatchCard({item, role, userId, t}) {
  const [offered, setOffered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exp, setExp] = useState(false);

  const sendOffer = async () => {
    setLoading(true);
    try {
      await api.post("/api/offers", {from_id:userId, to_id:item.user_id||item.uid, message:t.offerMsg});
      setOffered(true);
    } catch(e) {
      if(e.message.includes("Allaqachon")||e.message.includes("уже")) setOffered(true);
      else alert(e.message);
    }
    setLoading(false);
  };

  const pLabel = PLATFORMS.find(p=>p.v===item.platform)?.l || item.platform;
  const SECTORS = SECTORS_UZ;
  const sLabel = SECTORS.find(s=>s.v===item.sector)?.l || item.sector;

  return (
    <Card style={{position:"relative",overflow:"hidden"}}>
      {item.is_premium ? (
        <div style={{position:"absolute",top:0,right:0,
          background:`linear-gradient(135deg,${C.gold},#D97706)`,
          padding:"3px 10px",borderRadius:"0 14px 0 10px",fontSize:10,fontWeight:700,color:"#fff"}}>
          ⭐ PREMIUM
        </div>
      ):null}
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <Avatar role={role==="tadbirkor"?"reklamachi":"tadbirkor"}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.text,fontWeight:700,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>
              {item.full_name}
            </span>
            <ScoreRing score={item.match_score}/>
          </div>
          <div style={{marginTop:4,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            {role==="tadbirkor"?(
              <><Badge color={C.blue}>{pLabel}</Badge><Badge color="#8B5CF6">{fmt(item.followers)} {t.obs}</Badge></>
            ):(
              <Badge color={C.green}>{sLabel}</Badge>
            )}
            <StarRating rating={item.rating||5}/>
          </div>
        </div>
      </div>

      {role==="tadbirkor" && (
        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {[{l:"Post",v:item.price_post},{l:"Story",v:item.price_story},{l:"Video",v:item.price_video}].map(p=>(
            <div key={p.l} style={{textAlign:"center",background:"#0F172A",borderRadius:8,padding:"8px 4px"}}>
              <div style={{color:C.sub,fontSize:10}}>{p.l}</div>
              <div style={{color:C.text,fontSize:11,fontWeight:600,marginTop:2}}>{fmtPrice(p.v)}</div>
            </div>
          ))}
        </div>
      )}

      {exp && (
        <div style={{marginTop:10,padding:"10px 12px",background:"#0F172A",borderRadius:8}}>
          {item.engagement>0&&<div style={{color:C.sub,fontSize:12,marginBottom:4}}>ER: <span style={{color:C.green,fontWeight:600}}>{item.engagement}%</span></div>}
          {item.campaign_goal&&<div style={{color:C.sub,fontSize:12}}>Maqsad: <span style={{color:C.text}}>{item.campaign_goal}</span></div>}
          {item.profile_link&&<div style={{color:C.sub,fontSize:12,marginTop:4}}>Link: <a href={item.profile_link} style={{color:C.blue}} target="_blank" rel="noreferrer">{item.profile_link}</a></div>}
        </div>
      )}

      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn sm v="ghost" onClick={()=>setExp(!exp)}>{exp?t.less:t.detail}</Btn>
        <Btn sm v={offered?"ghost":"primary"} disabled={offered||loading} onClick={sendOffer}>
          {loading?"⏳":offered?t.sent:t.sendOffer}
        </Btn>
      </div>
    </Card>
  );
}

// --- MATCH PAGE ---
function MatchPage({userId, role, t}) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(()=>{
    api.get(`/api/match/${userId}`).then(setMatches).catch(console.error).finally(()=>setLoading(false));
  },[userId]);

  const filtered = filter==="top"?matches.filter(m=>m.match_score>=70)
    :filter==="premium"?matches.filter(m=>m.is_premium):matches;

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{marginBottom:18}}>
        <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:0}}>
          {role==="tadbirkor"?"🎯 Reklamachilar":"🏢 Tadbirkorlar"}
        </h2>
        <p style={{color:C.sub,fontSize:12,margin:"4px 0 0"}}>{t.aiMatch} — {matches.length} {t.found}</p>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {[{v:"all",l:t.all},{v:"top",l:t.top},{v:"premium",l:t.premium}].map(f=>(
          <Chip key={f.v} label={f.l} selected={filter===f.v} onClick={()=>setFilter(f.v)}/>
        ))}
      </div>
      {loading?(
        <div style={{textAlign:"center",padding:60,color:C.sub}}>
          <div style={{fontSize:36,marginBottom:12}}>⏳</div><p>{t.searching}</p>
        </div>
      ):filtered.length===0?(
        <div style={{textAlign:"center",padding:60}}>
          <div style={{fontSize:48,marginBottom:12}}>🔍</div>
          <p style={{color:C.sub}}>{t.noMatch}</p>
          <p style={{color:"#4B5563",fontSize:12}}>{t.noMatchSub}</p>
        </div>
      ):filtered.map((item,i)=>(
        <MatchCard key={i} item={item} role={role} userId={userId} t={t}/>
      ))}
    </div>
  );
}

// --- OFFERS PAGE ---
function OffersPage({userId, t}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("incoming");

  const load = useCallback(()=>{
    setLoading(true);
    api.get(`/api/offers/${userId}`).then(setOffers).catch(console.error).finally(()=>setLoading(false));
  },[userId]);

  useEffect(()=>{load();},[load]);

  const updateStatus = async(offerId,status)=>{
    try { await api.put(`/api/offers/${offerId}/status`,{status}); load(); }
    catch(e){alert(e.message);}
  };

  const incoming = offers.filter(o=>o.to_id===userId&&o.status==="pending");
  const outgoing = offers.filter(o=>o.from_id===userId);
  const accepted = offers.filter(o=>(o.from_id===userId||o.to_id===userId)&&o.status==="accepted");
  const tabs=[{v:"incoming",l:`${t.incoming} (${incoming.length})`},{v:"outgoing",l:`${t.outgoing} (${outgoing.length})`},{v:"accepted",l:`${t.accepted} (${accepted.length})`}];
  const current = tab==="incoming"?incoming:tab==="outgoing"?outgoing:accepted;
  const SC={pending:C.gold,accepted:C.green,rejected:C.red};
  const SL={pending:t.pending,accepted:t.acceptedStatus,rejected:t.rejected};

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:"0 0 14px"}}>📨 {t.offers}</h2>
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {tabs.map(tb=>(
          <button key={tb.v} onClick={()=>setTab(tb.v)} style={{
            padding:"7px 14px",borderRadius:20,border:"none",whiteSpace:"nowrap",
            background:tab===tb.v?C.blue:"#111827",color:tab===tb.v?"#fff":"#9CA3AF",
            cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
            {tb.l}
          </button>
        ))}
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.sub}}>{t.searching}</div>
        :current.length===0?(
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <p style={{color:C.sub}}>{t.noOffers}</p>
          </div>
        ):current.map(o=>(
          <Card key={o.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{color:C.text,fontWeight:700,fontSize:15}}>
                  {tab==="incoming"?o.from_name:o.to_name}
                </div>
                <div style={{color:C.sub,fontSize:11,marginTop:2}}>{timeAgo(o.created_at,t)} {t.ago}</div>
              </div>
              <Badge color={SC[o.status]}>{SL[o.status]}</Badge>
            </div>
            {o.message&&(
              <p style={{color:"#9CA3AF",fontSize:13,margin:"0 0 12px",lineHeight:1.5,
                background:"#0F172A",padding:"10px 12px",borderRadius:8}}>
                {o.message}
              </p>
            )}
            {tab==="incoming"&&o.status==="pending"&&(
              <div style={{display:"flex",gap:8}}>
                <Btn sm v="success" onClick={()=>updateStatus(o.id,"accepted")}>{t.accept}</Btn>
                <Btn sm v="danger" onClick={()=>updateStatus(o.id,"rejected")}>{t.reject}</Btn>
              </div>
            )}
            {o.status==="accepted"&&!o.rated&&(
              <div>
                <p style={{color:C.sub,fontSize:12,margin:"0 0 6px"}}>{t.rate}</p>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5].map(r=>(
                    <button key={r} onClick={async()=>{
                      try{await api.post(`/api/offers/${o.id}/rate`,{offer_id:o.id,rating:r});load();}
                      catch(e){alert(e.message);}
                    }} style={{width:34,height:34,borderRadius:8,border:`1.5px solid ${C.border}`,
                      background:"#111827",color:C.gold,cursor:"pointer",fontSize:16,fontFamily:"inherit"}}>⭐</button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
    </div>
  );
}

// --- CHAT PAGE ---
function ChatPage({userId, t}) {
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const msgEnd = useRef(null);
  const pollRef = useRef(null);

  const loadChats = useCallback(()=>{
    api.get(`/api/chats/${userId}`).then(setChats).catch(console.error).finally(()=>setLoading(false));
  },[userId]);

  useEffect(()=>{loadChats();},[loadChats]);

  const openChat = async(chat)=>{
    setActive(chat);
    const msgs = await api.get(`/api/chats/${chat.id}/messages`);
    setMessages(msgs);
    await api.put(`/api/chats/${chat.id}/read`,{tg_id:userId});
    setTimeout(()=>msgEnd.current?.scrollIntoView({behavior:"smooth"}),100);
    // Polling
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async()=>{
      const m = await api.get(`/api/chats/${chat.id}/messages`);
      setMessages(m);
    }, 3000);
  };

  useEffect(()=>()=>clearInterval(pollRef.current),[]);

  const sendMsg = async()=>{
    if(!text.trim()||!active) return;
    const txt=text; setText("");
    try {
      await api.post("/api/messages",{chat_id:active.id,sender_id:userId,receiver_id:active.partner_id,message_text:txt});
      const msgs = await api.get(`/api/chats/${active.id}/messages`);
      setMessages(msgs);
      setTimeout(()=>msgEnd.current?.scrollIntoView({behavior:"smooth"}),50);
    } catch(e){alert(e.message);}
  };

  if(active) return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg}}>
      <div style={{padding:"12px 16px",background:"#111827",borderBottom:`1px solid ${C.border}`,
        display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setActive(null);clearInterval(pollRef.current);loadChats();}}
          style={{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:22,padding:0}}>←</button>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.blue},${C.indigo})`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💬</div>
        <div>
          <div style={{color:C.text,fontWeight:700,fontSize:15}}>{active.partner_name}</div>
          <div style={{color:C.sub,fontSize:11}}>{t.online}</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:8}}>
        {messages.length===0&&(
          <div style={{textAlign:"center",color:C.sub,fontSize:13,marginTop:40}}>
            <div style={{fontSize:36,marginBottom:8}}>💬</div>{t.typeMessage}
          </div>
        )}
        {messages.map(m=>{
          const mine=m.sender_id===userId;
          return (
            <div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"75%",padding:"10px 14px",
                borderRadius:mine?"14px 14px 4px 14px":"14px 14px 14px 4px",
                background:mine?`linear-gradient(135deg,${C.blue},${C.indigo})`:"#111827",
                color:C.text,fontSize:14,lineHeight:1.5}}>
                {m.message_text}
                <div style={{fontSize:10,color:mine?"#BFDBFE":C.sub,marginTop:4,textAlign:"right"}}>
                  {timeAgo(m.created_at,t)} {t.ago}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={msgEnd}/>
      </div>
      <div style={{padding:"12px 16px",background:"#111827",borderTop:`1px solid ${C.border}`,
        display:"flex",gap:10,alignItems:"center"}}>
        <input value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&sendMsg()}
          placeholder={t.typeMessage}
          style={{flex:1,padding:"10px 14px",borderRadius:20,border:`1.5px solid ${C.border}`,
            background:"#0F172A",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={sendMsg} style={{width:40,height:40,borderRadius:12,
          background:`linear-gradient(135deg,${C.blue},${C.indigo})`,
          border:"none",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>
          ➤
        </button>
      </div>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:"0 0 14px"}}>💬 {t.chats}</h2>
      {loading?<div style={{textAlign:"center",padding:40,color:C.sub}}>{t.searching}</div>
        :chats.length===0?(
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:48,marginBottom:12}}>💬</div>
            <p style={{color:C.sub}}>{t.noChats}</p>
            <p style={{color:"#4B5563",fontSize:12}}>{t.noChatsSub}</p>
          </div>
        ):chats.map(chat=>(
          <Card key={chat.id} style={{cursor:"pointer"}} >
            <div onClick={()=>openChat(chat)} style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:46,height:46,borderRadius:12,
                background:`linear-gradient(135deg,${C.blue},${C.indigo})`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>💬</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:C.text,fontWeight:700,fontSize:15}}>{chat.partner_name}</span>
                  {chat.unread>0&&(
                    <span style={{background:C.blue,color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700}}>{chat.unread}</span>
                  )}
                </div>
                <div style={{color:C.sub,fontSize:12,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {chat.last_message||"..."}
                </div>
              </div>
              {chat.last_message_time&&(
                <span style={{color:"#4B5563",fontSize:11,flexShrink:0}}>{timeAgo(chat.last_message_time,t)}</span>
              )}
            </div>
          </Card>
        ))}
    </div>
  );
}

// --- NOTIFICATIONS PAGE ---
function NotificationsPage({userId, t}) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get(`/api/notifications/${userId}`).then(setNotifs).catch(console.error).finally(()=>setLoading(false));
  },[userId]);

  const markAll = async()=>{
    await api.put(`/api/notifications/${userId}/read`);
    setNotifs(n=>n.map(x=>({...x,is_read:1})));
  };

  const typeIcon={offer:"📩",message:"💬",info:"ℹ️"};

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:0}}>🔔 {t.notifications}</h2>
        <button onClick={markAll} style={{background:"none",border:"none",color:C.blue,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{t.markRead}</button>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.sub}}>{t.searching}</div>
        :notifs.length===0?(
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:48,marginBottom:12}}>🔔</div>
            <p style={{color:C.sub}}>{t.noNotif}</p>
          </div>
        ):notifs.map(n=>(
          <Card key={n.id} style={{opacity:n.is_read?0.6:1,borderLeft:n.is_read?"none":`3px solid ${C.blue}`}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{fontSize:22}}>{typeIcon[n.type]||"🔔"}</div>
              <div style={{flex:1}}>
                <div style={{color:C.text,fontWeight:600,fontSize:14}}>{n.title}</div>
                <div style={{color:"#9CA3AF",fontSize:12,marginTop:3}}>{n.body}</div>
                <div style={{color:C.sub,fontSize:11,marginTop:4}}>{timeAgo(n.created_at,t)} {t.ago}</div>
              </div>
            </div>
          </Card>
        ))}
    </div>
  );
}

// --- PROFILE PAGE ---
function ProfilePage({userId, user, role, onEdit, t, lang, onLangChange}) {
  const [stats, setStats] = useState(null);

  useEffect(()=>{
    api.get(`/api/users/${userId}/stats`).then(setStats).catch(console.error);
  },[userId]);

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:80,height:80,borderRadius:24,
          background:`linear-gradient(135deg,${C.blue},${C.indigo})`,
          margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>
          {role==="tadbirkor"?"🏢":"📢"}
        </div>
        <h2 style={{color:C.text,fontSize:22,fontWeight:800,margin:0}}>{user?.full_name}</h2>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
          <Badge color={role==="tadbirkor"?C.green:"#8B5CF6"}>
            {role==="tadbirkor"?t.tadbirkor:t.reklamachi}
          </Badge>
          {user?.is_premium?<Badge color={C.gold}>⭐ Premium</Badge>:null}
        </div>
        {user?.rating&&<div style={{marginTop:8}}><StarRating rating={user.rating}/></div>}
      </div>

      {stats&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[{l:t.deals,v:stats.deals,icon:"🤝"},{l:t.totalOffers,v:stats.total_offers,icon:"📨"},{l:t.totalChats,v:stats.chats,icon:"💬"}].map(s=>(
            <Card key={s.l} style={{textAlign:"center",padding:"12px 8px"}}>
              <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
              <div style={{color:C.text,fontSize:22,fontWeight:800}}>{s.v}</div>
              <div style={{color:C.sub,fontSize:11}}>{s.l}</div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        {[{l:"📱 "+t.phone,v:user?.phone||t.notEntered},{l:"🆔 Telegram ID",v:userId},{l:"📅 "+t.regDate,v:user?.created_at?new Date(user.created_at).toLocaleDateString("uz-UZ"):"—"}].map(r=>(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
            <span style={{color:C.sub,fontSize:13}}>{r.l}</span>
            <span style={{color:C.text,fontSize:13,fontWeight:500}}>{r.v}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{color:C.sub,fontSize:13}}>🌐 Til</span>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>onLangChange("uz")} style={{padding:"3px 10px",borderRadius:10,border:`1px solid ${lang==="uz"?C.blue:C.border}`,background:lang==="uz"?C.blue+"33":"transparent",color:lang==="uz"?C.blue:"#9CA3AF",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🇺🇿 UZ</button>
            <button onClick={()=>onLangChange("ru")} style={{padding:"3px 10px",borderRadius:10,border:`1px solid ${lang==="ru"?C.blue:C.border}`,background:lang==="ru"?C.blue+"33":"transparent",color:lang==="ru"?C.blue:"#9CA3AF",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🇷🇺 RU</button>
          </div>
        </div>
      </Card>

      <Btn full v="primary" onClick={onEdit}>{t.editProfile}</Btn>
    </div>
  );
}

// --- ADMIN PAGE ---
function AdminPage({userId, t}) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const load = async()=>{
      try {
        const [s,u,q] = await Promise.all([
          api.get(`/api/admin/stats?admin_id=${userId}`),
          api.get(`/api/admin/users?admin_id=${userId}`),
          api.get(`/api/admin/verify-queue?admin_id=${userId}`),
        ]);
        setStats(s); setUsers(u); setQueue(q);
      } catch(e){console.error(e);}
      setLoading(false);
    };
    load();
  },[userId]);

  const refresh = async()=>{
    const [u,q] = await Promise.all([
      api.get(`/api/admin/users?admin_id=${userId}`),
      api.get(`/api/admin/verify-queue?admin_id=${userId}`),
    ]);
    setUsers(u); setQueue(q);
  };

  if(loading) return <div style={{textAlign:"center",padding:60,color:C.sub}}>{t.searching}</div>;

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{color:C.text,fontSize:20,fontWeight:800,margin:"0 0 14px"}}>🛡 {t.adminPanel}</h2>

      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {[{v:"stats",l:"📊 Statistika"},{v:"users",l:`👥 ${t.users}`},{v:"verify",l:`✅ ${t.verifyQueue} (${queue.length})`}].map(tb=>(
          <button key={tb.v} onClick={()=>setTab(tb.v)} style={{
            padding:"7px 14px",borderRadius:20,border:"none",whiteSpace:"nowrap",
            background:tab===tb.v?C.blue:"#111827",color:tab===tb.v?"#fff":"#9CA3AF",
            cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
            {tb.l}
          </button>
        ))}
      </div>

      {tab==="stats"&&stats&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {l:t.totalUsers,v:stats.total_users,icon:"👥"},
            {l:t.tadbirkor,v:stats.tadbirkorlar,icon:"🏢"},
            {l:t.reklamachi,v:stats.reklamachilar,icon:"📢"},
            {l:"⭐ Premium",v:stats.premium,icon:"⭐"},
            {l:t.totalOffers,v:stats.total_offers,icon:"📨"},
            {l:t.acceptedOffers,v:stats.accepted_offers,icon:"✅"},
            {l:t.activeChats,v:stats.active_chats,icon:"💬"},
            {l:"Xabarlar",v:stats.total_messages,icon:"📝"},
          ].map(s=>(
            <Card key={s.l} style={{textAlign:"center",padding:"14px 8px"}}>
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{color:C.text,fontSize:24,fontWeight:800}}>{s.v}</div>
              <div style={{color:C.sub,fontSize:11}}>{s.l}</div>
            </Card>
          ))}
        </div>
      )}

      {tab==="users"&&(
        <div>
          {users.map(u=>(
            <Card key={u.telegram_id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{color:C.text,fontWeight:700,fontSize:14}}>{u.full_name}</div>
                  <div style={{color:C.sub,fontSize:11}}>ID: {u.telegram_id} | {u.role}</div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  {u.is_premium?<Badge color={C.gold}>⭐</Badge>:null}
                  {u.is_blocked?<Badge color={C.red}>🚫</Badge>:null}
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Btn sm v={u.is_premium?"ghost":"gold"}
                  onClick={async()=>{
                    await api.put(`/api/admin/users/${u.telegram_id}/premium`,{admin_id:userId,value:u.is_premium?0:1});
                    refresh();
                  }}>
                  {u.is_premium?t.removePremium:t.givePremium}
                </Btn>
                {!u.is_blocked?(
                  <Btn sm v="danger" onClick={async()=>{
                    const reason=prompt("Bloklash sababi:");
                    if(reason!==null){await api.put(`/api/admin/users/${u.telegram_id}/block`,{admin_id:userId,reason});refresh();}
                  }}>{t.blockUser}</Btn>
                ):(
                  <Btn sm v="success" onClick={async()=>{
                    await api.put(`/api/admin/users/${u.telegram_id}/unblock`,{admin_id:userId});refresh();
                  }}>{t.unblockUser}</Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab==="verify"&&(
        <div>
          {queue.length===0?(
            <div style={{textAlign:"center",padding:40,color:C.sub}}>{t.noQueue}</div>
          ):queue.map(p=>(
            <Card key={p.user_id}>
              <div style={{marginBottom:8}}>
                <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.full_name}</div>
                <div style={{color:C.sub,fontSize:12}}>{p.platform} | {fmt(p.followers)} obs | ER: {p.engagement}%</div>
                {p.profile_link&&<a href={p.profile_link} style={{color:C.blue,fontSize:12}} target="_blank" rel="noreferrer">{p.profile_link}</a>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn sm v="success" onClick={async()=>{
                  await api.put(`/api/admin/verify/${p.user_id}`,{admin_id:userId,value:1});refresh();
                }}>{t.verify}</Btn>
                <Btn sm v="danger" onClick={async()=>{
                  await api.put(`/api/admin/verify/${p.user_id}`,{admin_id:userId,value:0});refresh();
                }}>{t.verifyReject}</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- BOTTOM NAV ---
function BottomNav({tab, onChange, unread=0, notifCount=0, isAdmin=false}) {
  const items = [
    {v:"match",icon:"🎯",label:"Match"},
    {v:"offers",icon:"📨",label:"Offers",badge:0},
    {v:"chats",icon:"💬",label:"Chats",badge:unread},
    {v:"notif",icon:"🔔",label:"Notif",badge:notifCount},
    {v:"profile",icon:"👤",label:"Profil"},
  ];
  if(isAdmin) items.push({v:"admin",icon:"🛡",label:"Admin"});

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,
      background:"#111827",borderTop:`1px solid ${C.border}`,
      display:"flex",height:62,zIndex:100}}>
      {items.map(item=>(
        <button key={item.v} onClick={()=>onChange(item.v)} style={{
          flex:1,background:"none",border:"none",cursor:"pointer",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          gap:2,position:"relative"}}>
          <span style={{fontSize:20}}>{item.icon}</span>
          <span style={{fontSize:9,fontWeight:600,color:tab===item.v?C.blue:C.sub}}>{item.label}</span>
          {item.badge>0&&(
            <span style={{position:"absolute",top:4,right:"calc(50% - 18px)",
              background:C.red,color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700}}>
              {item.badge}
            </span>
          )}
          {tab===item.v&&(
            <div style={{position:"absolute",bottom:0,width:28,height:3,
              background:C.blue,borderRadius:"3px 3px 0 0"}}/>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [appState, setAppState] = useState("loading");
  const [user, setUser] = useState(null);
  const [tgUser, setTgUser] = useState(null);
  const [role, setRole] = useState("");
  const [tab, setTab] = useState("match");
  const [lang, setLang] = useState("uz");
  const [notifCount, setNotifCount] = useState(0);
  const t = T[lang] || T.uz;

  const userId = tgUser?.id || 99999;
  const ADMIN_LIST = (process.env.REACT_APP_ADMIN_IDS||"").split(",").map(x=>+x).filter(Boolean);
  const isAdmin = ADMIN_LIST.includes(userId);

  useEffect(()=>{
    if(tg){tg.ready();tg.expand();tg.setHeaderColor("#0A0F1E");tg.setBackgroundColor("#0A0F1E");}
    const tgU = tg?.initDataUnsafe?.user || {id:99999,first_name:"Demo",username:"demo"};
    setTgUser(tgU);

    const seenLang = localStorage.getItem("midas_lang");
    if(!seenLang){setAppState("langSelect");return;}
    setLang(seenLang);

    const seenOnb = localStorage.getItem("midas_onb");
    if(!seenOnb){setAppState("onboarding");return;}

    api.get(`/api/users/${tgU.id}`)
      .then(u=>{
        setUser(u); setRole(u.role);
        setLang(u.lang||seenLang||"uz");
        setAppState("main");
      })
      .catch(()=>setAppState("register"));
  },[]);

  useEffect(()=>{
    if(appState!=="main") return;
    const poll=setInterval(async()=>{
      try{const r=await api.get(`/api/notifications/${userId}/count`);setNotifCount(r.count);}catch{}
    },10000);
    api.get(`/api/notifications/${userId}/count`).then(r=>setNotifCount(r.count)).catch(()=>{});
    return()=>clearInterval(poll);
  },[appState,userId]);

  const handleLangChange = async(l)=>{
    setLang(l);
    localStorage.setItem("midas_lang",l);
    try{await api.put(`/api/users/${userId}/lang`,{lang:l});}catch{}
  };

  if(appState==="loading") return (
    <div style={{height:"100vh",background:C.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>⚡</div>
      <h2 style={{color:C.text,fontSize:26,fontWeight:800,margin:0}}>MIDAS</h2>
      <p style={{color:C.sub,fontSize:14,marginTop:8}}>{t.loading}</p>
    </div>
  );

  if(appState==="langSelect") return (
    <LangSelector onSelect={l=>{
      setLang(l);localStorage.setItem("midas_lang",l);
      setAppState("onboarding");
    }}/>
  );

  if(appState==="onboarding") return (
    <OnboardingPage t={t} onFinish={()=>{localStorage.setItem("midas_onb","1");setAppState("register");}}/>
  );

  if(appState==="register") return (
    <RegisterPage tgUser={tgUser} t={t} onDone={r=>{setRole(r);setAppState("setup");}}/>
  );

  if(appState==="setup") return role==="tadbirkor"
    ? <BusinessTargetSetup userId={userId} t={t} lang={lang} onDone={()=>{
        api.get(`/api/users/${userId}`).then(u=>{setUser(u);setAppState("main");});
      }}/>
    : <ReklamachiProfileSetup userId={userId} t={t} lang={lang} onDone={()=>{
        api.get(`/api/users/${userId}`).then(u=>{setUser(u);setAppState("main");});
      }}/>;

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{margin:0;overflow-x:hidden;}
        input,button{font-family:inherit;}
        ::-webkit-scrollbar{width:0;height:0;}
      `}</style>

      {tab==="match"&&<MatchPage userId={userId} role={role} t={t}/>}
      {tab==="offers"&&<OffersPage userId={userId} t={t}/>}
      {tab==="chats"&&<ChatPage userId={userId} t={t}/>}
      {tab==="notif"&&<NotificationsPage userId={userId} t={t}/>}
      {tab==="profile"&&(
        <ProfilePage userId={userId} user={user} role={role} t={t} lang={lang}
          onLangChange={handleLangChange}
          onEdit={()=>setAppState("setup")}/>
      )}
      {tab==="admin"&&isAdmin&&<AdminPage userId={userId} t={t}/>}

      <BottomNav tab={tab} onChange={setTab} notifCount={notifCount} isAdmin={isAdmin}/>
    </div>
  );
}
