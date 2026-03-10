// ═══════════════════════════════════════════════════════
// MIDAS v5 — Part 5: Admin Panel
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { Card, Btn, Inp, Modal, Badge, fmtNum, http } from "./App_v5_part1";

export function AdminPanel({ user, lang, theme }) {
  const [tab,      setTab]      = useState("pending");
  const [pending,  setPending]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [search,   setSearch]   = useState("");
  const [stats,    setStats]    = useState(null);
  const [bcText,   setBcText]   = useState("");
  const [bcTarget, setBcTarget] = useState("all");
  const [sending,  setSending]  = useState(false);
  const [detailU,  setDetailU]  = useState(null);

  const T = lang === "uz" ? {
    title:"Admin Panel", pending:"Kutayotganlar", users:"Foydalanuvchilar",
    stats:"Statistika", broadcast:"Xabar yuborish",
    approve:"✅ Tasdiqlash", reject:"❌ Rad etish", block:"🚫 Bloklash",
    unblock:"✓ Blokdan chiqarish", premium:"⭐ Premium berish",
    noP:"Kutayotganlar yo'q", total:"Jami", tadbirkor:"Tadbirkorlar",
    reklamachi:"Reklamachilar", today:"Bugun", active:"Faol",
    sendBc:"Xabar yuborish", target:"Kimga",
    tAll:"Barchaga", tTadb:"Tadbirkorlarga", tRek:"Reklamachilarga",
    search:"Qidirish...", details:"Batafsil",
  } : {
    title:"Админ Панель", pending:"Ожидают", users:"Пользователи",
    stats:"Статистика", broadcast:"Рассылка",
    approve:"✅ Одобрить", reject:"❌ Отклонить", block:"🚫 Заблокировать",
    unblock:"✓ Разблокировать", premium:"⭐ Дать Premium",
    noP:"Ожидающих нет", total:"Всего", tadbirkor:"Предприниматели",
    reklamachi:"Рекламодатели", today:"Сегодня", active:"Активные",
    sendBc:"Отправить", target:"Кому",
    tAll:"Всем", tTadb:"Предпринимателям", tRek:"Рекламодателям",
    search:"Поиск...", details:"Подробнее",
  };

  const load = useCallback(async () => {
    http("/api/admin/pending").then(r => setPending(Array.isArray(r) ? r : [])).catch(() => {});
    http(`/api/admin/users?search=${search}`).then(r => setUsers(Array.isArray(r) ? r : [])).catch(() => {});
    http("/api/admin/stats").then(setStats).catch(() => {});
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const action = async (tid, act) => {
    try {
      await http(`/api/admin/users/${tid}/action`, "POST", { action: act });
      load();
    } catch (ex) { alert(ex.message); }
  };

  const sendBroadcast = async () => {
    if (!bcText.trim()) return;
    setSending(true);
    try {
      await http("/api/admin/broadcast", "POST", { message: bcText, target: bcTarget });
      setBcText("");
      alert(lang === "uz" ? "Xabar yuborildi ✓" : "Сообщение отправлено ✓");
    } catch (ex) { alert(ex.message); }
    setSending(false);
  };

  const tabs = [
    ["pending", `⏳ ${T.pending}${pending.length > 0 ? ` (${pending.length})` : ""}`],
    ["users",   `👥 ${T.users}`],
    ["stats",   `📊 ${T.stats}`],
    ["bc",      `📢 ${T.broadcast}`],
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Tab bar */}
      <div style={{ display: "flex", background: theme.card, borderBottom: `1px solid ${theme.border}`, overflowX: "auto" }}>
        {tabs.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ flexShrink: 0, padding: "13px 14px", fontWeight: 700, fontSize: 12, color: tab === v ? theme.accent : theme.hint, background: "none", border: "none", cursor: "pointer", borderBottom: `2.5px solid ${tab === v ? theme.accent : "transparent"}`, whiteSpace: "nowrap" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {/* Pending */}
        {tab === "pending" && <>
          {pending.length === 0 && (
            <div style={{ textAlign: "center", padding: "52px 0", color: theme.hint }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              {T.noP}
            </div>
          )}
          {pending.map(u => (
            <Card key={u.telegram_id} theme={theme}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>{u.full_name}</div>
                  <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>
                    @{u.username || "—"} · {u.role} · {u.phone}
                  </div>
                </div>
                <Badge bg={theme.goldL} color={theme.gold}>⏳</Badge>
              </div>

              {u.role === "reklamachi" && u.profile && (
                <div style={{ fontSize: 12, color: theme.sub, background: theme.card2, padding: "8px 12px", borderRadius: 10, marginBottom: 10, lineHeight: 1.7 }}>
                  <div>📱 {u.profile.platform} · 👥 {fmtNum(u.profile.followers)}</div>
                  <div>💰 {fmtNum(u.profile.price_post)} so'm/post</div>
                  {u.profile.profile_link && <div>🔗 <a href={u.profile.profile_link} style={{ color: theme.accent }}>{u.profile.profile_link.slice(0, 40)}</a></div>}
                  {u.profile.address && <div>📍 {u.profile.address}</div>}
                </div>
              )}

              {u.role === "tadbirkor" && u.business && (
                <div style={{ fontSize: 12, color: theme.sub, background: theme.card2, padding: "8px 12px", borderRadius: 10, marginBottom: 10, lineHeight: 1.7 }}>
                  <div>🏢 {u.business.sector}</div>
                  {u.business.location?.length > 0 && <div>📍 {u.business.location.join(", ")}</div>}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn onClick={() => action(u.telegram_id, "approve")} theme={theme} sz="sm">{T.approve}</Btn>
                <Btn onClick={() => action(u.telegram_id, "reject")}  theme={theme} v="danger" sz="sm">{T.reject}</Btn>
                <Btn onClick={() => action(u.telegram_id, "premium")} theme={theme} v="gold" sz="sm">{T.premium}</Btn>
              </div>
            </Card>
          ))}
        </>}

        {/* Users */}
        {tab === "users" && <>
          <Inp value={search} onChange={setSearch} ph={T.search} theme={theme} />
          {users.map(u => (
            <Card key={u.telegram_id} theme={theme} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>{u.full_name}</div>
                  <div style={{ fontSize: 11, color: theme.hint, marginTop: 2 }}>
                    @{u.username || "—"} · {u.role}
                    {u.is_premium === 1 && " · ⭐"}
                    {u.is_blocked === 1 && " · 🚫"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn onClick={() => setDetailU(u)} theme={theme} v="secondary" sz="sm">{T.details}</Btn>
                  {u.is_blocked === 1
                    ? <Btn onClick={() => action(u.telegram_id, "unblock")} theme={theme} v="ghost" sz="sm">{T.unblock}</Btn>
                    : <Btn onClick={() => action(u.telegram_id, "block")}   theme={theme} v="danger" sz="sm">{T.block}</Btn>
                  }
                </div>
              </div>
            </Card>
          ))}
        </>}

        {/* Stats */}
        {tab === "stats" && stats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                ["👥", stats.total_users || 0,       T.total],
                ["🏢", stats.tadbirkor_count || 0,   T.tadbirkor],
                ["📢", stats.reklamachi_count || 0,  T.reklamachi],
                ["📅", stats.today_registrations || 0, T.today],
                ["✅", stats.approved_count || 0,    T.active],
                ["⏳", stats.pending_count || 0,     T.pending],
                ["💬", stats.total_chats || 0,       "Chatlar"],
                ["📋", stats.total_tenders || 0,     "Tenderlar"],
              ].map(([icon, val, label]) => (
                <div key={label} style={{ background: theme.card, borderRadius: 16, padding: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 24, color: theme.accent }}>{fmtNum(val)}</div>
                  <div style={{ fontSize: 12, color: theme.hint, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast */}
        {tab === "bc" && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: 600 }}>{T.target}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["all", T.tAll], ["tadbirkor", T.tTadb], ["reklamachi", T.tRek]].map(([v, l]) => (
                  <button key={v} onClick={() => setBcTarget(v)} style={{ flex: 1, padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 600, border: `1.5px solid ${bcTarget === v ? theme.accent : theme.border}`, background: bcTarget === v ? theme.accentLight : theme.card2, color: bcTarget === v ? theme.accent : theme.text, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
            </div>
            <Inp label={lang === "uz" ? "Xabar matni *" : "Текст сообщения *"} value={bcText} onChange={setBcText} rows={6} ph={lang === "uz" ? "Xabar matnini yozing..." : "Напишите текст сообщения..."} theme={theme} />
            <Btn onClick={sendBroadcast} disabled={sending || !bcText.trim()} theme={theme} full sz="lg">
              {sending ? (lang === "uz" ? "Yuborilmoqda..." : "Отправляется...") : `📢 ${T.sendBc}`}
            </Btn>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailU && (
        <Modal title={detailU.full_name} onClose={() => setDetailU(null)} theme={theme}>
          {[
            ["ID", detailU.telegram_id],
            ["Username", `@${detailU.username || "—"}`],
            [lang === "uz" ? "Telefon" : "Телефон", detailU.phone],
            [lang === "uz" ? "Rol" : "Роль", detailU.role],
            [lang === "uz" ? "Til" : "Язык", detailU.lang],
            ["Premium", detailU.is_premium ? "✅" : "—"],
            [lang === "uz" ? "Tasdiqlangan" : "Верифицирован", detailU.is_verified ? "✅" : "⏳"],
            [lang === "uz" ? "Bloklangan" : "Заблокирован", detailU.is_blocked ? "🚫 Ha" : "—"],
            [lang === "uz" ? "Rating" : "Рейтинг", `⭐ ${detailU.rating?.toFixed?.(1) || "5.0"}`],
            [lang === "uz" ? "Ro'yxat" : "Регистрация", detailU.created_at?.slice(0, 16)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.sub, fontSize: 13 }}>{k}</span>
              <span style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <Btn onClick={() => { action(detailU.telegram_id, "approve"); setDetailU(null); }} theme={theme} sz="sm">{T.approve}</Btn>
            <Btn onClick={() => { action(detailU.telegram_id, "premium"); setDetailU(null); }} theme={theme} v="gold" sz="sm">{T.premium}</Btn>
            {detailU.is_blocked
              ? <Btn onClick={() => { action(detailU.telegram_id, "unblock"); setDetailU(null); }} theme={theme} v="ghost" sz="sm">{T.unblock}</Btn>
              : <Btn onClick={() => { action(detailU.telegram_id, "block"); setDetailU(null); }} theme={theme} v="danger" sz="sm">{T.block}</Btn>
            }
          </div>
        </Modal>
      )}
    </div>
  );
}
