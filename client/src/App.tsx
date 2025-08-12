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

// ⬇️ Realtime via Supabase (ganti WebSocket)
import { useSupabaseSync } from "@/hooks/useSupabaseSync";

/* ============================== App ============================== */
export default function App() {
  const [state, setState] = useState<BoardState>(() => loadState());
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [audienceMode, setAudienceMode] = useState<boolean>(location.hash === "#audience");
  const [fullscreen, setFullscreen] = useState(false);
  const [lastTop, setLastTop] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // BroadcastChannel untuk sinkronisasi lintas-tab/perangkat (ditambah fallback storage event + polling)
  const bcRef = useRef<BroadcastChannel | null>(null);

  // Realtime sink ke Supabase (row id default "main")
  useSupabaseSync(state, setState, { readOnly: audienceMode, rowId: "main" });

  // inisialisasi BroadcastChannel sekali
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("board-sync");
    } catch {
      // abaikan jika browser tidak mendukung (Safari lama, dsb.)
    }
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  // persist ke localStorage + siarkan perubahan agar Audience menerima update cepat
  useEffect(() => {
    saveState(state);
    try {
      // kirim sinyal ringan saja (versi) — Audience akan memanggil loadState()
      bcRef.current?.postMessage({ type: "STATE", version: state.version });
      localStorage.setItem("board:lastVersion", String(state.version));
    } catch {}
  }, [state]);

  // watch hash untuk mode penonton
  useEffect(() => {
    const onHash = () => setAudienceMode(location.hash === "#audience");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // totals & rank
  const totals = useMemo(() => computeTotals(state.teams, state.events, state.scores), [state]);
  const ranked = useMemo(
    () =>
      [...state.teams]
        .map((t) => ({ ...t, total: totals[t.id] || 0 }))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)),
    [state.teams, totals],
  );

  // confetti ringan saat pimpinan berubah
  useEffect(() => {
    if (ranked[0]?.id && ranked[0]?.id !== lastTop) {
      setLastTop(ranked[0].id);
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [ranked, lastTop]);

  // helpers
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

  /* ================= Audience auto-refresh =================
     - Terima update via BroadcastChannel → loadState()
     - Fallback via event 'storage' (lintas-tab origin yg sama)
     - Fallback polling ringan tiap 2s
  */
  useEffect(() => {
    if (!audienceMode) return;

    const apply = () => setState(loadState());

    // BroadcastChannel
    const bc = bcRef.current;
    const onBCMessage = (ev: MessageEvent) => {
      if ((ev as any)?.data?.type === "STATE") apply();
    };
    if (bc) bc.onmessage = onBCMessage;

    // storage event (lintas-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "state" || e.key === "board:lastVersion") apply();
    };
    window.addEventListener("storage", onStorage);

    // polling fallback (jaga-jaga jika keduanya tidak jalan)
    const id = window.setInterval(apply, 2000);

    return () => {
      if (bc) bc.onmessage = null as any;
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [audienceMode]);

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
              <a
                href="#"
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Keluar Mode Penonton
              </a>
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
                    {/* Judul lomba center */}
                    <div className="font-semibold text-red-800 text-center mb-3">
                      {e.name} <span className="text-xs text-red-700">· Maks {e.weight}</span>
                    </div>

                    {/* Grid 3×2, center alignment */}
                    <div className="grid justify-items-center gap-6 mx-auto grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {state.teams.map((t) => (
                        <div
                          key={t.id}
                          className="w-[320px] rounded-2xl border border-red-200 bg-white/92 backdrop-blur-[2px] shadow p-5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                              <span className="font-semibold" style={{ color: t.color }}>
                                {t.name}
                              </span>
                            </div>
                          </div>

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
                              className="w-20 md:w-24 h-11 md:h-12 text-lg md:text-xl text-center
                                         bg-white/95 border border-red-300 rounded-xl shadow-inner
                                         outline-none transition
                                         focus:ring-2 focus:ring-red-500/40 focus:border-red-500
                                         hover:border-red-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reset tombol di bawah, center */}
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

          {/* Floating controls: bottom-right */}
          <div className="fixed right-4 bottom-4 z-40">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl border border-red-200 shadow-lg">
              <a
                href="#audience"
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Mode Penonton
              </a>
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

/* ================= Helpers & Ornamen ================= */

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
      className={`px-4 py-2 rounded-2xl border whitespace-nowrap transition-transform duration-200
        ${active ? "!bg-red-600 !text-white !border-red-600" : "!bg-white !text-red-700 !border-red-300 hover:!bg-red-50"}
        hover:scale-[1.03] active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}

/** Header poster ringkas + logo kiri/kanan */
function HeaderPoster() {
  return (
    <div className="relative w-full mt-6">
      <div className="flex items-center justify-between px-8">
        {/* Logo Perusahaan */}
        <img src="/logo-company.png" alt="Logo Perusahaan" className="h-16 md:h-20 w-auto drop-shadow" />

        {/* Judul */}
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

        {/* Logo 80 Tahun */}
        <img src="/logo-80.png" alt="Logo 80 Tahun RI" className="h-16 md:h-20 w-auto drop-shadow" />
      </div>
    </div>
  );
}

/** Background gambar full-screen */
function HeroBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10" />
    </>
  );
}
