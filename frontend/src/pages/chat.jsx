// ═══════════════════════════════════════════════════════
// MIDAS V8 — CHAT · BILDIRISHNOMALAR
// Faqat matn (bot hint), rasm/video bot orqali
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, Btn, Inp, Modal, Badge, PageWrap, PageTitle, Empty, Spinner, Divider } from "../core";
import { http, fmtNum, L } from "../core";

const tg = window.Telegram?.WebApp;

// ── BILDIRISHNOMALAR + TAKLIFLAR SAHIFASI ─────────────
export function NotifOffersPage({ user, lang }) {
  const uz = lang !== "ru";
  const [tab,    setTab]    = useState("notifs");
  const [notifs, setNotifs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoad]  = useState(true);
  const [rateM,  setRateM]  = useState(null);
  const [rating, setRating] = useState(5);
  const [rtags,  setRTags]  = useState([]);
  const [rtext,  setRText]  = useState("");
  const [rating_loading, setRL] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoad(true);
      try {
        const [n, o] = await Promise.all([
          http(`/api/notifications/${user.telegram_id}`).catch(() => []),
          http(`/api/offers/${user.telegram_id}`).catch(() => []),
        ]);
        setNotifs(Array.isArray(n) ? n : []);
        setOffers(Array.isArray(o) ? o : []);
      } finally { setLoad(false); }
    };
    load();
  }, [user]);

  const markRead = async (id) => {
    await http(`/api/notifications/${id}/read`, "PUT").catch(() => {});
    setNotifs(n => n.map(x => x.id === id ? {...x, is_read: 1} : x));
  };

  const respondOffer = async (offerId, action) => {
    await http(`/api/offers/${offerId}/${action}`, "POST", { user_id: user.telegram_id }).catch(() => {});
    setOffers(o => o.map(x => x.id === offerId ? {...x, status: action === "accept" ? "accepted" : "rejected"} : x));
    if (action === "accept") {
      tg?.showPopup?.({ title: "✅", message: uz ? "Taklif qabul qilindi! Chat ochildi." : "Предложение принято! Чат открыт." });
    }
  };

  const submitRating = async () => {
    if (!rateM) return;
    setRL(true);
    await http(`/api/ratings`, "POST", {
      from_id: user.telegram_id, to_id: rateM.from_id,
      rating, review_text: rtext, tags: rtags,
    }).catch(() => {});
    setRateM(null); setRL(false);
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const pendingOffers = offers.filter(o => o.status === "pending").length;

  const POSITIVE_TAGS = uz
    ? ["O'z vaqtida", "Professional", "Sifatli", "Ijodiy", "Tavsiya qilaman", "Narxi qulay"]
    : ["Вовремя", "Профессионал", "Качественно", "Творчески", "Рекомендую", "Доступная цена"];

  return (
    <PageWrap>
      <PageTitle icon="🔔" title={uz ? "Xabarlar" : "Уведомления"} />

      {/* Tab */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 4 }}>
        {[
          ["notifs", uz ? "🔔 Bildirishnomalar" : "🔔 Уведомления", unreadCount],
          ["offers",  uz ? "📩 Takliflar"        : "📩 Предложения",  pendingOffers],
        ].map(([v, l, cnt]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "none",
            background: tab === v ? "linear-gradient(135deg,#8B6914,#D4AF37)" : "transparent",
            color: tab === v ? "#0A0D14" : "#616161", cursor: "pointer", fontFamily: "inherit",
            position: "relative",
          }}>
            {l}
            {cnt > 0 && (
              <span style={{ marginLeft: 4, background: "#EF4444", color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontWeight: 900 }}>{cnt}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {/* Bildirishnomalar */}
      {!loading && tab === "notifs" && (
        <>
          {notifs.length === 0 && <Empty icon="🔔" text={uz ? "Bildirishnomalar yo'q" : "Уведомлений нет"} />}
          {notifs.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{
              background: n.is_read ? "rgba(255,255,255,0.02)" : "linear-gradient(135deg,rgba(212,175,55,0.08),rgba(27,94,64,0.05))",
              border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : "rgba(212,175,55,0.2)"}`,
              borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: "pointer",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>
                  {n.type === "offer"    ? "📩" : n.type === "match" ? "🎯"
                  : n.type === "message" ? "💬" : n.type === "deal"  ? "🤝"
                  : n.type === "review"  ? "⭐" : "🔔"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: n.is_read ? "#9E9E9E" : "#E8E8E8", fontSize: 13, marginBottom: 3 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#616161", lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: "#616161", marginTop: 5 }}>
                    {n.created_at?.slice(0, 16)?.replace("T", " ")}
                  </div>
                </div>
                {!n.is_read && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37", flexShrink: 0, marginTop: 4, boxShadow: "0 0 6px rgba(212,175,55,0.5)" }} />
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Takliflar */}
      {!loading && tab === "offers" && (
        <>
          {offers.length === 0 && <Empty icon="📭" text={uz ? "Takliflar yo'q" : "Предложений нет"} />}
          {offers.map(o => (
            <Card key={o.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#D4AF37", fontSize: 15 }}>{o.from_name}</div>
                  <div style={{ fontSize: 11, color: "#616161", marginTop: 2 }}>{o.created_at?.slice(0,16)?.replace("T"," ")}</div>
                </div>
                <Badge v={o.status === "pending" ? "gold" : o.status === "accepted" ? "success" : "danger"}>
                  {o.status === "pending" ? "⏳" : o.status === "accepted" ? "✅" : "❌"} {o.status}
                </Badge>
              </div>

              <p style={{ fontSize: 13, color: "#9E9E9E", margin: "0 0 12px", lineHeight: 1.6 }}>{o.message}</p>

              {o.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => respondOffer(o.id, "accept")} v="emerald" sz="sm" full>
                    ✓ {uz ? "Qabul qilish" : "Принять"}
                  </Btn>
                  <Btn onClick={() => respondOffer(o.id, "reject")} v="danger" sz="sm">
                    ✗ {uz ? "Rad" : "Отклонить"}
                  </Btn>
                </div>
              )}

              {o.status === "accepted" && (
                <Btn onClick={() => setRateM(o)} v="ghost" sz="sm">
                  ⭐ {uz ? "Baholash" : "Оценить"}
                </Btn>
              )}
            </Card>
          ))}
        </>
      )}

      {/* REYTING MODAL */}
      {rateM && (
        <Modal title={uz ? "⭐ Hamkorni baholash" : "⭐ Оценить партнёра"} onClose={() => setRateM(null)}>
          <div style={{ fontWeight: 700, color: "#E8E8E8", marginBottom: 16 }}>{rateM.from_name}</div>

          {/* Yulduzlar */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer", lineHeight: 1, filter: s <= rating ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.15s" }}>⭐</button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 28, color: "#D4AF37" }}>{rating}</div>
            <div style={{ fontSize: 12, color: "#9E9E9E" }}>
              {[uz?"Juda yomon":"Очень плохо",uz?"Yomon":"Плохо",uz?"O'rta":"Средне",uz?"Yaxshi":"Хорошо",uz?"A'lo":"Отлично"][rating-1]}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8, fontWeight: 600 }}>{uz ? "Teglar (ixtiyoriy)" : "Теги (необязательно)"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {POSITIVE_TAGS.map(t => (
                <button key={t} onClick={() => setRTags(x => x.includes(t) ? x.filter(y => y !== t) : [...x, t])}
                  style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    border: `1.5px solid ${rtags.includes(t) ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                    background: rtags.includes(t) ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
                    color: rtags.includes(t) ? "#D4AF37" : "#9E9E9E", cursor: "pointer", fontFamily: "inherit" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Inp value={rtext} onChange={setRText} rows={3} ph={uz ? "Qo'shimcha izoh (ixtiyoriy)..." : "Дополнительный комментарий..."} />
          <Btn onClick={submitRating} disabled={rating_loading} full sz="lg" v="gold">
            {rating_loading ? "⏳" : (uz ? "⭐ Baholash" : "⭐ Оценить")}
          </Btn>
        </Modal>
      )}
    </PageWrap>
  );
}

// ── CHATLAR RO'YXATI ───────────────────────────────────
export function ChatsPage({ user, lang }) {
  const uz = lang !== "ru";
  const [chats,   setChats]  = useState([]);
  const [loading, setLoad]   = useState(true);
  const [selChat, setSelChat] = useState(null);

  useEffect(() => {
    http(`/api/chats/${user.telegram_id}`)
      .then(r => setChats(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [user]);

  if (selChat) return (
    <ChatRoom user={user} lang={lang} chat={selChat} onBack={() => setSelChat(null)} />
  );

  return (
    <PageWrap>
      <PageTitle icon="💬" title={uz ? "Chatlar" : "Чаты"} sub={uz ? "Hamkorlaringiz bilan muloqot" : "Общение с партнёрами"} />

      {/* Bot xabari */}
      <div style={{ background: "linear-gradient(135deg,rgba(27,94,64,0.25),rgba(45,134,83,0.15))", border: "1.5px solid rgba(45,134,83,0.4)", borderRadius: 16, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
        <div>
          <div style={{ fontWeight: 700, color: "#4CAF50", fontSize: 12, marginBottom: 4 }}>
            {uz ? "Rasm, video, audio, fayl yuborish:" : "Отправка фото, видео, аудио, файлов:"}
          </div>
          <div style={{ fontSize: 11, color: "#9E9E9E", lineHeight: 1.6, marginBottom: 8 }}>
            {uz
              ? "Media fayllarni MIDAS Bot orqali yuboring. Bot sizning chatlaringizni ko'radi va avtomatik yo'naltiradi."
              : "Медиафайлы отправляйте через MIDAS Bot. Бот видит ваши чаты и перенаправляет автоматически."}
          </div>
          <button
            onClick={() => window.open("https://t.me/midas_bot", "_blank")}
            style={{ background: "linear-gradient(135deg,rgba(27,94,64,0.5),rgba(45,134,83,0.3))", border: "1px solid rgba(45,134,83,0.5)", borderRadius: 10, padding: "7px 14px", color: "#4CAF50", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            🤖 {uz ? "Botni ochish" : "Открыть бота"}
          </button>
        </div>
      </div>

      {loading && <Spinner />}

      {!loading && chats.length === 0 && (
        <Empty icon="💬" text={uz ? "Chatlar yo'q" : "Чатов нет"}
          sub={uz ? "Taklif qabul qilingandan so'ng chat ochiladi" : "Чат откроется после принятия предложения"} />
      )}

      {chats.map(c => (
        <button key={c.id} onClick={() => setSelChat(c)} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 18, marginBottom: 10,
          background: c.unread > 0
            ? "linear-gradient(135deg,rgba(212,175,55,0.08),rgba(27,94,64,0.05))"
            : "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
          border: `1px solid ${c.unread > 0 ? "rgba(212,175,55,0.25)" : "rgba(212,175,55,0.1)"}`,
          width: "100%", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,rgba(212,175,55,0.15),rgba(27,94,64,0.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            {c.partner_role === "tadbirkor" ? "🏢" : c.partner_role === "agentlik" ? "🏆" : "📢"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: "#E8E8E8", fontSize: 14 }}>{c.partner_name}</div>
            <div style={{ fontSize: 12, color: "#616161", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
              {c.last_message || (uz ? "Xabar yo'q" : "Нет сообщений")}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {c.unread > 0 && (
              <div style={{ background: "#D4AF37", color: "#0A0D14", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 900, marginBottom: 4, boxShadow: "0 0 8px rgba(212,175,55,0.4)" }}>{c.unread}</div>
            )}
            <div style={{ fontSize: 10, color: "#616161" }}>{c.updated_at?.slice(11,16)}</div>
          </div>
        </button>
      ))}
    </PageWrap>
  );
}

// ── CHAT XONASI ────────────────────────────────────────
function ChatRoom({ user, lang, chat, onBack }) {
  const uz = lang !== "ru";
  const [msgs,    setMsgs]   = useState([]);
  const [text,    setText]   = useState("");
  const [sending, setSend]   = useState(false);
  const [loading, setLoad]   = useState(true);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await http(`/api/messages/${chat.id}?user_id=${user.telegram_id}`);
      setMsgs(Array.isArray(r) ? r : []);
    } catch {}
  }, [chat, user]);

  useEffect(() => {
    load().finally(() => setLoad(false));
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!text.trim()) return;
    setSend(true);
    try {
      await http("/api/messages", "POST", {
        chat_id: chat.id, sender_id: user.telegram_id,
        receiver_id: chat.partner_id, message_text: text,
      });
      setText("");
      await load();
    } catch (e) { alert(e.message); }
    setSend(false);
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0D1117" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", background: "#131924", borderBottom: "1px solid rgba(212,175,55,0.12)", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ color: "#D4AF37", background: "rgba(212,175,55,0.08)", border: "none", cursor: "pointer", fontSize: 20, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {chat.partner_role === "tadbirkor" ? "🏢" : "📢"}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#E8E8E8", fontSize: 14 }}>{chat.partner_name}</div>
          <div style={{ fontSize: 10, color: "#4CAF50" }}>● {uz ? "Online" : "Онлайн"}</div>
        </div>
        <button
          onClick={() => window.open(`https://t.me/midas_bot?start=chat_${chat.partner_id}`, "_blank")}
          style={{ marginLeft: "auto", background: "rgba(27,94,64,0.3)", border: "1px solid rgba(45,134,83,0.4)", borderRadius: 10, padding: "6px 12px", color: "#4CAF50", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          🤖 {uz ? "Bot" : "Бот"}
        </button>
      </div>

      {/* Bot eslatmasi */}
      <div style={{ padding: "8px 16px", background: "rgba(27,94,64,0.12)", borderBottom: "1px solid rgba(45,134,83,0.15)" }}>
        <div style={{ fontSize: 11, color: "#4CAF50", textAlign: "center" }}>
          📎 {uz ? "Rasm/Video/Fayl yuborish uchun MIDAS Bot dan foydalaning" : "Для фото/видео/файлов используйте MIDAS Bot"}
        </div>
      </div>

      {/* Xabarlar */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        {loading && <Spinner />}
        {!loading && msgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#616161" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
            <div style={{ fontSize: 13 }}>{uz ? "Salom yozing!" : "Напишите привет!"}</div>
          </div>
        )}
        {msgs.map((m, i) => {
          const mine = m.sender_id === user.telegram_id || m.sender_id === String(user.telegram_id);
          const isBot = (m.message_text || "").startsWith("[Bot:");
          return (
            <div key={m.id || i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{
                maxWidth: "72%", padding: "10px 14px", borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                background: isBot
                  ? "rgba(27,94,64,0.3)"
                  : mine
                  ? "linear-gradient(135deg,rgba(139,105,20,0.5),rgba(212,175,55,0.3))"
                  : "rgba(255,255,255,0.06)",
                border: mine ? "1px solid rgba(212,175,55,0.3)" : isBot ? "1px solid rgba(45,134,83,0.4)" : "1px solid rgba(255,255,255,0.08)",
              }}>
                {isBot && <div style={{ fontSize: 10, color: "#4CAF50", marginBottom: 4, fontWeight: 700 }}>🤖 Bot</div>}
                <div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.5, wordBreak: "break-word" }}>
                  {m.message_text}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 5, textAlign: "right" }}>
                  {m.created_at?.slice(11, 16)} {mine && (m.is_read ? "✓✓" : "✓")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 12px 32px", background: "#131924", borderTop: "1px solid rgba(212,175,55,0.12)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          {/* Bot tugmasi */}
          <button
            onClick={() => window.open(`https://t.me/midas_bot?start=chat_${chat.partner_id}`, "_blank")}
            style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(27,94,64,0.3)", border: "1px solid rgba(45,134,83,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", flexShrink: 0, color: "#4CAF50" }}
            title={uz ? "Media yuborish (bot)" : "Отправить медиа (бот)"}
          >
            📎
          </button>

          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(212,175,55,0.15)", padding: "4px 4px 4px 14px", display: "flex", alignItems: "flex-end", gap: 4 }}>
            <textarea
              value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
              rows={1} placeholder={uz ? "Xabar yozing..." : "Написать сообщение..."}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#E8E8E8", fontSize: 13, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, paddingTop: 8, paddingBottom: 8 }}
            />
            <button onClick={send} disabled={sending || !text.trim()} style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: text.trim() ? "linear-gradient(135deg,#8B6914,#D4AF37)" : "rgba(255,255,255,0.06)",
              border: "none", cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              transition: "all 0.2s",
            }}>
              {sending ? "⏳" : "➤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
