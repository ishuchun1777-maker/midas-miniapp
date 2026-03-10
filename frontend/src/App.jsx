import { useState, useEffect, useRef, useCallback } from "react";
import {
  SECTORS, PLATFORMS_ONLINE, PLATFORMS_OFFLINE, PLATFORMS_ALL,
  MATCH_PLATFORMS, AGE_OPTIONS, LOCATIONS, SECTOR_INTERESTS, PHONE_REGEX
} from "./constants";

const API = process.env.REACT_APP_API_URL || "https://midas-backend.onrender.com";
const ADMIN_IDS = (process.env.REACT_APP_ADMIN_IDS || "").split(",").map(Number).filter(Boolean);
const tg = window.Telegram?.WebApp;

// ==================== i18n ====================
const T = {
  uz: {
    welcome:"MIDAS ga xush kelibsiz!",
    chooseRole:"Rolingizni tanlang",
    tadbirkor:"🏢 Tadbirkor",
    reklamachi:"📢 Reklamachi",
    register:"Ro'yxatdan o'tish",
    fullName:"To'liq ismingiz",
    phone:"Telefon raqam (+998XXXXXXXXX)",
    phoneInvalid:"Noto'g'ri raqam. Format: +998012345678",
    sector:"Soha tanlang",
    subSector:"Pastki soha",
    platforms:"Reklama platformalari",
    ages:"Maqsadli yosh guruhi",
    gender:"Jins",
    genderAll:"Barcha",
    genderM:"Erkaklar",
    genderF:"Ayollar",
    location:"Hudud",
    interests:"Qiziqishlar (max 3)",
    maxInterests:"Maksimum 3 ta tanlang",
    budget:"Maksimal byudjet (so'm)",
    minFollowers:"Minimal obunachi soni",
    goal:"Kampaniya maqsadi",
    platform:"Platforma",
    profileLink:"Profil havolasi",
    followers:"Obunachi soni",
    engagement:"Aktivlik (%)",
    pricePost:"Post narxi (so'm)",
    priceStory:"Story narxi (so'm)",
    priceVideo:"Video narxi (so'm)",
    priceDesc:"Narx tavsifi (ixtiyoriy)",
    address:"Aniq manzil",
    coordinates:"Koordinata (ixtiyoriy)",
    audienceGender:"Auditoriya jinsi",
    audienceLocation:"Auditoriya hududi",
    audienceAges:"Auditoriya yoshi",
    next:"Davom etish",
    back:"Orqaga",
    save:"Saqlash",
    cancel:"Bekor qilish",
    edit:"Tahrirlash",
    match:"Match",
    chats:"Chatlar",
    profile:"Profil",
    notifs:"Bildirishnomalar",
    admin:"Admin",
    sendOffer:"Taklif yuborish",
    freeOffer:"Tekin taklif (1 marta)",
    offerMsg:"Taklif xabari",
    accept:"Qabul qilish",
    reject:"Rad etish",
    rate:"Baholash",
    matchScore:"mos",
    details:"Batafsil",
    verified:"✅ Tasdiqlangan",
    notVerified:"⏳ Tasdiqlanmoqda",
    premium:"⭐ Premium",
    noMatches:"Hozircha mos hamkorlar topilmadi",
    loading:"Yuklanmoqda...",
    send:"Yuborish",
    midasChat:"📢 MIDAS xabarlari",
    noChats:"Hali chatlar yo'q",
    noNotifs:"Hali bildirishnomalar yo'q",
    offerAccepted:"Taklif qabul qilindi ✅",
    offerRejected:"Taklif rad etildi ❌",
    ratePartner:"Hamkorni baholang",
    whereAdvert:"Qayerda reklama qilmoqchisiz?",
    allPartners:"Barcha tadbirkorlar",
    bestMatch:"Sizga mos hamkorlar",
    freeOfferBtn:"Sinov uchun tekin taklif",
    verifyNote:"Kiritgan ma'lumotlaringiz tekshiriladi va tasdiqlangach sizga xabar beramiz. Iltimos aniq va to'g'ri ma'lumotlar kiriting.",
    saving:"Saqlanmoqda...",
    saved:"Saqlandi ✅",
    lang:"Til",
  },
  ru: {
    welcome:"Добро пожаловать в MIDAS!",
    chooseRole:"Выберите роль",
    tadbirkor:"🏢 Предприниматель",
    reklamachi:"📢 Рекламодатель",
    register:"Регистрация",
    fullName:"Ваше полное имя",
    phone:"Номер телефона (+998XXXXXXXXX)",
    phoneInvalid:"Неверный формат. Пример: +998012345678",
    sector:"Выберите сферу",
    subSector:"Подраздел",
    platforms:"Платформы рекламы",
    ages:"Целевая возрастная группа",
    gender:"Пол",
    genderAll:"Все",
    genderM:"Мужчины",
    genderF:"Женщины",
    location:"Регион",
    interests:"Интересы (макс 3)",
    maxInterests:"Максимум 3 выбора",
    budget:"Максимальный бюджет (сум)",
    minFollowers:"Мин. кол-во подписчиков",
    goal:"Цель кампании",
    platform:"Платформа",
    profileLink:"Ссылка на профиль",
    followers:"Подписчиков",
    engagement:"Активность (%)",
    pricePost:"Цена поста (сум)",
    priceStory:"Цена stories (сум)",
    priceVideo:"Цена видео (сум)",
    priceDesc:"Описание цены (необязательно)",
    address:"Точный адрес",
    coordinates:"Координаты (необязательно)",
    audienceGender:"Пол аудитории",
    audienceLocation:"Регион аудитории",
    audienceAges:"Возраст аудитории",
    next:"Продолжить",
    back:"Назад",
    save:"Сохранить",
    cancel:"Отмена",
    edit:"Редактировать",
    match:"Подбор",
    chats:"Чаты",
    profile:"Профиль",
    notifs:"Уведомления",
    admin:"Админ",
    sendOffer:"Отправить предложение",
    freeOffer:"Бесплатное предложение (1 раз)",
    offerMsg:"Сообщение",
    accept:"Принять",
    reject:"Отклонить",
    rate:"Оценить",
    matchScore:"совп.",
    details:"Подробнее",
    verified:"✅ Подтверждён",
    notVerified:"⏳ На проверке",
    premium:"⭐ Premium",
    noMatches:"Подходящих партнёров пока нет",
    loading:"Загрузка...",
    send:"Отправить",
    midasChat:"📢 Сообщения MIDAS",
    noChats:"Чатов пока нет",
    noNotifs:"Уведомлений пока нет",
    offerAccepted:"Предложение принято ✅",
    offerRejected:"Предложение отклонено ❌",
    ratePartner:"Оцените партнёра",
    whereAdvert:"Где хотите рекламироваться?",
    allPartners:"Все предприниматели",
    bestMatch:"Подходящие партнёры",
    freeOfferBtn:"Бесплатное тестовое предложение",
    verifyNote:"Ваши данные будут проверены и вы получите уведомление после подтверждения. Пожалуйста, указывайте точные данные.",
    saving:"Сохранение...",
    saved:"Сохранено ✅",
    lang:"Язык",
  }
};

const api = async (path, method="GET", body=null) => {
  const opts = { method, headers: {"Content-Type":"application/json"} };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(API+path, opts);
  if (!r.ok) { const e = await r.json().catch(()=>{}); throw new Error(e?.error||r.status); }
  return r.json();
};

// ==================== COMPONENTS ====================

function Btn({children, onClick, color="blue", full=false, small=false, disabled=false}) {
  const colors = {
    blue:"bg-blue-500 hover:bg-blue-600 text-white",
    green:"bg-green-500 hover:bg-green-600 text-white",
    red:"bg-red-500 hover:bg-red-600 text-white",
    gray:"bg-gray-200 hover:bg-gray-300 text-gray-700",
    yellow:"bg-yellow-400 hover:bg-yellow-500 text-white",
    purple:"bg-purple-500 hover:bg-purple-600 text-white",
    ghost:"bg-transparent border border-blue-400 text-blue-500 hover:bg-blue-50",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${colors[color]} ${full?"w-full":""}  ${small?"px-3 py-1.5 text-sm":"px-4 py-2.5"} rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}

function Input({label, value, onChange, placeholder, type="text", error}) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border ${error?"border-red-400":"border-gray-200"} bg-white focus:outline-none focus:border-blue-400 text-sm`}/>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Modal({title, children, onClose}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TagSelect({options, selected, onChange, max=null, label}) {
  const toggle = (v) => {
    if (selected.includes(v)) onChange(selected.filter(x=>x!==v));
    else if (!max || selected.length < max) onChange([...selected, v]);
  };
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(o=>(
          <button key={o.v} onClick={()=>toggle(o.v)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selected.includes(o.v)?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-600 border-gray-200"}`}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== REGISTRATION ====================

function Registration({user, tgUser, onDone}) {
  const [step, setStep] = useState(0); // 0=lang, 1=role, 2=info, 3=tadbirkor, 4=reklamachi
  const [lang, setLang] = useState("uz");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState(tgUser?.first_name||"");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [sector, setSector] = useState("");
  const [subSector, setSubSector] = useState("");
  const [expandedSector, setExpandedSector] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [ages, setAges] = useState([]);
  const [gender, setGender] = useState("all");
  const [locs, setLocs] = useState([]);
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  // reklamachi
  const [platform, setPlatform] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [pricePost, setPricePost] = useState("");
  const [priceStory, setPriceStory] = useState("");
  const [priceVideo, setPriceVideo] = useState("");
  const [priceDesc, setPriceDesc] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [audAges, setAudAges] = useState([]);
  const [audGender, setAudGender] = useState("all");
  const [audLoc, setAudLoc] = useState("all");
  const [rekInterests, setRekInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  const t = T[lang];
  const isOffline = PLATFORMS_OFFLINE.map(p=>p.v).includes(platform);
  const isOnline = PLATFORMS_ONLINE.map(p=>p.v).includes(platform);
  const sectorInterests = SECTOR_INTERESTS[sector] || SECTOR_INTERESTS.default;

  const validatePhone = (p) => {
    if (!p) { setPhoneErr(t.phone); return false; }
    if (!PHONE_REGEX.test(p.replace(/[\s-]/g,""))) { setPhoneErr(t.phoneInvalid); return false; }
    setPhoneErr(""); return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      if (!fullName.trim()) return;
      if (!validatePhone(phone)) return;
    }
    if (step === 3 && !sector) return;
    if (step === 4 && !platform) return;

    if ((step === 3 && role==="tadbirkor") || (step === 4 && role==="reklamachi")) {
      await handleSubmit(); return;
    }
    setStep(s => s+1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api("/api/users/register", "POST", {
        telegram_id: tgUser.id, username: tgUser.username,
        full_name: fullName, role, phone: phone.replace(/[\s-]/g,""), lang
      });
      if (role === "tadbirkor") {
        await api(`/api/business-targets/${tgUser.id}`, "POST", {
          sector, sub_sector: subSector,
          preferred_platforms: platforms,
          ages, target_gender: gender,
          location: locs, interests,
          min_followers: Number(minFollowers)||0,
          max_budget: Number(budget)||0,
          campaign_goal: campaignGoal
        });
      } else {
        await api(`/api/reklamachi-profiles/${tgUser.id}`, "POST", {
          platform, profile_link: profileLink,
          followers: Number(followers)||0,
          engagement: Number(engagement)||0,
          price_post: Number(pricePost)||0,
          price_story: Number(priceStory)||0,
          price_video: Number(priceVideo)||0,
          price_description: priceDesc,
          address, coordinates,
          audience_ages: audAges,
          audience_gender: audGender,
          audience_location: audLoc,
          interests: rekInterests
        });
      }
      onDone(lang);
    } catch(e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 0: Til tanlash
  if (step === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
        <div className="text-5xl mb-4">🌐</div>
        <h2 className="text-xl font-bold mb-6">Tilni tanlang / Выберите язык</h2>
        <div className="flex gap-3">
          <button onClick={()=>{setLang("uz");setStep(1);}} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-600">🇺🇿 O'zbek</button>
          <button onClick={()=>{setLang("ru");setStep(1);}} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-600">🇷🇺 Русский</button>
        </div>
      </div>
    </div>
  );

  // Step 1: Rol tanlash
  if (step === 1) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⭐</div>
          <h1 className="text-2xl font-bold text-blue-600">MIDAS</h1>
          <p className="text-gray-500 text-sm mt-1">{t.welcome}</p>
        </div>
        <p className="text-center font-semibold text-gray-700 mb-4">{t.chooseRole}</p>
        <div className="flex flex-col gap-3">
          <button onClick={()=>{setRole("tadbirkor");setStep(2);}}
            className="bg-blue-50 border-2 border-blue-200 hover:border-blue-500 rounded-xl p-4 text-left transition-all">
            <div className="text-2xl mb-1">🏢</div>
            <div className="font-bold text-blue-700">{lang==="uz"?"Tadbirkor":"Предприниматель"}</div>
            <div className="text-xs text-gray-500 mt-0.5">{lang==="uz"?"Reklama buyurtma qilaman":"Заказываю рекламу"}</div>
          </button>
          <button onClick={()=>{setRole("reklamachi");setStep(2);}}
            className="bg-purple-50 border-2 border-purple-200 hover:border-purple-500 rounded-xl p-4 text-left transition-all">
            <div className="text-2xl mb-1">📢</div>
            <div className="font-bold text-purple-700">{lang==="uz"?"Reklamachi":"Рекламодатель"}</div>
            <div className="text-xs text-gray-500 mt-0.5">{lang==="uz"?"Reklama joylashtirishni taklif qilaman":"Предлагаю размещение рекламы"}</div>
          </button>
        </div>
        <button onClick={()=>setStep(0)} className="mt-4 text-sm text-gray-400 w-full text-center">{t.back}</button>
      </div>
    </div>
  );

  // Step 2: Asosiy ma'lumot
  if (step === 2) return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto bg-white rounded-2xl p-5 shadow">
        <h2 className="font-bold text-lg mb-4">👤 {t.register}</h2>
        <Input label={t.fullName} value={fullName} onChange={setFullName} placeholder={t.fullName}/>
        <Input label={t.phone} value={phone} onChange={v=>{setPhone(v);setPhoneErr("");}} placeholder="+998901234567" error={phoneErr}/>
        <p className="text-xs text-gray-400 mb-4">🔒 {lang==="uz"?"Telefon raqam faqat adminga ko'rinadi":"Номер телефона виден только администратору"}</p>
        <div className="flex gap-3">
          <Btn onClick={()=>setStep(1)} color="gray" full>{t.back}</Btn>
          <Btn onClick={handleNext} color="blue" full>{t.next}</Btn>
        </div>
      </div>
    </div>
  );

  // Step 3: Tadbirkor
  if (step === 3 && role === "tadbirkor") return (
    <div className="min-h-screen bg-gray-50 p-4 pb-8">
      <div className="max-w-sm mx-auto">
        <h2 className="font-bold text-lg mb-4">🏢 {lang==="uz"?"Biznes ma'lumotlari":"Данные бизнеса"}</h2>

        {/* Sektor tanlash */}
        <label className="block text-sm font-medium text-gray-600 mb-2">{t.sector}</label>
        <div className="flex flex-col gap-2 mb-4">
          {SECTORS.map(s=>(
            <div key={s.v}>
              <button onClick={()=>{ setSector(s.v); setSubSector(""); setExpandedSector(expandedSector===s.v?null:s.v); setInterests([]); }}
                className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${sector===s.v?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-700 border-gray-200"}`}>
                <span>{s.l}</span><span>{expandedSector===s.v?"▲":"▼"}</span>
              </button>
              {expandedSector===s.v && (
                <div className="ml-3 mt-1 flex flex-col gap-1.5">
                  {s.sub.map(sub=>(
                    <button key={sub.v} onClick={()=>setSubSector(sub.v)}
                      className={`text-left px-3 py-2 rounded-lg text-sm border ${subSector===sub.v?"bg-blue-100 border-blue-400 text-blue-700":"bg-gray-50 border-gray-100 text-gray-600"}`}>
                      {sub.l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <TagSelect options={PLATFORMS_ALL} selected={platforms} onChange={setPlatforms} label={t.platforms}/>
        <TagSelect options={AGE_OPTIONS} selected={ages} onChange={setAges} label={t.ages}/>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-2">{t.gender}</label>
          <div className="flex gap-2">
            {[["all",t.genderAll],["male",t.genderM],["female",t.genderF]].map(([v,l])=>(
              <button key={v} onClick={()=>setGender(v)}
                className={`flex-1 py-2 rounded-xl text-sm border ${gender===v?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-600 border-gray-200"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <TagSelect options={LOCATIONS} selected={locs} onChange={setLocs} label={t.location}/>
        <TagSelect options={(SECTOR_INTERESTS[sector]||SECTOR_INTERESTS.default).map(i=>({v:i,l:i}))}
          selected={interests} onChange={setInterests} max={3} label={`${t.interests} (max 3)`}/>
        {interests.length>=3 && <p className="text-orange-500 text-xs mb-2">{t.maxInterests}</p>}

        <Input label={t.budget} value={budget} onChange={setBudget} type="number" placeholder="1000000"/>
        <Input label={t.minFollowers} value={minFollowers} onChange={setMinFollowers} type="number" placeholder="1000"/>
        <Input label={t.goal} value={campaignGoal} onChange={setCampaignGoal} placeholder={lang==="uz"?"Brend tanishtirish...":"Знакомство с брендом..."}/>

        <div className="flex gap-3 mt-4">
          <Btn onClick={()=>setStep(2)} color="gray" full>{t.back}</Btn>
          <Btn onClick={handleNext} color="green" full disabled={saving||!sector}>{saving?t.saving:t.save}</Btn>
        </div>
      </div>
    </div>
  );

  // Step 4: Reklamachi
  if (role === "reklamachi") return (
    <div className="min-h-screen bg-gray-50 p-4 pb-8">
      <div className="max-w-sm mx-auto">
        <h2 className="font-bold text-lg mb-4">📢 {lang==="uz"?"Reklama ma'lumotlari":"Данные рекламы"}</h2>

        <label className="block text-sm font-medium text-gray-600 mb-2">{t.platform}</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[...PLATFORMS_ONLINE,...PLATFORMS_OFFLINE].map(p=>(
            <button key={p.v} onClick={()=>setPlatform(p.v)}
              className={`py-2.5 px-3 rounded-xl text-sm border font-medium ${platform===p.v?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-600 border-gray-200"}`}>
              {p.l}
            </button>
          ))}
        </div>

        {platform && (
          <>
            {isOnline && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-700 font-medium">ℹ️ {t.verifyNote}</p>
              </div>
            )}
            {isOnline && (
              <>
                <Input label={`${t.profileLink} (${lang==="uz"?"masalan":"например"}: instagram.com/username)`}
                  value={profileLink} onChange={setProfileLink} placeholder="https://instagram.com/username"/>
                <Input label={t.followers} value={followers} onChange={setFollowers} type="number" placeholder="10000"/>
                <Input label={t.engagement} value={engagement} onChange={setEngagement} type="number" placeholder="3.5"/>
              </>
            )}
            {isOffline && (
              <>
                <Input label={t.address} value={address} onChange={setAddress} placeholder={lang==="uz"?"Toshkent, Chilonzor...":"Ташкент, Чиланзар..."}/>
                <Input label={t.coordinates} value={coordinates} onChange={setCoordinates} placeholder="41.2995, 69.2401"/>
              </>
            )}
            <Input label={t.pricePost} value={pricePost} onChange={setPricePost} type="number" placeholder="150000"/>
            {isOnline && <>
              <Input label={t.priceStory} value={priceStory} onChange={setPriceStory} type="number" placeholder="80000"/>
              <Input label={t.priceVideo} value={priceVideo} onChange={setPriceVideo} type="number" placeholder="300000"/>
            </>}
            <Input label={t.priceDesc} value={priceDesc} onChange={setPriceDesc} placeholder={lang==="uz"?"Narx haqida qo'shimcha...":"Дополнительно о цене..."}/>
            <TagSelect options={AGE_OPTIONS} selected={audAges} onChange={setAudAges} label={t.audienceAges}/>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-2">{t.audienceGender}</label>
              <div className="flex gap-2">
                {[["all",t.genderAll],["male",t.genderM],["female",t.genderF]].map(([v,l])=>(
                  <button key={v} onClick={()=>setAudGender(v)}
                    className={`flex-1 py-2 rounded-xl text-sm border ${audGender===v?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-600 border-gray-200"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-2">{t.audienceLocation}</label>
              <select value={audLoc} onChange={e=>setAudLoc(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
                {LOCATIONS.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}
              </select>
            </div>
            <TagSelect options={(SECTOR_INTERESTS.default).map(i=>({v:i,l:i}))}
              selected={rekInterests} onChange={setRekInterests} max={3} label={`${t.interests} (max 3)`}/>
          </>
        )}

        <div className="flex gap-3 mt-4">
          <Btn onClick={()=>setStep(2)} color="gray" full>{t.back}</Btn>
          <Btn onClick={handleNext} color="green" full disabled={saving||!platform}>{saving?t.saving:t.save}</Btn>
        </div>
      </div>
    </div>
  );

  return null;
}

// ==================== MATCH ====================

function MatchPage({user, lang}) {
  const t = T[lang];
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [offerModal, setOfferModal] = useState(null);
  const [offerMsg, setOfferMsg] = useState("");
  const [detailModal, setDetailModal] = useState(null);
  const [freeUsed, setFreeUsed] = useState(false);

  const load = useCallback(async (filter="") => {
    setLoading(true);
    try {
      const url = filter && filter!=="midas"
        ? `/api/match/${user.telegram_id}?platform_filter=${filter}`
        : `/api/match/${user.telegram_id}`;
      const res = await api(url);
      setMatches(Array.isArray(res) ? res : []);
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user.role === "reklamachi") { load(); }
    // Check free offer
    if (user.role === "reklamachi") {
      api(`/api/reklamachi-profiles/${user.telegram_id}`)
        .then(r => setFreeUsed(!!r.free_offer_used)).catch(()=>{});
    }
  }, [user, load]);

  const sendOffer = async (isFree=false) => {
    try {
      await api("/api/offers", "POST", {
        from_id: user.telegram_id,
        to_id: offerModal.uid || offerModal.user_id,
        message: offerMsg,
        is_free: isFree ? 1 : 0
      });
      setOfferModal(null); setOfferMsg("");
      if (isFree) setFreeUsed(true);
      alert(lang==="uz"?"Taklif yuborildi! ✅":"Предложение отправлено! ✅");
    } catch(e) { alert(e.message); }
  };

  const matchColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-blue-100 text-blue-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  // Tadbirkor uchun platforma tanlash ekrani
  if (user.role === "tadbirkor" && !platformFilter) return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">🎯 {t.whereAdvert}</h2>
      <div className="grid grid-cols-2 gap-3">
        {MATCH_PLATFORMS.map(p => (
          <button key={p.v} onClick={()=>{ setPlatformFilter(p.v); load(p.v); }}
            className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-3 text-center font-medium text-sm transition-all active:scale-95">
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );

  // Reklamachi uchun tugmalar
  const rekButtons = user.role === "reklamachi" && (
    <div className="flex gap-2 mb-4 flex-wrap">
      <Btn onClick={()=>load()} color={!platformFilter?"blue":"gray"} small>{t.bestMatch}</Btn>
      <Btn onClick={()=>{setPlatformFilter("all");load("all");}} color={platformFilter==="all"?"blue":"gray"} small>{t.allPartners}</Btn>
    </div>
  );

  return (
    <div className="p-4">
      {user.role === "tadbirkor" && platformFilter && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={()=>setPlatformFilter("")} className="text-blue-500 text-sm">← {t.back}</button>
          <span className="font-bold">{MATCH_PLATFORMS.find(p=>p.v===platformFilter)?.l}</span>
        </div>
      )}
      {rekButtons}
      {loading && <div className="text-center py-8 text-gray-400">{t.loading}</div>}
      {!loading && matches.length===0 && <div className="text-center py-8 text-gray-400">{t.noMatches}</div>}
      <div className="flex flex-col gap-3">
        {matches.map((m,i) => {
          const partnerId = m.uid || m.user_id;
          const name = m.full_name || "";
          const score = m.match_score || 0;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-gray-800">{name}</span>
                  {m.is_premium===1 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Premium</span>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${matchColor(score)}`}>{score}% {t.matchScore}</span>
              </div>
              {user.role==="tadbirkor" && (
                <div className="text-sm text-gray-500 mb-3">
                  <div>{PLATFORMS_ALL.find(p=>p.v===m.platform)?.l}</div>
                  {m.followers>0 && <div>{m.followers?.toLocaleString()} {lang==="uz"?"obunachi":"подписчиков"}</div>}
                  {m.engagement>0 && <div>ER: {m.engagement}%</div>}
                  {m.price_post>0 && <div>{m.price_post?.toLocaleString()} {lang==="uz"?"so'm/post":"сум/пост"}</div>}
                  {m.address && <div>📍 {m.address}</div>}
                  <div className="mt-1">{m.verified ? t.verified : t.notVerified}</div>
                </div>
              )}
              {user.role==="reklamachi" && (
                <div className="text-sm text-gray-500 mb-3">
                  <div>{SECTORS.find(s=>s.v===m.sector)?.l}</div>
                  {m.max_budget>0 && <div>{lang==="uz"?"Byudjet":"Бюджет"}: {m.max_budget?.toLocaleString()} {lang==="uz"?"so'm":"сум"}</div>}
                  {m.campaign_goal && <div>{m.campaign_goal}</div>}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Btn onClick={()=>setDetailModal(m)} color="ghost" small>{t.details}</Btn>
                <Btn onClick={()=>setOfferModal(m)} color="blue" small>{t.sendOffer}</Btn>
                {user.role==="reklamachi" && !freeUsed && (
                  <Btn onClick={()=>{setOfferModal(m);}} color="green" small>{t.freeOfferBtn}</Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Offer Modal */}
      {offerModal && (
        <Modal title={t.sendOffer} onClose={()=>setOfferModal(null)}>
          <p className="text-gray-600 mb-3">{offerModal.full_name}</p>
          <textarea value={offerMsg} onChange={e=>setOfferMsg(e.target.value)} rows={4}
            placeholder={t.offerMsg}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:border-blue-400"/>
          <div className="flex flex-col gap-2">
            <Btn onClick={()=>sendOffer(false)} color="blue" full>{t.sendOffer}</Btn>
            {user.role==="reklamachi" && !freeUsed && (
              <Btn onClick={()=>sendOffer(true)} color="green" full>{t.freeOffer}</Btn>
            )}
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={detailModal.full_name} onClose={()=>setDetailModal(null)}>
          <div className="space-y-2 text-sm">
            {detailModal.platform && <div><b>{t.platform}:</b> {PLATFORMS_ALL.find(p=>p.v===detailModal.platform)?.l}</div>}
            {detailModal.profile_link && <div><b>Link:</b> <a href={detailModal.profile_link} className="text-blue-500 break-all">{detailModal.profile_link}</a></div>}
            {detailModal.followers>0 && <div><b>{t.followers}:</b> {detailModal.followers?.toLocaleString()}</div>}
            {detailModal.engagement>0 && <div><b>ER:</b> {detailModal.engagement}%</div>}
            {detailModal.price_post>0 && <div><b>{t.pricePost}:</b> {detailModal.price_post?.toLocaleString()} {lang==="uz"?"so'm":"сум"}</div>}
            {detailModal.price_story>0 && <div><b>{t.priceStory}:</b> {detailModal.price_story?.toLocaleString()} {lang==="uz"?"so'm":"сум"}</div>}
            {detailModal.price_video>0 && <div><b>{t.priceVideo}:</b> {detailModal.price_video?.toLocaleString()} {lang==="uz"?"so'm":"сум"}</div>}
            {detailModal.price_description && <div><b>{t.priceDesc}:</b> {detailModal.price_description}</div>}
            {detailModal.address && <div><b>{t.address}:</b> {detailModal.address}</div>}
            {detailModal.sector && <div><b>{t.sector}:</b> {SECTORS.find(s=>s.v===detailModal.sector)?.l}</div>}
            {detailModal.campaign_goal && <div><b>{t.goal}:</b> {detailModal.campaign_goal}</div>}
            {detailModal.max_budget>0 && <div><b>{lang==="uz"?"Byudjet":"Бюджет"}:</b> {detailModal.max_budget?.toLocaleString()} {lang==="uz"?"so'm":"сум"}</div>}
            <div><b>⭐ {lang==="uz"?"Reyting":"Рейтинг"}:</b> {detailModal.rating?.toFixed?.(1)||"5.0"}</div>
            {detailModal.verified!==undefined && <div>{detailModal.verified ? t.verified : t.notVerified}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==================== CHATS ====================

function ChatsPage({user, lang}) {
  const t = T[lang];
  const [chats, setChats] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [openChat, setOpenChat] = useState(null); // {id, partner_name, partner_id}
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showMidas, setShowMidas] = useState(false);
  const msgEndRef = useRef();

  const loadChats = useCallback(async () => {
    try {
      const res = await api(`/api/chats/${user.telegram_id}`);
      setChats(Array.isArray(res) ? res : []);
    } catch {}
  }, [user]);

  const loadBroadcasts = useCallback(async () => {
    try {
      const res = await api(`/api/broadcasts?tg_id=${user.telegram_id}`);
      setBroadcasts(Array.isArray(res) ? res : []);
    } catch {}
  }, [user]);

  useEffect(() => { loadChats(); loadBroadcasts(); }, [loadChats, loadBroadcasts]);

  const openChatFn = async (chat) => {
    setOpenChat(chat);
    try {
      const res = await api(`/api/chats/${chat.id}/messages`);
      setMessages(Array.isArray(res) ? res : []);
      await api(`/api/chats/${chat.id}/read?tg_id=${user.telegram_id}`, "PUT");
    } catch {}
  };

  useEffect(() => {
    if (!openChat) return;
    const iv = setInterval(async () => {
      const res = await api(`/api/chats/${openChat.id}/messages`).catch(()=>null);
      if (res) setMessages(Array.isArray(res) ? res : []);
    }, 3000);
    return () => clearInterval(iv);
  }, [openChat]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const sendMsg = async () => {
    if (!text.trim() || !openChat) return;
    const t2 = text; setText("");
    try {
      await api("/api/messages", "POST", {
        chat_id: openChat.id,
        sender_id: user.telegram_id,
        receiver_id: openChat.partner_id,
        message_text: t2
      });
      const res = await api(`/api/chats/${openChat.id}/messages`);
      setMessages(Array.isArray(res) ? res : []);
    } catch {}
  };

  if (openChat) return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={()=>{setOpenChat(null);loadChats();}} className="text-blue-500 text-xl">←</button>
        <span className="font-bold">{openChat.partner_name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-2">
        {messages.map((m,i) => (
          <div key={i} className={`flex ${m.sender_id===user.telegram_id?"justify-end":"justify-start"}`}>
            <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.sender_id===user.telegram_id?"bg-blue-500 text-white rounded-br-sm":"bg-white text-gray-800 shadow-sm rounded-bl-sm"}`}>
              {m.message_text}
              <div className={`text-xs mt-0.5 ${m.sender_id===user.telegram_id?"text-blue-100":"text-gray-400"}`}>{m.created_at?.slice(11,16)}</div>
            </div>
          </div>
        ))}
        <div ref={msgEndRef}/>
      </div>
      <div className="bg-white border-t p-3 flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
          placeholder={lang==="uz"?"Xabar yozing...":"Напишите сообщение..."}/>
        <Btn onClick={sendMsg} color="blue" small>{t.send}</Btn>
      </div>
    </div>
  );

  if (showMidas) return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-0">
        <button onClick={()=>setShowMidas(false)} className="text-blue-500 text-xl">←</button>
        <span className="font-bold">📢 MIDAS</span>
      </div>
      <div className="flex-1 p-4 space-y-3">
        {broadcasts.length===0 && <div className="text-center text-gray-400 py-8">{t.noChats}</div>}
        {broadcasts.map((b,i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>📢 MIDAS Admin</span><span>{b.created_at?.slice(0,16)}</span>
            </div>
            <p className="text-sm text-gray-800">{b.message_text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">💬 {t.chats}</h2>
      <button onClick={()=>setShowMidas(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-4 text-left flex justify-between items-center">
        <div>
          <div className="font-bold">{t.midasChat}</div>
          {broadcasts.length>0 && <div className="text-xs text-blue-100 mt-0.5">{broadcasts[0]?.message_text?.slice(0,40)}...</div>}
        </div>
        <span className="text-2xl">›</span>
      </button>
      {chats.length===0 && <div className="text-center text-gray-400 py-8">{t.noChats}</div>}
      {chats.map(chat => (
        <button key={chat.id} onClick={()=>openChatFn(chat)}
          className="w-full bg-white rounded-xl p-4 mb-2 text-left shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="font-medium text-gray-800">{chat.partner_name}</div>
            {chat.last_message && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{chat.last_message}</div>}
          </div>
          <div className="flex flex-col items-end gap-1">
            {chat.unread>0 && <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{chat.unread}</span>}
            <span className="text-gray-300">›</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ==================== OFFERS ====================

function OffersPage({user, lang}) {
  const t = T[lang];
  const [offers, setOffers] = useState([]);
  const [rateModal, setRateModal] = useState(null);
  const [rating, setRating] = useState(5);

  const load = useCallback(async () => {
    const res = await api(`/api/offers/${user.telegram_id}`).catch(()=>[]);
    setOffers(Array.isArray(res) ? res : []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await api(`/api/offers/${id}/status?status=${status}`, "PUT");
    load();
  };

  const submitRating = async () => {
    await api(`/api/offers/${rateModal.id}/rate`, "POST", {rating});
    setRateModal(null); load();
  };

  const statusColor = {pending:"bg-yellow-50 border-yellow-200",accepted:"bg-green-50 border-green-200",rejected:"bg-red-50 border-red-100"};
  const statusText = {
    pending: lang==="uz"?"⏳ Kutilmoqda":"⏳ В ожидании",
    accepted: lang==="uz"?"✅ Qabul qilindi":"✅ Принято",
    rejected: lang==="uz"?"❌ Rad etildi":"❌ Отклонено"
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">📨 {lang==="uz"?"Takliflar":"Предложения"}</h2>
      {offers.length===0 && <div className="text-center text-gray-400 py-8">{lang==="uz"?"Hali takliflar yo'q":"Предложений пока нет"}</div>}
      {offers.map(o => (
        <div key={o.id} className={`rounded-xl border p-4 mb-3 ${statusColor[o.status]||"bg-white border-gray-200"}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-medium">{o.from_id===user.telegram_id ? (lang==="uz"?"Yuborildi":"Отправлено") : (lang==="uz"?"Keldi":"Получено")}</span>
              <span className="text-xs text-gray-400 ml-2">{o.created_at?.slice(0,10)}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/70">{statusText[o.status]}</span>
          </div>
          <div className="text-sm text-gray-600 mb-1">
            {o.from_id===user.telegram_id ? `→ ${o.to_name}` : `← ${o.from_name}`}
          </div>
          {o.message && <p className="text-sm text-gray-700 mb-2 italic">"{o.message}"</p>}
          {o.is_free===1 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mr-2">Tekin taklif</span>}
          {o.to_id===user.telegram_id && o.status==="pending" && (
            <div className="flex gap-2 mt-2">
              <Btn onClick={()=>updateStatus(o.id,"accepted")} color="green" small>{t.accept}</Btn>
              <Btn onClick={()=>updateStatus(o.id,"rejected")} color="red" small>{t.reject}</Btn>
            </div>
          )}
          {o.status==="accepted" && !o.rated && o.from_id===user.telegram_id && (
            <Btn onClick={()=>setRateModal(o)} color="yellow" small>{t.rate}</Btn>
          )}
        </div>
      ))}
      {rateModal && (
        <Modal title={t.ratePartner} onClose={()=>setRateModal(null)}>
          <p className="text-gray-600 mb-4">{rateModal.to_name}</p>
          <div className="flex justify-center gap-3 mb-4">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={()=>setRating(n)} className={`text-3xl transition-all ${n<=rating?"text-yellow-400":"text-gray-200"}`}>★</button>
            ))}
          </div>
          <Btn onClick={submitRating} color="blue" full>{t.save}</Btn>
        </Modal>
      )}
    </div>
  );
}

// ==================== PROFILE ====================

function ProfilePage({user, lang, onLangChange}) {
  const t = T[lang];
  const [userData, setUserData] = useState(user);
  const [bt, setBt] = useState(null);
  const [rp, setRp] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({});

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        api(`/api/users/${user.telegram_id}`),
        api(`/api/users/${user.telegram_id}/stats`)
      ]);
      setUserData(u); setStats(s);
      if (u.role==="tadbirkor") {
        const b = await api(`/api/business-targets/${user.telegram_id}`).catch(()=>null);
        if (b) setBt(b);
      } else {
        const r = await api(`/api/reklamachi-profiles/${user.telegram_id}`).catch(()=>null);
        if (r) setRp(r);
      }
    } catch {}
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async (data) => {
    setSaving(true);
    try {
      if (editModal.type === "user") {
        if (data.phone && !PHONE_REGEX.test(data.phone.replace(/[\s-]/g,""))) {
          alert(t.phoneInvalid); setSaving(false); return;
        }
        await api(`/api/users/${user.telegram_id}`, "PUT", data);
      } else if (editModal.type === "bt") {
        await api(`/api/business-targets/${user.telegram_id}`, "POST", {...bt, ...data});
      } else if (editModal.type === "rp") {
        await api(`/api/reklamachi-profiles/${user.telegram_id}`, "PUT", data);
      }
      await load();
      setEditModal(null);
    } catch(e) { alert(e.message); }
    setSaving(false);
  };

  const sectorLabel = bt ? SECTORS.find(s=>s.v===bt.sector)?.l : "";
  const platformLabel = rp ? PLATFORMS_ALL.find(p=>p.v===rp.platform)?.l : "";

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 mb-4 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
          {userData.role==="tadbirkor"?"🏢":"📢"}
        </div>
        <h2 className="font-bold text-xl">{userData.full_name}</h2>
        <p className="text-blue-100 text-sm">{userData.role==="tadbirkor"?t.tadbirkor:t.reklamachi}</p>
        <div className="flex justify-center gap-4 mt-3 text-sm">
          <div><b>{stats.deals||0}</b><br/><span className="text-blue-100 text-xs">{lang==="uz"?"Bitim":"Сделки"}</span></div>
          <div><b>{userData.rating?.toFixed?.(1)||"5.0"}⭐</b><br/><span className="text-blue-100 text-xs">{lang==="uz"?"Reyting":"Рейтинг"}</span></div>
          <div><b>{stats.total_offers||0}</b><br/><span className="text-blue-100 text-xs">{lang==="uz"?"Taklif":"Предл."}</span></div>
        </div>
        {userData.is_premium===1 && <div className="mt-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block">⭐ PREMIUM</div>}
      </div>

      {/* Asosiy ma'lumot */}
      <Section title={lang==="uz"?"Asosiy ma'lumot":"Основные данные"}
        onEdit={()=>setEditModal({type:"user", data:{full_name:userData.full_name, phone:userData.phone}})}>
        <Row label={t.fullName} value={userData.full_name}/>
        <Row label={lang==="uz"?"Til":"Язык"} value={lang==="uz"?"O'zbek":"Русский"} extra={
          <div className="flex gap-1 mt-1">
            <button onClick={()=>onLangChange("uz")} className={`px-2 py-0.5 rounded text-xs ${lang==="uz"?"bg-blue-500 text-white":"bg-gray-100"}`}>UZ</button>
            <button onClick={()=>onLangChange("ru")} className={`px-2 py-0.5 rounded text-xs ${lang==="ru"?"bg-blue-500 text-white":"bg-gray-100"}`}>RU</button>
          </div>
        }/>
      </Section>

      {/* Tadbirkor */}
      {userData.role==="tadbirkor" && bt && (
        <Section title={lang==="uz"?"Biznes ma'lumotlari":"Данные бизнеса"}
          onEdit={()=>setEditModal({type:"bt", data:bt})}>
          <Row label={t.sector} value={sectorLabel}/>
          {bt.sub_sector && <Row label={t.subSector} value={bt.sub_sector}/>}
          {bt.preferred_platforms?.length>0 && <Row label={t.platforms} value={bt.preferred_platforms.map(p=>PLATFORMS_ALL.find(x=>x.v===p)?.l||p).join(", ")}/>}
          {bt.ages?.length>0 && <Row label={t.ages} value={bt.ages.map(a=>AGE_OPTIONS.find(x=>x.v===a)?.l||a).join(", ")}/>}
          {bt.location?.length>0 && <Row label={t.location} value={bt.location.map(l=>LOCATIONS.find(x=>x.v===l)?.l||l).join(", ")}/>}
          {bt.interests?.length>0 && <Row label={t.interests} value={bt.interests.join(", ")}/>}
          {bt.max_budget>0 && <Row label={t.budget} value={`${bt.max_budget?.toLocaleString()} ${lang==="uz"?"so'm":"сум"}`}/>}
          {bt.campaign_goal && <Row label={t.goal} value={bt.campaign_goal}/>}
        </Section>
      )}

      {/* Reklamachi */}
      {userData.role==="reklamachi" && rp && (
        <Section title={lang==="uz"?"Reklama ma'lumotlari":"Данные рекламы"}
          onEdit={()=>setEditModal({type:"rp_price", data:rp})}>
          <Row label={t.platform} value={platformLabel}/>
          {rp.profile_link && <Row label="Link" value={rp.profile_link} link/>}
          {rp.address && <Row label={t.address} value={rp.address}/>}
          {rp.followers>0 && <Row label={t.followers} value={rp.followers?.toLocaleString()}/>}
          {rp.engagement>0 && <Row label={t.engagement} value={`${rp.engagement}%`}/>}
          {rp.price_post>0 && <Row label={t.pricePost} value={`${rp.price_post?.toLocaleString()} ${lang==="uz"?"so'm":"сум"}`}/>}
          {rp.price_story>0 && <Row label={t.priceStory} value={`${rp.price_story?.toLocaleString()} ${lang==="uz"?"so'm":"сум"}`}/>}
          {rp.price_video>0 && <Row label={t.priceVideo} value={`${rp.price_video?.toLocaleString()} ${lang==="uz"?"so'm":"сум"}`}/>}
          {rp.interests?.length>0 && <Row label={t.interests} value={rp.interests.join(", ")}/>}
          <Row label={lang==="uz"?"Holat":"Статус"} value={rp.verified ? t.verified : t.notVerified}/>
        </Section>
      )}

      {/* Edit modals */}
      {editModal?.type==="user" && (
        <EditUserModal data={editModal.data} t={t} onSave={saveEdit} onClose={()=>setEditModal(null)} saving={saving}/>
      )}
      {editModal?.type==="bt" && (
        <EditBtModal data={editModal.data} t={t} lang={lang} onSave={saveEdit} onClose={()=>setEditModal(null)} saving={saving}/>
      )}
      {editModal?.type==="rp_price" && (
        <EditRpModal data={editModal.data} t={t} lang={lang} onSave={saveEdit} onClose={()=>setEditModal(null)} saving={saving}/>
      )}
    </div>
  );
}

function Section({title, children, onEdit}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {onEdit && <button onClick={onEdit} className="text-blue-500 text-sm font-medium">✏️</button>}
      </div>
      {children}
    </div>
  );
}

function Row({label, value, link, extra}) {
  return (
    <div className="flex flex-col mb-2 last:mb-0">
      <span className="text-xs text-gray-400">{label}</span>
      {link ? <a href={value} className="text-blue-500 text-sm break-all">{value}</a>
             : <span className="text-sm text-gray-800">{value||"—"}</span>}
      {extra}
    </div>
  );
}

function EditUserModal({data, t, onSave, onClose, saving}) {
  const [form, setForm] = useState({...data});
  return (
    <Modal title={t.edit} onClose={onClose}>
      <Input label={t.fullName} value={form.full_name||""} onChange={v=>setForm({...form,full_name:v})}/>
      <Input label={t.phone} value={form.phone||""} onChange={v=>setForm({...form,phone:v})} placeholder="+998901234567"/>
      <div className="flex gap-2 mt-2">
        <Btn onClick={onClose} color="gray" full>{t.cancel}</Btn>
        <Btn onClick={()=>onSave(form)} color="blue" full disabled={saving}>{saving?t.saving:t.save}</Btn>
      </div>
    </Modal>
  );
}

function EditBtModal({data, t, lang, onSave, onClose, saving}) {
  const [form, setForm] = useState({...data});
  return (
    <Modal title={`✏️ ${t.edit}`} onClose={onClose}>
      <div className="max-h-96 overflow-y-auto">
        <TagSelect options={PLATFORMS_ALL} selected={form.preferred_platforms||[]} onChange={v=>setForm({...form,preferred_platforms:v})} label={t.platforms}/>
        <TagSelect options={AGE_OPTIONS} selected={form.ages||[]} onChange={v=>setForm({...form,ages:v})} label={t.ages}/>
        <TagSelect options={LOCATIONS} selected={form.location||[]} onChange={v=>setForm({...form,location:v})} label={t.location}/>
        <TagSelect options={(SECTOR_INTERESTS[form.sector]||SECTOR_INTERESTS.default).map(i=>({v:i,l:i}))}
          selected={form.interests||[]} onChange={v=>setForm({...form,interests:v})} max={3} label={t.interests}/>
        <Input label={t.budget} value={form.max_budget||""} onChange={v=>setForm({...form,max_budget:v})} type="number"/>
        <Input label={t.goal} value={form.campaign_goal||""} onChange={v=>setForm({...form,campaign_goal:v})}/>
      </div>
      <div className="flex gap-2 mt-2">
        <Btn onClick={onClose} color="gray" full>{t.cancel}</Btn>
        <Btn onClick={()=>onSave(form)} color="blue" full disabled={saving}>{saving?t.saving:t.save}</Btn>
      </div>
    </Modal>
  );
}

function EditRpModal({data, t, lang, onSave, onClose, saving}) {
  const [form, setForm] = useState({...data});
  const isOnline = PLATFORMS_ONLINE.map(p=>p.v).includes(form.platform);
  const isOffline = PLATFORMS_OFFLINE.map(p=>p.v).includes(form.platform);
  return (
    <Modal title={`✏️ ${t.edit}`} onClose={onClose}>
      <div className="max-h-96 overflow-y-auto">
        {isOnline && <>
          <Input label={t.profileLink} value={form.profile_link||""} onChange={v=>setForm({...form,profile_link:v})}/>
          <Input label={t.followers} value={form.followers||""} onChange={v=>setForm({...form,followers:v})} type="number"/>
          <Input label={t.engagement} value={form.engagement||""} onChange={v=>setForm({...form,engagement:v})} type="number"/>
        </>}
        {isOffline && <Input label={t.address} value={form.address||""} onChange={v=>setForm({...form,address:v})}/>}
        <Input label={t.pricePost} value={form.price_post||""} onChange={v=>setForm({...form,price_post:v})} type="number"/>
        {isOnline && <>
          <Input label={t.priceStory} value={form.price_story||""} onChange={v=>setForm({...form,price_story:v})} type="number"/>
          <Input label={t.priceVideo} value={form.price_video||""} onChange={v=>setForm({...form,price_video:v})} type="number"/>
        </>}
        <Input label={t.priceDesc} value={form.price_description||""} onChange={v=>setForm({...form,price_description:v})}/>
        <TagSelect options={AGE_OPTIONS} selected={form.audience_ages||[]} onChange={v=>setForm({...form,audience_ages:v})} label={t.audienceAges}/>
        <TagSelect options={SECTOR_INTERESTS.default.map(i=>({v:i,l:i}))} selected={form.interests||[]} onChange={v=>setForm({...form,interests:v})} max={3} label={t.interests}/>
      </div>
      <div className="flex gap-2 mt-2">
        <Btn onClick={onClose} color="gray" full>{t.cancel}</Btn>
        <Btn onClick={()=>onSave(form)} color="blue" full disabled={saving}>{saving?t.saving:t.save}</Btn>
      </div>
    </Modal>
  );
}

// ==================== NOTIFICATIONS ====================

function NotifsPage({user, lang, onRead}) {
  const t = T[lang];
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api(`/api/notifications/${user.telegram_id}`).then(res=>setNotifs(Array.isArray(res)?res:[])).catch(()=>{});
    api(`/api/notifications/${user.telegram_id}/read`,"PUT").then(onRead).catch(()=>{});
  }, [user, onRead]);

  const typeIcon = {info:"ℹ️",success:"✅",warning:"⚠️",offer:"📨",message:"💬",broadcast:"📢"};

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">🔔 {t.notifs}</h2>
      {notifs.length===0 && <div className="text-center text-gray-400 py-8">{t.noNotifs}</div>}
      {notifs.map(n => (
        <div key={n.id} className={`bg-white rounded-xl p-4 mb-2 border shadow-sm ${!n.is_read?"border-blue-200":"border-gray-100"}`}>
          <div className="flex gap-3">
            <span className="text-2xl">{typeIcon[n.type]||"🔔"}</span>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{n.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{n.body}</div>
              <div className="text-xs text-gray-300 mt-1">{n.created_at?.slice(0,16)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== ADMIN ====================

function AdminPage({user, lang}) {
  const [stats, setStats] = useState(null);
  const [view, setView] = useState("main");
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [bcMsg, setBcMsg] = useState("");
  const [bcTarget, setBcTarget] = useState("all");
  const t = T[lang];

  useEffect(() => {
    api(`/api/admin/stats?admin_id=${user.telegram_id}`).then(setStats).catch(()=>{});
  }, [user]);

  const loadQueue = async () => {
    const res = await api(`/api/admin/verify-queue?admin_id=${user.telegram_id}`).catch(()=>[]);
    setQueue(Array.isArray(res)?res:[]);
    setView("verify");
  };
  const loadUsers = async () => {
    const res = await api(`/api/admin/users?admin_id=${user.telegram_id}&page=1&search=${search}`).catch(()=>[]);
    setUsers(Array.isArray(res)?res:[]);
    setView("users");
  };
  const verifyUser = async (id, val) => {
    await api(`/api/admin/verify/${id}?admin_id=${user.telegram_id}&value=${val}`, "PUT");
    loadQueue();
  };
  const togglePremium = async (id, current) => {
    await api(`/api/admin/users/${id}/premium?admin_id=${user.telegram_id}&value=${current?0:1}`, "PUT");
    loadUsers();
  };
  const blockUser = async (id) => {
    const reason = prompt(lang==="uz"?"Bloklash sababi:":"Причина блокировки:");
    if (!reason) return;
    await api(`/api/admin/users/${id}/block?admin_id=${user.telegram_id}&reason=${encodeURIComponent(reason)}`, "PUT");
    loadUsers();
  };
  const sendBroadcast = async () => {
    if (!bcMsg.trim()) return;
    await api("/api/admin/broadcast","POST",{sender_id:user.telegram_id,target:bcTarget,message_text:bcMsg});
    setBcMsg(""); alert(lang==="uz"?"Yuborildi ✅":"Отправлено ✅");
  };

  if (view === "verify") return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={()=>setView("main")} className="text-blue-500">← {t.back}</button>
        <h2 className="font-bold">✅ {lang==="uz"?"Tasdiqlash":"Подтверждение"} ({queue.length})</h2>
      </div>
      {queue.map(p=>(
        <div key={p.user_id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border">
          <div className="font-bold mb-1">{p.full_name}</div>
          <div className="text-sm text-gray-500 mb-2">
            <div>{PLATFORMS_ALL.find(x=>x.v===p.platform)?.l}</div>
            {p.profile_link && <a href={p.profile_link} className="text-blue-500 break-all text-xs">{p.profile_link}</a>}
            <div>{p.followers?.toLocaleString()} {lang==="uz"?"obunachi":"подписчиков"} | ER: {p.engagement}%</div>
          </div>
          <div className="flex gap-2">
            <Btn onClick={()=>verifyUser(p.user_id,1)} color="green" small>✅ {lang==="uz"?"Tasdiqlash":"Подтвердить"}</Btn>
            <Btn onClick={()=>verifyUser(p.user_id,0)} color="red" small>❌ {lang==="uz"?"Rad etish":"Отклонить"}</Btn>
          </div>
        </div>
      ))}
    </div>
  );

  if (view === "users") return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={()=>setView("main")} className="text-blue-500">← {t.back}</button>
        <h2 className="font-bold">👥 {lang==="uz"?"Foydalanuvchilar":"Пользователи"}</h2>
      </div>
      <div className="flex gap-2 mb-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="uz"?"Qidirish...":"Поиск..."}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
        <Btn onClick={loadUsers} color="blue" small>{lang==="uz"?"Izla":"Найти"}</Btn>
      </div>
      {users.map(u=>(
        <div key={u.telegram_id} className="bg-white rounded-xl p-3 mb-2 shadow-sm border text-sm">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{u.full_name}</div>
              <div className="text-gray-400 text-xs">{u.role} | {u.phone||"—"}</div>
            </div>
            <div className="text-xs text-right">
              {u.is_premium===1 && <div className="text-yellow-600">⭐ Premium</div>}
              {u.is_blocked===1 && <div className="text-red-500">🚫 Bloklangan</div>}
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Btn onClick={()=>togglePremium(u.telegram_id,u.is_premium)} color={u.is_premium?"gray":"yellow"} small>
              {u.is_premium?(lang==="uz"?"Premium olish":"Убрать Premium"):(lang==="uz"?"Premium berish":"Дать Premium")}
            </Btn>
            {!u.is_blocked && <Btn onClick={()=>blockUser(u.telegram_id)} color="red" small>🚫</Btn>}
          </div>
        </div>
      ))}
    </div>
  );

  if (view === "broadcast") return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={()=>setView("main")} className="text-blue-500">← {t.back}</button>
        <h2 className="font-bold">📢 {lang==="uz"?"Xabar yuborish":"Рассылка"}</h2>
      </div>
      <div className="flex gap-2 mb-3">
        {[["all",lang==="uz"?"Barchasiga":"Всем"],["tadbirkor",lang==="uz"?"Tadbirkorlarga":"Предпринимателям"],["reklamachi",lang==="uz"?"Reklamachilarga":"Рекламодателям"]].map(([v,l])=>(
          <button key={v} onClick={()=>setBcTarget(v)}
            className={`flex-1 py-2 rounded-xl text-xs border ${bcTarget===v?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-600 border-gray-200"}`}>{l}</button>
        ))}
      </div>
      <textarea value={bcMsg} onChange={e=>setBcMsg(e.target.value)} rows={5}
        placeholder={lang==="uz"?"Xabar matni...":"Текст сообщения..."}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:border-blue-400"/>
      <Btn onClick={sendBroadcast} color="blue" full>{lang==="uz"?"Yuborish":"Отправить"}</Btn>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">🛡 Admin Panel</h2>
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ["👥",stats.total_users,lang==="uz"?"Foydalanuvchi":"Польз."],
            ["🏢",stats.tadbirkorlar,lang==="uz"?"Tadbirkor":"Предпр."],
            ["📢",stats.reklamachilar,lang==="uz"?"Reklamachi":"Реклам."],
            ["⭐",stats.premium,"Premium"],
            ["📨",stats.total_offers,lang==="uz"?"Takliflar":"Предлож."],
            ["✅",stats.accepted_offers,lang==="uz"?"Qabul qilingan":"Принято"],
            ["💬",stats.active_chats,lang==="uz"?"Chatlar":"Чаты"],
            ["⏳",stats.unverified,lang==="uz"?"Kutmoqda":"В ожид."],
          ].map(([icon,val,label])=>(
            <div key={label} className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <div className="text-2xl">{icon}</div>
              <div className="font-bold text-xl text-blue-600">{val||0}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Btn onClick={loadQueue} color="blue" full>✅ {lang==="uz"?"Profillarni tasdiqlash":"Подтвердить профили"} {stats?.unverified>0&&`(${stats.unverified})`}</Btn>
        <Btn onClick={loadUsers} color="purple" full>👥 {lang==="uz"?"Foydalanuvchilar":"Пользователи"}</Btn>
        <Btn onClick={()=>setView("broadcast")} color="green" full>📢 {lang==="uz"?"Xabar yuborish":"Рассылка"}</Btn>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================

export default function App() {
  const tgUser = tg?.initDataUnsafe?.user || { id: 123456789, first_name: "Test", username: "test" };
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("match");
  const [lang, setLang] = useState("uz");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const u = await api(`/api/users/${tgUser.id}`);
      setLang(u.lang || "uz");
      setUser(u);
    } catch (e) {
      if (e.message?.includes("404") || e.message === "404") setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const onRegDone = async (chosenLang) => {
    setLang(chosenLang);
    await api(`/api/users/${tgUser.id}/lang?lang=${chosenLang}`, "PUT");
    const u = await api(`/api/users/${tgUser.id}`);
    setUser(u);
  };

  const refreshNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api(`/api/notifications/${user.telegram_id}/count`);
      setNotifCount(res?.count || 0);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshNotifs();
    const iv = setInterval(refreshNotifs, 15000);
    return () => clearInterval(iv);
  }, [user, refreshNotifs]);

  const t = T[lang];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="text-white text-center">
        <div className="text-5xl mb-3 animate-pulse">⭐</div>
        <p className="text-xl font-bold">MIDAS</p>
        <p className="text-blue-200 text-sm mt-1">{t.loading}</p>
      </div>
    </div>
  );

  if (!user) return <Registration tgUser={tgUser} user={null} onDone={onRegDone}/>;

  const isAdmin = ADMIN_IDS.includes(user.telegram_id);

  const tabs = [
    {id:"match", icon:"🎯", label:t.match},
    {id:"offers", icon:"📨", label:lang==="uz"?"Takliflar":"Предлож."},
    {id:"chats", icon:"💬", label:t.chats},
    {id:"notifs", icon:"🔔", label:t.notifs, badge:notifCount},
    {id:"profile", icon:"👤", label:t.profile},
    ...(isAdmin ? [{id:"admin", icon:"🛡", label:t.admin}] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Page */}
      {tab==="match" && <MatchPage user={user} lang={lang}/>}
      {tab==="offers" && <OffersPage user={user} lang={lang}/>}
      {tab==="chats" && <ChatsPage user={user} lang={lang}/>}
      {tab==="notifs" && <NotifsPage user={user} lang={lang} onRead={()=>setNotifCount(0)}/>}
      {tab==="profile" && <ProfilePage user={user} lang={lang} onLangChange={async (l)=>{setLang(l);await api(`/api/users/${user.telegram_id}/lang?lang=${l}`,"PUT");}}/>}
      {tab==="admin" && isAdmin && <AdminPage user={user} lang={lang}/>}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
        {tabs.map(tb => (
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            className={`flex-1 py-2 flex flex-col items-center relative transition-all ${tab===tb.id?"text-blue-600":"text-gray-400"}`}>
            <span className="text-xl">{tb.icon}</span>
            <span className="text-xs mt-0.5">{tb.label}</span>
            {tb.badge>0 && <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{tb.badge}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
