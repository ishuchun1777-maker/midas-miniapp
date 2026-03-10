"""
MIDAS v5 — AI Maslahat Moduli
================================
Hozir: Shablon asosida professional maslahatlar
Keyinroq: Claude API / OpenAI ulanadi

Endpoint: POST /api/ai/advice
"""
import json, random
from datetime import datetime

# ── O'ZBEKISTON BOZORI STATISTIKASI (2024-2025) ──────────
MARKET_STATS = {
    "instagram": {
        "uz_users": "5.2 mln",
        "uz_users_ru": "5,2 млн",
        "avg_er": "3.8%",
        "best_time_uz": "20:00–22:00 (Toshkent vaqti)",
        "best_time_ru": "20:00–22:00 (по Ташкенту)",
        "avg_price_post_uz": "100 000 – 500 000 so'm",
        "avg_price_post_ru": "100 000 – 500 000 сум",
        "best_for": ["retail","restaurant","medical","recreation","education"],
    },
    "youtube": {
        "uz_users": "8.1 mln",
        "uz_users_ru": "8,1 млн",
        "avg_er": "5.2%",
        "best_time_uz": "19:00–23:00",
        "best_time_ru": "19:00–23:00",
        "avg_price_post_uz": "300 000 – 2 000 000 so'm",
        "avg_price_post_ru": "300 000 – 2 000 000 сум",
        "best_for": ["auto","construction","education","finance","travel"],
    },
    "tiktok": {
        "uz_users": "3.5 mln",
        "uz_users_ru": "3,5 млн",
        "avg_er": "6.5%",
        "best_time_uz": "18:00–24:00",
        "best_time_ru": "18:00–24:00",
        "avg_price_post_uz": "80 000 – 400 000 so'm",
        "avg_price_post_ru": "80 000 – 400 000 сум",
        "best_for": ["retail","restaurant","beverages","recreation","household"],
    },
    "telegram": {
        "uz_users": "12 mln",
        "uz_users_ru": "12 млн",
        "avg_er": "8.0%",
        "best_time_uz": "09:00–11:00 va 19:00–21:00",
        "best_time_ru": "09:00–11:00 и 19:00–21:00",
        "avg_price_post_uz": "50 000 – 300 000 so'm",
        "avg_price_post_ru": "50 000 – 300 000 сум",
        "best_for": ["finance","education","internet","construction","realestate"],
    },
    "billboard": {
        "avg_price_uz": "500 000 – 5 000 000 so'm / oy",
        "avg_price_ru": "500 000 – 5 000 000 сум / мес",
        "best_for": ["construction","realestate","auto","retail","restaurant"],
        "tip_uz": "Toshkentda Chilonzor, Yunusobod va Mirzo Ulug'bek tumanlari eng ko'p ko'riladi",
        "tip_ru": "В Ташкенте Чиланзар, Юнусабад и Мирзо Улугбек — самые просматриваемые места",
    },
}

# ── SOHA BO'YICHA TAVSIYALAR ─────────────────────────────
SECTOR_ADVICE = {
    "construction": {
        "uz": {
            "top_platforms": ["instagram","youtube","telegram"],
            "best_format": "Before/After video formatlar eng yaxshi ishlaydi",
            "target_audience": "25-45 yosh, erkaklar ko'proq, Toshkent va viloyat markazlari",
            "budget_tip": "Oylik byudjet: 500K–2M so'm optimal. YouTube uchun 1M+ tavsiya qilinadi",
            "trend": "2024-2025: 3D render va virtual tur ko'rsatuvlar eng ko'p engagement olmoqda",
            "avoid": "Statik rasm postitlar nisbatan kam qiziqish uyg'otadi",
        },
        "ru": {
            "top_platforms": ["instagram","youtube","telegram"],
            "best_format": "Форматы Before/After работают лучше всего",
            "target_audience": "25-45 лет, преимущественно мужчины, Ташкент и областные центры",
            "budget_tip": "Месячный бюджет: 500K–2M сум оптимально. Для YouTube рекомендуется 1M+",
            "trend": "2024-2025: 3D-рендеры и виртуальные туры получают наибольший охват",
            "avoid": "Статичные фото-посты вызывают относительно меньший интерес",
        }
    },
    "restaurant": {
        "uz": {
            "top_platforms": ["instagram","tiktok","telegram"],
            "best_format": "Taom pishirish jarayoni va mijozlar reaktsiyasi videolari viral bo'ladi",
            "target_audience": "18-35 yosh, barcha jinslar, shahar aholisi",
            "budget_tip": "Oylik byudjet: 300K–1M so'm. TikTok uchun 200-300K yetarli",
            "trend": "Food vlogging va 'day in kitchen' formatlar 40%+ yuqori ko'rilish oladi",
            "avoid": "Faqat menyu postlari yetarli emas — real hikoya ko'rsating",
        },
        "ru": {
            "top_platforms": ["instagram","tiktok","telegram"],
            "best_format": "Видео процесса приготовления и реакции клиентов становятся вирусными",
            "target_audience": "18-35 лет, все полы, городское население",
            "budget_tip": "Месячный бюджет: 300K–1M сум. Для TikTok достаточно 200-300K",
            "trend": "Food vlogging и форматы 'day in kitchen' получают 40%+ больше просмотров",
            "avoid": "Только посты меню недостаточно — показывайте реальную историю",
        }
    },
    "education": {
        "uz": {
            "top_platforms": ["telegram","instagram","youtube"],
            "best_format": "Bepul mini-darslar va muvaffaqiyat hikoyalari eng ko'p conversion beradi",
            "target_audience": "17-30 yosh, IT va til kurslari uchun 18-25 optimal",
            "budget_tip": "Telegram kanali eng tejamkor: 50-200K so'm/post, ROI yuqori",
            "trend": "O'quvchilar natijalarini ko'rsatish (certificate, salary growth) — eng kuchli argument",
            "avoid": "Faqat kurs narxini ko'rsatish — avval qiymat ko'rsating, keyin narx",
        },
        "ru": {
            "top_platforms": ["telegram","instagram","youtube"],
            "best_format": "Бесплатные мини-уроки и истории успеха дают наибольшую конверсию",
            "target_audience": "17-30 лет, для IT и языков 18-25 оптимально",
            "budget_tip": "Telegram — самый экономичный: 50-200K сум/пост, высокий ROI",
            "trend": "Показ результатов учеников (сертификаты, рост зарплаты) — самый сильный аргумент",
            "avoid": "Показывать только цену курса — сначала покажите ценность, потом цену",
        }
    },
    "retail": {
        "uz": {
            "top_platforms": ["instagram","tiktok","telegram"],
            "best_format": "Product review va unboxing videolar + chegirma eʼlonlari",
            "target_audience": "18-40 yosh, ayollar 60-70% (kiyim, kosmetika), erkaklar (elektronika, sport)",
            "budget_tip": "Oylik 500K-1.5M so'm. Mavsumiy aksiyalar oldidan 2x byudjet",
            "trend": "Live shopping formatlar O'zbekistonda o'sish bosqichida — erta kirib oling",
            "avoid": "Yolg'on chegirmalar va yangilanmagan narxlar — ishonchni yo'q qiladi",
        },
        "ru": {
            "top_platforms": ["instagram","tiktok","telegram"],
            "best_format": "Product review и unboxing видео + объявления о скидках",
            "target_audience": "18-40 лет, женщины 60-70% (одежда, косметика), мужчины (электроника, спорт)",
            "budget_tip": "Месячно 500K-1.5M сум. Перед сезонными акциями бюджет x2",
            "trend": "Live shopping в Узбекистане набирает обороты — входите раньше конкурентов",
            "avoid": "Фиктивные скидки и устаревшие цены — подрывают доверие",
        }
    },
    "finance": {
        "uz": {
            "top_platforms": ["telegram","youtube","instagram"],
            "best_format": "Foydali moliyaviy maslahatlar va real misollar — ekspert sifatida pozitsiyalaning",
            "target_audience": "25-50 yosh, daromadi o'rtadan yuqori, Toshkent",
            "budget_tip": "Telegram eng samarali: 100-500K so'm/post, yuqori ishonch auditoriyasi",
            "trend": "Moliyaviy savodxonlik kontent O'zbekistonda 300%+ o'sdi — demand katta",
            "avoid": "Faqat mahsulot reklama — avval ta'lim bering, ishonch qozonish kerak",
        },
        "ru": {
            "top_platforms": ["telegram","youtube","instagram"],
            "best_format": "Полезные финансовые советы и реальные примеры — позиционируйтесь как эксперт",
            "target_audience": "25-50 лет, доход выше среднего, Ташкент",
            "budget_tip": "Telegram наиболее эффективен: 100-500K сум/пост, высокодоверительная аудитория",
            "trend": "Контент по финансовой грамотности в Узбекистане вырос на 300%+ — спрос высок",
            "avoid": "Только реклама продукта — сначала обучайте, доверие нужно завоевать",
        }
    },
    "medical": {
        "uz": {
            "top_platforms": ["instagram","telegram","youtube"],
            "best_format": "Mutaxassis maslahat videolari va savol-javob sessiyalari",
            "target_audience": "25-55 yosh, ayollar ko'proq (kosmetologiya), erkaklar ham (stomatologiya)",
            "budget_tip": "Oylik 400K-1.2M so'm. Ishonch qurilguncha byudjet katta bo'lishi kerak",
            "trend": "Oldin-Keyin (before/after) natijalari va mijoz guvohnomasi eng kuchli kontent",
            "avoid": "Tibbiy da'volar va kafolatlar — qonuniy muammo tug'dirishi mumkin",
        },
        "ru": {
            "top_platforms": ["instagram","telegram","youtube"],
            "best_format": "Видео-консультации специалиста и Q&A-сессии",
            "target_audience": "25-55 лет, больше женщин (косметология), мужчины тоже (стоматология)",
            "budget_tip": "Месячно 400K-1.2M сум. До построения доверия бюджет должен быть значительным",
            "trend": "Результаты до/после и отзывы клиентов — самый сильный контент",
            "avoid": "Медицинские заявления и гарантии — могут создать юридические проблемы",
        }
    },
    "auto": {
        "uz": {
            "top_platforms": ["youtube","instagram","telegram"],
            "best_format": "Test-drive videolar, texnik tavsif, narx solishtirish",
            "target_audience": "25-50 yosh, erkaklar 80%+, shahar va qishloq",
            "budget_tip": "YouTube uchun 1M+ so'm tavsiya — video sifati muhim",
            "trend": "Elektromobillar va hybrid mavzulari O'zbekistonda keskin o'sib bormoqda",
            "avoid": "Past sifatli video — avtomobil sohasida vizual sifat juda muhim",
        },
        "ru": {
            "top_platforms": ["youtube","instagram","telegram"],
            "best_format": "Тест-драйв видео, технические описания, сравнение цен",
            "target_audience": "25-50 лет, мужчины 80%+, город и районы",
            "budget_tip": "Для YouTube рекомендуется 1M+ сум — качество видео важно",
            "trend": "Электромобили и гибриды в Узбекистане стремительно растут",
            "avoid": "Видео низкого качества — в автомобильной сфере визуальное качество критично",
        }
    },
    "default": {
        "uz": {
            "top_platforms": ["instagram","telegram","tiktok"],
            "best_format": "Qisqa video kontent (15-60 son) eng ko'p qamrov beradi",
            "target_audience": "Maqsadli auditoriyangizni aniq belgilang — bu samaradorlikni 3x oshiradi",
            "budget_tip": "Boshlang'ich oylik byudjet: 300K-500K so'm. Natijalarni ko'rib oshiring",
            "trend": "2025: Short-video formatlar barcha platformalarda dominant",
            "avoid": "Bir vaqtda barcha platformada bo'lishga urinmang — 1-2 platformada professional bo'ling",
        },
        "ru": {
            "top_platforms": ["instagram","telegram","tiktok"],
            "best_format": "Короткий видеоконтент (15-60 сек) даёт наибольший охват",
            "target_audience": "Чётко определите целевую аудиторию — это повышает эффективность в 3 раза",
            "budget_tip": "Начальный месячный бюджет: 300K-500K сум. Увеличивайте по результатам",
            "trend": "2025: Short-video форматы доминируют на всех платформах",
            "avoid": "Не пытайтесь присутствовать на всех платформах сразу — будьте профессиональны на 1-2",
        }
    }
}

# ── REKLAMACHI UCHUN TAVSIYALAR ──────────────────────────
REKLAMACHI_ADVICE = {
    "instagram": {
        "uz": {
            "growth_tips": [
                "Reels formatida post ko'rsatkichi 3-5x yuqori bo'ladi",
                "Hashtag: 5-10 ta maqsadli hashtag, 30 ta emas — algoritm spamni aniqlaydi",
                "Story pollari va savol qutilari engagement'ni 25%+ oshiradi",
                "Haftalik 3-5 ta post optimal — kamroq ham, ko'proq ham salbiy",
            ],
            "pricing_tip": "Sizning segmentingizda o'rtacha narx: post 100-500K, story 50-200K, reel 200-800K so'm",
            "profile_tips": "Bio-da aniq xizmat, narx oralig'i va aloqa — bu yuqori sifatli mijoz jalb qiladi",
        },
        "ru": {
            "growth_tips": [
                "В формате Reels охват в 3-5 раз выше",
                "Хэштеги: 5-10 целевых, не 30 — алгоритм определяет спам",
                "Опросы и вопросы в Stories повышают вовлечённость на 25%+",
                "Оптимально 3-5 постов в неделю — меньше и больше негативно",
            ],
            "pricing_tip": "Средняя цена в вашем сегменте: пост 100-500K, story 50-200K, reel 200-800K сум",
            "profile_tips": "В bio — чёткий сервис, ценовой диапазон и контакт — это привлекает качественных клиентов",
        }
    },
    "telegram": {
        "uz": {
            "growth_tips": [
                "Kross-promoushen (boshqa kanallar bilan almashinuv) eng tez o'sish usuli",
                "Exclusive kontent strategiyasi — faqat kanalingizda bo'ladigan materiallar",
                "Haftalik 7-14 ta post optimal Telegram uchun",
                "Bot integratsiyasi orqali mijozlarni avtomatik qayta jalb qiling",
            ],
            "pricing_tip": "Telegram post narxi: 50-300K so'm. Engagement yuqori bo'lgani uchun ROI Instagram'dan yuqori",
            "profile_tips": "Pinlangan post: kim siz, nima taklif qilasiz, qanday bog'lanish — bu sizning 'do'kon oynangiz'",
        },
        "ru": {
            "growth_tips": [
                "Кросс-промо (обмен с другими каналами) — самый быстрый способ роста",
                "Стратегия эксклюзивного контента — материалы только в вашем канале",
                "Для Telegram оптимально 7-14 постов в неделю",
                "Интеграция бота для автоматического повторного вовлечения клиентов",
            ],
            "pricing_tip": "Цена поста в Telegram: 50-300K сум. ROI выше Instagram из-за высокой вовлечённости",
            "profile_tips": "Закреплённый пост: кто вы, что предлагаете, как связаться — это ваша 'витрина'",
        }
    },
    "tiktok": {
        "uz": {
            "growth_tips": [
                "Dastlabki 3 soniya eng muhim — ko'ruvchi scroll qilishini to'xtatadigan hook kerak",
                "Trend audio va challenge'lardan foydalaning — organik reach 5-10x oshadi",
                "Har kuni 1-3 ta video optimal — TikTok algorimi faollikni qadrlaydi",
                "Duet va Stitch funksiyalari engagement'ni keskin oshiradi",
            ],
            "pricing_tip": "TikTok post narxi: 80-400K so'm. Viral bo'lish ehtimoli boshqa platformalarga qaraganda yuqori",
            "profile_tips": "Niche'ingizga qat'iy yoping — 'hamma uchun' akkaunt TikTok'da ishlamaydi",
        },
        "ru": {
            "growth_tips": [
                "Первые 3 секунды самые важные — нужен hook, чтобы зритель остановил скролл",
                "Используйте трендовые аудио и челленджи — органический охват вырастает в 5-10 раз",
                "Оптимально 1-3 видео в день — алгоритм TikTok ценит активность",
                "Функции Duet и Stitch резко повышают вовлечённость",
            ],
            "pricing_tip": "Цена поста TikTok: 80-400K сум. Вероятность стать вирусным выше, чем на других платформах",
            "profile_tips": "Строго придерживайтесь своей ниши — аккаунт 'для всех' не работает в TikTok",
        }
    },
    "billboard": {
        "uz": {
            "growth_tips": [
                "Joylashuv — hamma narsadan muhim. Chorrahalar va gavjum yo'llar 3x yuqori ko'rinish",
                "Dizayn: 3 soniyada tushunilishi kerak — matn minimal, rasm dominant",
                "Geografik targetlash: mahalliy bizneslar uchun 3-5 km radiusidagi billboard eng samarali",
                "Mavsumiy almashtirish: 4 ta mavsumga 4 ta dizayn — jonli ko'rinish",
            ],
            "pricing_tip": "Toshkentda billboard narxi: 500K–5M so'm/oy. Eng yaxshi joylashuv uchun 2-3M so'm sarflang",
            "profile_tips": "Bittadan ko'p billboard bir vaqtda oling — chegirma muzokarasi imkoniyati",
        },
        "ru": {
            "growth_tips": [
                "Расположение — важнее всего. Перекрёстки и загруженные дороги — видимость в 3 раза выше",
                "Дизайн: должен пониматься за 3 секунды — минимум текста, доминирует изображение",
                "Гео-таргетинг: для локального бизнеса Billboard в радиусе 3-5 км наиболее эффективен",
                "Сезонная смена: 4 дизайна на 4 сезона — живой внешний вид",
            ],
            "pricing_tip": "Цена Billboard в Ташкенте: 500K–5M сум/мес. На лучшие места выделяйте 2-3M сум",
            "profile_tips": "Берите несколько билбордов сразу — возможность торговаться на скидку",
        }
    },
}

# ── UMUMIY PREMIUM MASLAHATLAR ───────────────────────────
GENERAL_TIPS = {
    "tadbirkor": {
        "uz": [
            "🎯 Bitta kampaniya oldidan maqsadingizni ANIQ belgilang: ko'rishmi? Sotuvmi? Leads?",
            "📊 ROI ni hisoblang: agar 1M so'm sarf qilib 3M sotsa — 200% ROI bu yaxshi natija",
            "🔄 A/B test: ikki xil kreativ bilan boshlang, samaralisi bilan davom eting",
            "📅 Kamida 3 oylik kampaniya rejalashtiring — bir postdan natija kutmang",
            "🤝 Reklamachi bilan to'liq brief tayyorlang — noaniq vazifa = yomon natija",
            "💡 Raqobatchilar nimalar qilyapti? Tahlilidан boshlang",
            "📱 Mobil optimizatsiya: O'zbekistonda 85%+ internet foydalanuvchilari telefondan kiradi",
        ],
        "ru": [
            "🎯 Перед каждой кампанией чётко определите цель: охват? продажи? лиды?",
            "📊 Считайте ROI: если потратить 1M и получить 3M сум — 200% ROI это хороший результат",
            "🔄 A/B тест: начните с двух разных креативов, продолжайте с более эффективным",
            "📅 Планируйте кампанию минимум на 3 месяца — не ждите результата от одного поста",
            "🤝 Подготовьте полный бриф с рекламодателем — нечёткая задача = плохой результат",
            "💡 Что делают конкуренты? Начните с анализа",
            "📱 Мобильная оптимизация: в Узбекистане 85%+ пользователей заходят с телефона",
        ]
    },
    "reklamachi": {
        "uz": [
            "💼 Portfelingiz — eng kuchli savdo argumentingiz. Har kampaniyadan natija yozing",
            "📈 Engagement rate pasaysa — kontent strategiyasini o'zgartiring, auditoriyani emas",
            "🤝 Uzoq muddatli hamkorlik qidiring — bir martalik postdan ko'ra oylik kontrakt yaxshi",
            "💰 Narxingizni asoslang: followers + ER + auditoriya sifati — barchasi hisob-kitob asosida",
            "📊 Har kampaniya natijasini hujjatlashtiring — bu keyingi mijoz uchun 'taqdimot'",
            "🌟 Mutaxassislashgan niche toping — 'hammaga' reklama qiluvchi akkaunt qimmatroq emas",
            "⏰ Javob vaqti muhim: mijoz so'rov yuborganda 1 soat ichida javob bering",
        ],
        "ru": [
            "💼 Ваше портфолио — самый сильный аргумент продаж. Записывайте результаты каждой кампании",
            "📈 Если ER падает — меняйте контент-стратегию, а не аудиторию",
            "🤝 Ищите долгосрочное сотрудничество — месячный контракт лучше разового поста",
            "💰 Обосновывайте цену: followers + ER + качество аудитории — всё на основе расчётов",
            "📊 Документируйте результаты каждой кампании — это 'презентация' для следующего клиента",
            "🌟 Найдите специализированную нишу — аккаунт 'для всех' не стоит дороже",
            "⏰ Время ответа важно: отвечайте на запросы клиентов в течение 1 часа",
        ]
    }
}

# ── ASOSIY FUNKSIYA ──────────────────────────────────────
def generate_advice(user_data: dict, lang: str = "uz") -> dict:
    """
    Foydalanuvchiga professional maslahat generatsiya qilish.
    
    user_data: {
        role: "tadbirkor" | "reklamachi",
        sector: "restaurant" | ...,
        platform: "instagram" | ...,
        budget: int,
        followers: int,
        location: list,
        ...
    }
    """
    role     = user_data.get("role", "tadbirkor")
    sector   = user_data.get("sector", "default")
    platform = user_data.get("platform", "")
    budget   = user_data.get("budget", 0)
    followers= user_data.get("followers", 0)
    
    advice = {
        "role": role,
        "lang": lang,
        "sections": []
    }

    # 1. Platforma tavsiyasi (tadbirkor uchun)
    if role == "tadbirkor":
        sec_advice = SECTOR_ADVICE.get(sector, SECTOR_ADVICE["default"])[lang]
        
        # Top platformalar
        advice["sections"].append({
            "icon": "🎯",
            "title": "Sizga mos platformalar" if lang=="uz" else "Подходящие платформы",
            "content": _platform_recommendation(sec_advice["top_platforms"], lang),
            "highlight": True,
        })
        
        # Format tavsiyasi
        advice["sections"].append({
            "icon": "📹",
            "title": "Eng samarali format" if lang=="uz" else "Наиболее эффективный формат",
            "content": sec_advice["best_format"],
        })
        
        # Target auditoriya
        advice["sections"].append({
            "icon": "👥",
            "title": "Maqsadli auditoriya" if lang=="uz" else "Целевая аудитория",
            "content": sec_advice["target_audience"],
        })
        
        # Byudjet tavsiyasi
        budget_content = sec_advice["budget_tip"]
        if budget > 0:
            budget_content += "\n" + _budget_analysis(budget, sector, lang)
        advice["sections"].append({
            "icon": "💰",
            "title": "Byudjet strategiyasi" if lang=="uz" else "Стратегия бюджета",
            "content": budget_content,
        })
        
        # Trend
        advice["sections"].append({
            "icon": "📈",
            "title": "2025-yil trendlari" if lang=="uz" else "Тренды 2025 года",
            "content": sec_advice["trend"],
            "tag": "hot" if lang=="uz" else "горячо",
        })
        
        # Qochish kerak
        advice["sections"].append({
            "icon": "⚠️",
            "title": "Qochish kerak" if lang=="uz" else "Чего избегать",
            "content": sec_advice["avoid"],
            "type": "warning",
        })
        
        # Umumiy maslahatlar (random 3 ta)
        tips = GENERAL_TIPS["tadbirkor"][lang]
        selected = random.sample(tips, min(3, len(tips)))
        advice["sections"].append({
            "icon": "💡",
            "title": "Professional maslahatlar" if lang=="uz" else "Профессиональные советы",
            "content": "\n".join(selected),
            "type": "list",
        })

    # 2. Reklamachi uchun
    elif role == "reklamachi":
        rek_adv = REKLAMACHI_ADVICE.get(platform, REKLAMACHI_ADVICE.get("instagram", {})).get(lang, {})
        
        if rek_adv:
            # O'sish maslahatlari
            tips_text = "\n".join(rek_adv.get("growth_tips", []))
            advice["sections"].append({
                "icon": "🚀",
                "title": "O'sish strategiyasi" if lang=="uz" else "Стратегия роста",
                "content": tips_text,
                "type": "list",
            })
            
            # Narx tavsiyasi
            advice["sections"].append({
                "icon": "💰",
                "title": "Narx strategiyasi" if lang=="uz" else "Стратегия ценообразования",
                "content": rek_adv.get("pricing_tip", ""),
            })
            
            # Profil optimizatsiyasi
            advice["sections"].append({
                "icon": "✨",
                "title": "Profil optimizatsiyasi" if lang=="uz" else "Оптимизация профиля",
                "content": rek_adv.get("profile_tips", ""),
                "highlight": True,
            })
        
        # Platforma statistikasi
        plat_stat = MARKET_STATS.get(platform, {})
        if plat_stat:
            stat_lang = "uz" if lang=="uz" else "ru"
            users_key = f"uz_users{'_ru' if lang=='ru' else ''}"
            price_key = f"avg_price_post_{lang}"
            time_key  = f"best_time_{lang}"
            
            stat_content = ""
            if plat_stat.get(users_key): stat_content += f"👤 O'zbekistonda: {plat_stat[users_key]}\n" if lang=="uz" else f"👤 В Узбекистане: {plat_stat[users_key]}\n"
            if plat_stat.get("avg_er"):  stat_content += f"📊 O'rtacha ER: {plat_stat['avg_er']}\n" if lang=="uz" else f"📊 Средний ER: {plat_stat['avg_er']}\n"
            if plat_stat.get(price_key): stat_content += f"💰 O'rtacha narx: {plat_stat[price_key]}\n" if lang=="uz" else f"💰 Средняя цена: {plat_stat[price_key]}\n"
            if plat_stat.get(time_key):  stat_content += f"⏰ Eng yaxshi vaqt: {plat_stat[time_key]}" if lang=="uz" else f"⏰ Лучшее время: {plat_stat[time_key]}"
            
            if stat_content:
                advice["sections"].append({
                    "icon": "📊",
                    "title": "Bozor statistikasi" if lang=="uz" else "Статистика рынка",
                    "content": stat_content.strip(),
                    "type": "stats",
                })
        
        # Followers tahlili
        if followers > 0:
            advice["sections"].append({
                "icon": "📈",
                "title": "Sizning ko'rsatkichlaringiz" if lang=="uz" else "Ваши показатели",
                "content": _followers_analysis(followers, platform, lang),
            })
        
        # Umumiy maslahatlar
        tips = GENERAL_TIPS["reklamachi"][lang]
        selected = random.sample(tips, min(3, len(tips)))
        advice["sections"].append({
            "icon": "💡",
            "title": "Professional maslahatlar" if lang=="uz" else "Профессиональные советы",
            "content": "\n".join(selected),
            "type": "list",
        })

    advice["generated_at"] = datetime.now().isoformat()
    advice["is_premium"]   = False  # Keyinchalik premium uchun chuqurroq analiz
    return advice


def _platform_recommendation(platforms: list, lang: str) -> str:
    """Platforma tavsiyasini formatlash"""
    result = []
    for p in platforms[:3]:
        stat = MARKET_STATS.get(p, {})
        users_key = "uz_users" if lang=="uz" else "uz_users_ru"
        er = stat.get("avg_er","")
        users = stat.get(users_key,"")
        pf_name = p.capitalize()
        if lang == "uz":
            result.append(f"✅ {pf_name}" + (f" — {users} foydalanuvchi, ER {er}" if users else ""))
        else:
            result.append(f"✅ {pf_name}" + (f" — {users} пользователей, ER {er}" if users else ""))
    return "\n".join(result)


def _budget_analysis(budget: int, sector: str, lang: str) -> str:
    """Byudjet tahlili"""
    if lang == "uz":
        if budget < 300_000:
            return "⚠️ Byudjetingiz kam — 1-2 platformada konsentratsiya qiling, tarqatmang"
        elif budget < 1_000_000:
            return "✅ Bu byudjet bilan 1-2 platformada yaxshi natija olish mumkin"
        elif budget < 3_000_000:
            return "💪 Ajoyib! Bu byudjet bilan 2-3 platformada A/B test o'tkazing"
        else:
            return "🚀 Katta byudjet — professional agentlik yoki bir nechta reklamachi bilan ishlang"
    else:
        if budget < 300_000:
            return "⚠️ Бюджет мал — сосредоточьтесь на 1-2 платформах, не распыляйтесь"
        elif budget < 1_000_000:
            return "✅ С этим бюджетом можно получить хорошие результаты на 1-2 платформах"
        elif budget < 3_000_000:
            return "💪 Отлично! С этим бюджетом проводите A/B тесты на 2-3 платформах"
        else:
            return "🚀 Крупный бюджет — работайте с профессиональным агентством или несколькими рекламодателями"


def _followers_analysis(followers: int, platform: str, lang: str) -> str:
    """Followers tahlili"""
    if lang == "uz":
        if followers < 5000:
            return f"📌 {followers:,} obunachi — bu boshlang'ich daraja. Organik o'sishga e'tibor bering, sifatli kontent va regulyar posting kerak"
        elif followers < 50000:
            return f"📌 {followers:,} obunachi — mikro-influencer darajasi. Niche auditoriya uchun ROI yuqori bo'ladi"
        elif followers < 250000:
            return f"📌 {followers:,} obunachi — o'rta daraja influencer. Brandlar bilan uzoq muddatli hamkorlik imkoni bor"
        elif followers < 1000000:
            return f"📌 {followers:,} obunachi — makro-influencer. O'rtacha narx {followers//1000*2:,}–{followers//1000*5:,} so'm/post bo'lishi mumkin"
        else:
            return f"📌 {followers:,} obunachi — top influencer darajasi! Professional management va agentlik bilan ishlang"
    else:
        if followers < 5000:
            return f"📌 {followers:,} подписчиков — начальный уровень. Сосредоточьтесь на органическом росте, нужен качественный контент"
        elif followers < 50000:
            return f"📌 {followers:,} подписчиков — уровень микро-инфлюенсера. ROI для нишевой аудитории будет высоким"
        elif followers < 250000:
            return f"📌 {followers:,} подписчиков — средний уровень инфлюенсера. Возможны долгосрочные партнёрства с брендами"
        elif followers < 1000000:
            return f"📌 {followers:,} подписчиков — макро-инфлюенсер. Средняя цена может составить {followers//1000*2:,}–{followers//1000*5:,} сум/пост"
        else:
            return f"📌 {followers:,} подписчиков — уровень топ-инфлюенсера! Работайте с профессиональным управлением и агентством"


# ── FLASK ENDPOINT (main.py ga qo'shish uchun) ──────────
"""
# main.py ga qo'shing:



"""
