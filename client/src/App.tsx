// src/App.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { BoardState } from "@/types";
import { loadState, saveState } from "@/lib/state";
import { computeTotals } from "@/lib/totals";
import TeamCard from "@/components/TeamCard";
import PodiumXL from "@/components/PodiumXL";
import AudienceMatrix from "@/components/AudienceMatrix";
import Confetti from "@/components/Confetti";
import { supabase } from "@/lib/supabase";

const ROW_ID = "main";

export default function App() {
  const [state, setState] = useState<BoardState>(() => loadState());
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [audienceMode, setAudienceMode] = useState<boolean>(location.hash === "#audience");
  const [fullscreen, setFullscreen] = useState(false);
  const [lastTop, setLastTop] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // cross-tab local fallback
  const bcRef = useRef<BroadcastChannel | null>(null);

  // guard: versi terakhir yang datang dari server (untuk mencegah push balik)
  const lastRemoteVersionRef = useRef<number | null>(null);

  // ref versi state saat ini (agar efek subscribe tidak perlu re-deps)
  const stateVersionRef = useRef<number>(state.version);
  useEffect(() => {
    stateVersionRef.current = state.version;
  }, [state.version]);

  /* ============ Persist ke localStorage + siarkan lintas-tab ============ */
  useEffect(() => {
    saveState(state);
    try {
      bcRef.current?.postMessage({ type: "STATE", version: state.version });
      localStorage.setItem("board:lastVersion", String(state.version));
    } catch {}
  }, [state]);

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("board-sync");
    } catch {}
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  /* ===================== Mode Penonton via hash ===================== */
  useEffect(() => {
    const onHash = () => setAudienceMode(location.hash === "#audience");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  /* ======================== Totals & Ranking ======================== */
  const totals = useMemo(() => computeTotals(state.teams, state.events, state.scores), [state]);
  const ranked = useMemo(
    () =>
      [...state.teams]
        .map((t) => ({ ...t, total: totals[t.id] || 0 }))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)),
    [state.teams, totals]
  );

  /* ==================== Confetti saat pemimpin berubah ==================== */
  useEffect(() => {
    if (ranked[0]?.id && ranked[0]?.id !== lastTop) {
      setLastTop(ranked[0].id);
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [ranked, lastTop]);

  /* ============================ Helpers ============================ */
  function bump(updater: (s: BoardState) => BoardState) {
    setState((prev) => ({ ...updater(prev), version: prev.version + 1 }));
  }

  function setScore(eventId: string, teamId: string, value: number) {
    const raw = Number.isFinite(value) ? Math.floor(value) : 0;
    bump((s) => {
      const max = s.events.find((ev) => ev.id === eventId)?.weight ?? 0;
      const v = Math.max(0, Math.min(raw, max));
      return { ...s, scores: { ...s.scores, [eventId]: { ...s.scores[eventId], [teamId]: v } } };
    });
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {}
  }

  // push langsung tanpa debounce (dipakai saat masuk Mode Penonton)
  async function pushNow() {
    const { error } = await supabase
      .from("board")
      .upsert({ id: ROW_ID, state, version: state.version, updated_at: new Date().toISOString() });
    if (error) console.error("SUPABASE_UPSERT_ERROR_IMMEDIATE", error);
  }

  // handler masuk/keluar audience: push dulu, baru ganti hash
  async function enterAudience() {
    try {
      await pushNow();
    } catch {}
    location.hash = "#audience";
  }
  function exitAudience() {
    location.hash = "";
  }

  /* ========================= Supabase Realtime ========================= */

  // (A) Semua device SUBSCRIBE + bootstrap awal dari server
  useEffect(() => {
    let alive = true;

    const apply = (next: BoardState) => {
      if (!alive) return;
      const incoming = typeof next.version === "number" ? next.version : -1;
      if (incoming > (stateVersionRef.current ?? 0)) {
        lastRemoteVersionRef.current = incoming; // tandai datang dari remote
        setState(next);
      }
    };

    // bootstrap awal
    supabase
      .from("board")
      .select("state, version")
      .eq("id", ROW_ID)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("SUPABASE_SELECT_ERROR", error);
        }
        if (data?.state) apply(data.state as BoardState);
      });

    // subscribe perubahan row ini
    const channel = supabase
      .channel("board-main")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "board", filter: `id=eq.${ROW_ID}` },
        (payload) => {
          const next = (payload.new as any)?.state as BoardState | undefined;
          if (next) apply(next);
        }
      )
      .subscribe((status) => {
        // Debug status subscribe di console
        console.log("SUB_STATUS", status);
      });

    // fallback lintas-tab lokal
    const onBC = (ev: MessageEvent) => {
      if ((ev as any)?.data?.type === "STATE") {
        const cached = loadState();
        apply(cached);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "state" || e.key === "board:lastVersion") {
        const cached = loadState();
        apply(cached);
      }
    };
    if (bcRef.current) bcRef.current.onmessage = onBC;
    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      supabase.removeChannel(channel);
      if (bcRef.current) (bcRef.current.onmessage as any) = null;
      window.removeEventListener("storage", onStorage);
    };
  }, []); // subscribe sekali

  // (B) Hanya operator yang PUSH; skip jika state baru saja datang dari remote
  useEffect(() => {
    if (audienceMode) return;
    if (lastRemoteVersionRef.current != null && state.version === lastRemoteVersionRef.current) {
      return; // jangan push balik
    }
    const id = setTimeout(async () => {
      const { error } = await supabase
        .from("board")
        .upsert({ id: ROW_ID, state, version: state.version, updated_at: new Date().toISOString() });
      if (error) console.error("SUPABASE_UPSERT_ERROR", error);
    }, 200);
    return () => clearTimeout(id);
  }, [state, audienceMode]);

  /* =============================== UI =============================== */

  return (
    <div className="min-h-screen w-full relative">
      <HeroBackground />

      {/* ===== AUDIENCE MODE ===== */}
      {audienceMode ? (
        <div className="relative mx-auto w-full max-w-[120rem] px-4 lg:px-8 py-6">
          <HeaderPoster />

          <div className="mt-8 space-y-8">
            <PodiumXL ranked={ranked} />
            <AudienceMatrix ranked={ranked} events={state.events} scores={state.scores} />
          </div>

          {showConfetti && <Confetti />}

          {/* Floating controls: bottom-right */}
          <div className="fixed right-4 bottom-4 z-40">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl border border-red-200 shadow-lg">
              <button
                onClick={exitAudience}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Keluar Mode Penonton
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                {fullscreen ? "Keluar Fullscreen" : "Full Screen"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ===== OPERATOR MODE ===== */
        <div className="relative mx-auto w-full max-w-[120rem] px-4 lg:px-8 py-6">
          <HeaderPoster />

          {/* Tabs */}
          <div className="mt-6 flex w-full justify-center">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-3 overflow-x-auto no-scrollbar px-1">
              <TabButton active={activeTab === "summary"} onClick={() => setActiveTab("summary")}>
                Klasemen
              </TabButton>
              {state.events.map((e) => (
                <TabButton key={e.id} active={activeTab === e.id} onClick={() => setActiveTab(e.id)}>
                  {e.name}
                </TabButton>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeTab === "summary" ? (
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {ranked.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="basis-[340px] grow-0 shrink-0"
                >
                  <TeamCard
                    team={t}
                    events={state.events}
                    scores={state.scores}
                    rankLabel={idx === 0 ? "Juara 1" : idx === 1 ? "Juara 2" : idx === 2 ? "Juara 3" : `#${idx + 1}`}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {state.events
                .filter((e) => e.id === activeTab)
                .map((e) => (
                  <div key={e.id} className="max-w-[120rem] mx-auto">
                    <div className="font-semibold text-red-800 text-center mb-3">
                      {e.name} <span className="text-xs text-red-700">· Maks {e.weight}</span>
                    </div>

                    <div className="grid justify-items-center gap-6 mx-auto grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {state.teams.map((t) => {
                        // nomor kelompok: team.groupNo, fallback id 'kelX'
                        const groupNo =
                          (t as any).groupNo ??
                          (typeof t.id === "string"
                            ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined
                            : undefined);

                        return (
                          <div
                            key={t.id}
                            className="w-[320px] rounded-2xl border border-red-200 bg-white/92 backdrop-blur-[2px] shadow p-5"
                          >
                            {/* header: NAMA + 'Kelompok X' */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                <div className="leading-tight">
                                  <div className="font-semibold" style={{ color: t.color }}>
                                    {t.name}
                                  </div>
                                  {groupNo ? (
                                    <div className="text-[11px] text-black/60">Kelompok {groupNo}</div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {/* input skor */}
                            <div className="flex justify-center">
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={e.weight}
                                step={1}
                                value={state.scores[e.id]?.[t.id] ?? 0}
                                onChange={(ev) => setScore(e.id, t.id, Number(ev.target.value))}
                                onBlur={(ev) => setScore(e.id, t.id, Number(ev.target.value))}
                                onKeyDown={(ev) => {
                                  const ban = ["e", "E", "+", "-"];
                                  if (ban.includes(ev.key)) ev.preventDefault();
                                }}
                                placeholder="0"
                                className="w-20 md:w-24 h-11 md:h-12 text-lg md:text-xl text-center bg-white/95 border border-red-300 rounded-xl shadow-inner outline-none transition focus:ring-2 focus:ring-red-500/40 focus:border-red-500 hover:border-red-400"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() =>
                          bump((s) => ({
                            ...s,
                            scores: { ...s.scores, [e.id]: Object.fromEntries(s.teams.map((t) => [t.id, 0])) },
                          }))
                        }
                        className="px-4 py-2 rounded-2xl border border-red-300 bg-white text-red-700 hover:bg-red-50 transition"
                      >
                        Reset Lomba
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {showConfetti && <Confetti />}

          {/* Floating controls */}
          <div className="fixed right-4 bottom-4 z-40">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl border border-red-200 shadow-lg">
              <button
                onClick={enterAudience}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Mode Penonton
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                {fullscreen ? "Keluar Fullscreen" : "Full Screen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-2xl border whitespace-nowrap transition-transform duration-200 ${
        active
          ? "!bg-red-600 !text-white !border-red-600"
          : "!bg-white !text-red-700 !border-red-300 hover:!bg-red-50"
      } hover:scale-[1.03] active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}

function HeaderPoster() {
  return (
    <div className="relative w-full mt-6">
      <div className="flex items-center justify-between px-8">
        <img src="/logo-company.png" alt="Logo Perusahaan" className="h-16 md:h-20 w-auto drop-shadow" />
        <div className="text-center">
          <div className="mx-auto w-fit rounded-xl bg-white/85 backdrop-blur px-4 py-1.5 shadow">
            <div className="text-red-700 tracking-[0.16em] text-[11px] md:text-xs font-semibold">
              DIRGAHAYU REPUBLIK INDONESIA
            </div>
            <div className="text-neutral-700 text-[11px] md:text-xs mt-0.5">17 AGUSTUS 2025</div>
          </div>
          <h1
            className="mt-3 font-extrabold text-red-700 drop-shadow-md leading-tight"
            style={{ fontSize: "clamp(2rem, 2.8vw, 3.2rem)" }}
          >
            BERSATU KITA GESIT
          </h1>
          <p className="mt-2 text-neutral-800 text-[13px] md:text-sm max-w-xl mx-auto backdrop-blur px-3 py-1.5">
            Mari kita bergerak, berinovasi, dan berkolaborasi untuk mencapai tujuan bersama.
          </p>
        </div>
        <img src="/logo-80.png" alt="Logo 80 Tahun RI" className="h-16 md:h-20 w-auto drop-shadow" />
      </div>
    </div>
  );
}

function HeroBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10" />
    </>
  );
}
