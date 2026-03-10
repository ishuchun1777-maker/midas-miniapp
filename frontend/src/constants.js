export const SECTORS = [
  { v:"qurilish", l:"🏗 Qurilish", sub:[
    {v:"yirik_qurilish",l:"🏢 Yirik obyektlarni qurish"},
    {v:"katta_tamir",l:"🔨 Katta ta'mirlash ishlari"},
    {v:"kichik_tamir",l:"🪛 Kichik ta'mirlash xizmatlari"},
  ]},
  { v:"kochmas_mulk", l:"🏠 Ko'chmas mulk", sub:[
    {v:"noturar_savdo",l:"🏬 Noturar mulk savdosi"},
    {v:"uy_savdo",l:"🏡 Uy joy savdosi"},
    {v:"noturar_ijara",l:"🏢 Noturar mulk ijarasi"},
    {v:"uy_ijara",l:"🏘 Uy joy ijarasi"},
  ]},
  { v:"qurilish_mollari", l:"🧱 Qurilish mollari", sub:[
    {v:"katta_qurilish_mol",l:"🏗 Katta qurilishlar uchun"},
    {v:"maxsus_mol",l:"⚙️ Maxsus qurilish mollari"},
    {v:"inter_mol",l:"🎨 Interier uchun mollar"},
  ]},
  { v:"ishlab_chiqarish", l:"🏭 Ishlab chiqarish", sub:[
    {v:"tadbirkor_uchun",l:"💼 Tadbirkorlar uchun maxsus"},
    {v:"aholi_uchun",l:"👨‍👩‍👧 Aholi uchun"},
  ]},
  { v:"oquv_markazi", l:"📚 O'quv markazi", sub:[
    {v:"til_orgatish",l:"🌐 Til o'rgatish"},
    {v:"maxsus_fan",l:"🔬 Maxsus fan doirasida"},
    {v:"hunar_orgatish",l:"🛠 Hunar o'rgatish"},
  ]},
  { v:"bank_lombard", l:"💰 Bank va lombard", sub:[
    {v:"kredit",l:"💳 Kredit ajratish"},
    {v:"omonat",l:"📈 Omonat daromadi"},
    {v:"otkazma",l:"💸 Foydali o'tkazmalar"},
  ]},
  { v:"avto", l:"🚗 Avto", sub:[
    {v:"avtosalon",l:"🏪 Avtosalon"},
    {v:"avto_savdo",l:"🤝 Avto savdo"},
    {v:"avtoservis",l:"🔧 Avtoservis"},
    {v:"avto_jihozlar",l:"🔩 Avto jihozlar"},
    {v:"avto_tuning",l:"✨ Avto tuning"},
  ]},
  { v:"restoran", l:"🍽 Restoran va kafe", sub:[
    {v:"toyxona",l:"💒 To'yxona"},
    {v:"restoran",l:"🍴 Restoran"},
    {v:"kafe",l:"☕ Kafe"},
    {v:"fastfood",l:"🍔 Fastfood"},
    {v:"247",l:"🕐 24/7"},
  ]},
  { v:"chakana_savdo", l:"🛒 Chakana savdo", sub:[
    {v:"oziq_ovqat",l:"🥦 Oziq-ovqat"},
    {v:"rozgor",l:"🏠 Ro'zg'or buyumlari"},
    {v:"taqinchoq",l:"💍 Taqinchoqlar"},
    {v:"sovga",l:"🎁 Sovg'alar"},
    {v:"chipta",l:"🎟 Chipta"},
  ]},
  { v:"uy_rozgor", l:"🛋 Uy ro'zg'or buyumlari", sub:[
    {v:"mebel",l:"🪑 Mebel"},
    {v:"uy_jihozlari",l:"🏮 Uy jihozlari"},
    {v:"maishiy_tex",l:"📺 Maishiy texnika"},
    {v:"idish",l:"🍽 Idish-tovoq"},
  ]},
  { v:"ichimlik", l:"🥤 Ichimliklar savdosi", sub:[
    {v:"gazli",l:"🫧 Gazli ichimliklar"},
    {v:"tabiiy",l:"🌿 Tabiiy ichimliklar"},
    {v:"energetik",l:"⚡ Energetiklar"},
    {v:"spirtli",l:"🍷 Spirtli ichimliklar"},
  ]},
  { v:"tibbiyot", l:"💊 Tibbiyot", sub:[
    {v:"klinika",l:"🏥 Klinika"},
    {v:"farmatsevtika",l:"💊 Farmatsevtika"},
    {v:"maxsus_buyum",l:"🩺 Maxsus buyumlar"},
  ]},
  { v:"internet", l:"🌐 Internet xizmatlari", sub:[
    {v:"marketing",l:"📣 Marketing xizmatlari"},
    {v:"tolov",l:"💳 To'lov tizimlari"},
    {v:"grafik",l:"🎨 Grafik xizmatlar"},
    {v:"dasturchilik",l:"💻 Dasturchilik xizmatlari"},
  ]},
  { v:"sayohat", l:"✈️ Sayohat (Avia)", sub:[
    {v:"tur_paket",l:"🌍 Tur paket"},
    {v:"avia_chipta",l:"✈️ Avia chipta"},
    {v:"viza",l:"📋 Viza xizmatlari"},
  ]},
  { v:"dam_olish", l:"🏖 Dam olish", sub:[
    {v:"sanatoriya",l:"🏨 Sanatoriya"},
    {v:"istirohat",l:"🌳 Istirohat bog'i"},
    {v:"yozgi",l:"☀️ Yozgi dam olish"},
  ]},
];
export const PLATFORMS_ONLINE=[{v:"instagram",l:"📸 Instagram"},{v:"youtube",l:"🎥 YouTube"},{v:"tiktok",l:"🎵 TikTok"},{v:"telegram_channel",l:"📢 Telegram kanal"},{v:"telegram_bot",l:"🤖 Telegram bot"},{v:"mobile_app",l:"📱 Mobile ilova"}];
export const PLATFORMS_OFFLINE=[{v:"maslahat",l:"💬 Suhbatlarda maslahat"},{v:"billboard",l:"🪧 Billboard"},{v:"led_monitor",l:"💡 LED Monitor"}];
export const PLATFORMS_ALL=[...PLATFORMS_ONLINE,...PLATFORMS_OFFLINE];
export const MATCH_PLATFORMS=[...PLATFORMS_ONLINE,...PLATFORMS_OFFLINE,{v:"midas",l:"⭐ MIDAS (barcha)"}];
export const AGE_OPTIONS=[{v:"under_18",l:"👦 18 yoshdan kichik"},{v:"18_25",l:"🧑 18–25"},{v:"25_35",l:"👨 25–35"},{v:"35_45",l:"👔 35–45"},{v:"45_55",l:"🧓 45–55"},{v:"over_55",l:"👴 55+"}];
export const LOCATIONS=[{v:"tashkent_city",l:"🏙 Toshkent shahri"},{v:"tashkent_region",l:"🌆 Toshkent viloyati"},{v:"samarqand",l:"🏛 Samarqand"},{v:"buxoro",l:"🕌 Buxoro"},{v:"fergana",l:"🌸 Farg'ona"},{v:"andijan",l:"🌿 Andijon"},{v:"namangan",l:"🍇 Namangan"},{v:"kashkadarya",l:"🏔 Qashqadaryo"},{v:"surkhandarya",l:"☀️ Surxondaryo"},{v:"khorezm",l:"🏺 Xorazm"},{v:"jizzakh",l:"🌾 Jizzax"},{v:"navoi",l:"⛏ Navoiy"},{v:"syrdarya",l:"💧 Sirdaryo"},{v:"karakalpakstan",l:"🐪 Qoraqalpog'iston"},{v:"all",l:"🇺🇿 Butun O'zbekiston"}];
export const SECTOR_INTERESTS={qurilish:["🏗 Qurilish","🔨 Ta'mirlash","🏠 Uy dizayni","⚙️ Texnika","💰 Investitsiya","🏢 Biznes"],kochmas_mulk:["🏠 Ko'chmas mulk","💰 Investitsiya","🏢 Biznes","🏡 Oilaviy turmush","📈 Moliya"],qurilish_mollari:["🏗 Qurilish","🎨 Dizayn","⚙️ Texnika","🏠 Uy dizayni","💼 Tadbirkorlik"],ishlab_chiqarish:["🏭 Ishlab chiqarish","💼 Tadbirkorlik","⚙️ Texnika","📦 Logistika","💰 Investitsiya"],oquv_markazi:["📚 Ta'lim","🌐 Til o'rganish","💻 IT","🔬 Fan","🎯 Kasbiy o'sish","👨‍🎓 Yoshlar"],bank_lombard:["💰 Moliya","📈 Investitsiya","💳 Kredit","🏢 Biznes","💼 Tadbirkorlik"],avto:["🚗 Avto","⚙️ Texnika","🏎 Sport","💰 Investitsiya","👨 Erkaklar"],restoran:["🍽 Oziq-ovqat","☕ Kafe","🎉 Dam olish","👨‍👩‍👧 Oila","🍰 Shirinlik"],chakana_savdo:["🛒 Xarid","💄 Go'zallik","👗 Moda","🎁 Sovg'a","🏠 Uy"],uy_rozgor:["🏠 Uy dizayni","🪑 Mebel","🏡 Oilaviy turmush","🎨 Dizayn","👨‍👩‍👧 Oila"],ichimlik:["🥤 Ichimlik","🎉 Dam olish","⚡ Energiya","🌿 Sog'lom turmush","🎵 Musiqa"],tibbiyot:["💊 Salomatlik","🏥 Tibbiyot","🌿 Sog'lom turmush","👨‍👩‍👧 Oila","🧘 Sport"],internet:["💻 IT","📱 Texnologiya","📣 Marketing","🎨 Dizayn","💼 Tadbirkorlik"],sayohat:["✈️ Sayohat","🌍 Dunyo","📸 Foto","🎉 Dam olish","🏖 Kurort"],dam_olish:["🏖 Dam olish","🌿 Tabiat","👨‍👩‍👧 Oila","⚽ Sport","🎉 Bayram"],default:["💼 Tadbirkorlik","📱 Texnologiya","🎉 Dam olish","👨‍👩‍👧 Oila","💰 Moliya","🌿 Sog'lom turmush","🎵 Musiqa","✈️ Sayohat","⚽ Sport","📚 Ta'lim","🍽 Oziq-ovqat","🚗 Avto"]};
export const PHONE_REGEX=/^\+998[0-9]{9}$/;
