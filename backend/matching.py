"""
MIDAS - Matching algoritmi (alohida modul)
Har bir platforma turi uchun o'z mezoni
"""

# ==================== SEKTOR TUZILMASI ====================
SECTORS = {
    "qurilish": {
        "label": "🏗 Qurilish",
        "sub": [
            {"v": "yirik_qurilish", "l": "🏢 Yirik obyektlarni qurish"},
            {"v": "katta_tamir", "l": "🔨 Katta ta'mirlash ishlari"},
            {"v": "kichik_tamir", "l": "🪛 Kichik ta'mirlash xizmatlari"},
        ]
    },
    "kochmas_mulk": {
        "label": "🏠 Ko'chmas mulk",
        "sub": [
            {"v": "noturar_savdo", "l": "🏬 Noturar mulk savdosi"},
            {"v": "uy_savdo", "l": "🏡 Uy joy savdosi"},
            {"v": "noturar_ijara", "l": "🏢 Noturar mulk ijarasi"},
            {"v": "uy_ijara", "l": "🏘 Uy joy ijarasi"},
        ]
    },
    "qurilish_mollari": {
        "label": "🧱 Qurilish mollari",
        "sub": [
            {"v": "katta_qurilish_mol", "l": "🏗 Katta qurilishlar uchun"},
            {"v": "maxsus_mol", "l": "⚙️ Maxsus qurilish mollari"},
            {"v": "inter_mol", "l": "🎨 Interier uchun mollar"},
        ]
    },
    "ishlab_chiqarish": {
        "label": "🏭 Ishlab chiqarish",
        "sub": [
            {"v": "tadbirkor_uchun", "l": "💼 Tadbirkorlar uchun maxsus"},
            {"v": "aholi_uchun", "l": "👨‍👩‍👧 Aholi uchun"},
        ]
    },
    "oquv_markazi": {
        "label": "📚 O'quv markazi",
        "sub": [
            {"v": "til_orgatish", "l": "🌐 Til o'rgatish"},
            {"v": "maxsus_fan", "l": "🔬 Maxsus fan doirasida"},
            {"v": "hunar_orgatish", "l": "🛠 Hunar o'rgatish"},
        ]
    },
    "bank_lombard": {
        "label": "💰 Bank va lombard",
        "sub": [
            {"v": "kredit", "l": "💳 Kredit ajratish"},
            {"v": "omonat", "l": "📈 Omonat daromadi"},
            {"v": "otkazma", "l": "💸 Foydali o'tkazmalar"},
        ]
    },
    "avto": {
        "label": "🚗 Avto",
        "sub": [
            {"v": "avtosalon", "l": "🏪 Avtosalon"},
            {"v": "avto_savdo", "l": "🤝 Avto savdo"},
            {"v": "avtoservis", "l": "🔧 Avtoservis"},
            {"v": "avto_jihozlar", "l": "🔩 Avto jihozlar"},
            {"v": "avto_tuning", "l": "✨ Avto tuning"},
        ]
    },
    "restoran": {
        "label": "🍽 Restoran va kafe",
        "sub": [
            {"v": "toyxona", "l": "💒 To'yxona"},
            {"v": "restoran", "l": "🍴 Restoran"},
            {"v": "kafe", "l": "☕ Kafe"},
            {"v": "fastfood", "l": "🍔 Fastfood"},
            {"v": "247", "l": "🕐 24/7"},
        ]
    },
    "chakana_savdo": {
        "label": "🛒 Chakana savdo",
        "sub": [
            {"v": "oziq_ovqat", "l": "🥦 Oziq-ovqat"},
            {"v": "rozgor", "l": "🏠 Ro'zg'or buyumlari"},
            {"v": "avto_jihoz_savdo", "l": "🔧 Avto jihozlar"},
            {"v": "taqinchoq", "l": "💍 Taqinchoqlar"},
            {"v": "sovga", "l": "🎁 Sovg'alar"},
            {"v": "chipta", "l": "🎟 Chipta"},
        ]
    },
    "uy_rozgor": {
        "label": "🛋 Uy ro'zg'or buyumlari",
        "sub": [
            {"v": "mebel", "l": "🪑 Mebel"},
            {"v": "uy_jihozlari", "l": "🏮 Uy jihozlari"},
            {"v": "maishiy_tex", "l": "📺 Maishiy texnika"},
            {"v": "idish", "l": "🍽 Idish-tovoq"},
        ]
    },
    "ichimlik": {
        "label": "🥤 Ichimliklar savdosi",
        "sub": [
            {"v": "gazli", "l": "🫧 Gazli ichimliklar"},
            {"v": "tabiiy", "l": "🌿 Tabiiy ichimliklar"},
            {"v": "energetik", "l": "⚡ Energetiklar"},
            {"v": "spirtli", "l": "🍷 Spirtli ichimliklar"},
        ]
    },
    "tibbiyot": {
        "label": "💊 Tibbiyot",
        "sub": [
            {"v": "klinika", "l": "🏥 Klinika"},
            {"v": "farmatsevtika", "l": "💊 Farmatsevtika"},
            {"v": "maxsus_buyum", "l": "🩺 Maxsus buyumlar"},
        ]
    },
    "internet": {
        "label": "🌐 Internet xizmatlari",
        "sub": [
            {"v": "marketing", "l": "📣 Marketing xizmatlari"},
            {"v": "tolov", "l": "💳 To'lov tizimlari"},
            {"v": "grafik", "l": "🎨 Grafik xizmatlar"},
            {"v": "dasturchilik", "l": "💻 Dasturchilik xizmatlari"},
        ]
    },
    "sayohat": {
        "label": "✈️ Sayohat (Avia)",
        "sub": [
            {"v": "tur_paket", "l": "🌍 Tur paket"},
            {"v": "avia_chipta", "l": "✈️ Avia chipta"},
            {"v": "viza", "l": "📋 Viza xizmatlari"},
        ]
    },
    "dam_olish": {
        "label": "🏖 Dam olish",
        "sub": [
            {"v": "sanatoriya", "l": "🏨 Sanatoriya"},
            {"v": "istirohat", "l": "🌳 Istirohat bog'i"},
            {"v": "yozgi", "l": "☀️ Yozgi dam olish"},
        ]
    },
}

# ==================== PLATFORMALAR ====================
PLATFORMS_ONLINE = [
    {"v": "instagram", "l": "📸 Instagram"},
    {"v": "youtube", "l": "🎥 YouTube"},
    {"v": "tiktok", "l": "🎵 TikTok"},
    {"v": "telegram_channel", "l": "📢 Telegram kanal"},
    {"v": "telegram_bot", "l": "🤖 Telegram bot"},
    {"v": "mobile_app", "l": "📱 Mobile ilova"},
]
PLATFORMS_OFFLINE = [
    {"v": "maslahat", "l": "💬 Suhbatlarda maslahat"},
    {"v": "billboard", "l": "🪧 Billboard"},
    {"v": "led_monitor", "l": "💡 LED Monitor"},
]
PLATFORMS_ALL = PLATFORMS_ONLINE + PLATFORMS_OFFLINE

# ==================== QIZIQISHLAR (sohaga qarab) ====================
SECTOR_INTERESTS = {
    "qurilish":         ["🏗 Qurilish","🔨 Ta'mirlash","🏠 Uy dizayni","⚙️ Texnika","💰 Investitsiya","🏢 Biznes"],
    "kochmas_mulk":     ["🏠 Ko'chmas mulk","💰 Investitsiya","🏢 Biznes","🏡 Oilaviy turmush","📈 Moliya"],
    "qurilish_mollari": ["🏗 Qurilish","🎨 Dizayn","⚙️ Texnika","🏠 Uy dizayni","💼 Tadbirkorlik"],
    "ishlab_chiqarish": ["🏭 Ishlab chiqarish","💼 Tadbirkorlik","⚙️ Texnika","📦 Logistika","💰 Investitsiya"],
    "oquv_markazi":     ["📚 Ta'lim","🌐 Til o'rganish","💻 IT","🔬 Fan","🎯 Kasbiy o'sish","👨‍🎓 Yoshlar"],
    "bank_lombard":     ["💰 Moliya","📈 Investitsiya","💳 Kredit","🏢 Biznes","💼 Tadbirkorlik"],
    "avto":             ["🚗 Avto","⚙️ Texnika","🏎 Sport","💰 Investitsiya","👨 Erkaklar"],
    "restoran":         ["🍽 Oziq-ovqat","☕ Kafe","🎉 Dam olish","👨‍👩‍👧 Oila","🍰 Shirinlik"],
    "chakana_savdo":    ["🛒 Xarid","💄 Go'zallik","👗 Moda","🎁 Sovg'a","🏠 Uy"],
    "uy_rozgor":        ["🏠 Uy dizayni","🪑 Mebel","🏡 Oilaviy turmush","🎨 Dizayn","👨‍👩‍👧 Oila"],
    "ichimlik":         ["🥤 Ichimlik","🎉 Dam olish","⚡ Energiya","🌿 Sog'lom turmush","🎵 Musiqa"],
    "tibbiyot":         ["💊 Salomatlik","🏥 Tibbiyot","🌿 Sog'lom turmush","👨‍👩‍👧 Oila","🧘 Sport"],
    "internet":         ["💻 IT","📱 Texnologiya","📣 Marketing","🎨 Dizayn","💼 Tadbirkorlik"],
    "sayohat":          ["✈️ Sayohat","🌍 Dunyo","📸 Foto","🎉 Dam olish","🏖 Kurort"],
    "dam_olish":        ["🏖 Dam olish","🌿 Tabiat","👨‍👩‍👧 Oila","⚽ Sport","🎉 Bayram"],
    "default":          ["💼 Tadbirkorlik","📱 Texnologiya","🎉 Dam olish","👨‍👩‍👧 Oila",
                         "💰 Moliya","🌿 Sog'lom turmush","🎵 Musiqa","✈️ Sayohat",
                         "⚽ Sport","📚 Ta'lim","🍽 Oziq-ovqat","🚗 Avto"],
}

# ==================== YOSH GURUHLARI ====================
AGE_OPTIONS = [
    {"v": "under_18", "l": "👦 18 yoshdan kichik"},
    {"v": "18_25",    "l": "🧑 18–25"},
    {"v": "25_35",    "l": "👨 25–35"},
    {"v": "35_45",    "l": "👔 35–45"},
    {"v": "45_55",    "l": "🧓 45–55"},
    {"v": "over_55",  "l": "👴 55+"},
]

# ==================== HUDUDLAR ====================
LOCATIONS = [
    {"v": "tashkent_city",   "l": "🏙 Toshkent shahri"},
    {"v": "tashkent_region", "l": "🌆 Toshkent viloyati"},
    {"v": "samarqand",       "l": "🏛 Samarqand"},
    {"v": "buxoro",          "l": "🕌 Buxoro"},
    {"v": "fergana",         "l": "🌸 Farg'ona"},
    {"v": "andijan",         "l": "🌿 Andijon"},
    {"v": "namangan",        "l": "🍇 Namangan"},
    {"v": "kashkadarya",     "l": "🏔 Qashqadaryo"},
    {"v": "surkhandarya",    "l": "☀️ Surxondaryo"},
    {"v": "khorezm",         "l": "🏺 Xorazm"},
    {"v": "jizzakh",         "l": "🌾 Jizzax"},
    {"v": "navoi",           "l": "⛏ Navoiy"},
    {"v": "syrdarya",        "l": "💧 Sirdaryo"},
    {"v": "karakalpakstan",  "l": "🐪 Qoraqalpog'iston"},
    {"v": "all",             "l": "🇺🇿 Butun O'zbekiston"},
]

# ==================== MATCHING ALGORITMI ====================

def calc_score(target: dict, rek: dict) -> int:
    """
    Universal matching algoritmi.
    target: tadbirkor talablari
    rek: reklamachi profili
    """
    score = 0

    # 1. Platforma mosligi (25 ball)
    target_platforms = target.get("preferred_platforms", [])
    rek_platform = rek.get("platform", "")
    if not target_platforms or rek_platform in target_platforms:
        score += 25
    elif rek_platform in ["instagram", "youtube", "tiktok"]:
        score += 15

    # 2. Hudud mosligi (20 ball)
    target_locs = target.get("location", [])
    if isinstance(target_locs, str):
        target_locs = [target_locs]
    rek_loc = rek.get("audience_location", "all")
    if not target_locs or "all" in target_locs or rek_loc in target_locs:
        score += 20
    elif rek_loc == "all":
        score += 14
    else:
        score += 4

    # 3. Yosh mosligi (15 ball)
    ta = set(target.get("ages", []))
    ra = set(rek.get("audience_ages", []))
    if ta and ra:
        c = ta & ra
        score += int(15 * len(c) / len(ta)) if c else 0
    elif not ta:
        score += 10

    # 4. Jins mosligi (10 ball)
    tg = target.get("target_gender", "all")
    rg = rek.get("audience_gender", "all")
    if tg == "all" or tg == rg:
        score += 10
    elif rg == "all":
        score += 6

    # 5. Qiziqishlar mosligi (15 ball)
    ti = set(target.get("interests", []))
    ri = set(rek.get("interests", []))
    if ti and ri:
        c = ti & ri
        score += int(15 * len(c) / len(ti)) if c else 0
    elif not ti:
        score += 8

    # 6. Obunachi soni (10 ball)
    f = rek.get("followers", 0)
    min_f = target.get("min_followers", 0)
    if min_f == 0 or f >= min_f:
        score += 10
    elif f >= min_f * 0.7:
        score += 6
    elif f >= min_f * 0.5:
        score += 3

    # 7. Reyting bonusi (5 ball)
    r = rek.get("rating", 5.0)
    if r >= 4.8:
        score += 5
    elif r >= 4.5:
        score += 3
    elif r >= 4.0:
        score += 1

    return min(int(score), 100)


def calc_offline_score(target: dict, rek: dict) -> int:
    """
    Offline reklamachilar (Billboard, LED, Maslahat) uchun matching
    Asosan hudud asosida
    """
    score = 0

    # Hudud (60 ball) — offline uchun eng muhim
    target_locs = target.get("location", [])
    if isinstance(target_locs, str):
        target_locs = [target_locs]
    rek_loc = rek.get("audience_location", "all")
    if not target_locs or "all" in target_locs or rek_loc in target_locs:
        score += 60
    elif rek_loc == "all":
        score += 40

    # Reyting (20 ball)
    r = rek.get("rating", 5.0)
    score += int(20 * r / 5.0)

    # Narx mosligi (20 ball)
    budget = target.get("max_budget", 0)
    price = rek.get("price_post", 0)
    if budget == 0 or price <= budget:
        score += 20
    elif price <= budget * 1.3:
        score += 12
    elif price <= budget * 1.5:
        score += 6

    return min(int(score), 100)
