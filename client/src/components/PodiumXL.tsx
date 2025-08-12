// src/components/PodiumXL.tsx
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Medal } from "lucide-react";
import type { Team } from "@/types";

type Ranked = Array<Team & { total: number }>;

export default function PodiumXL({ ranked }: { ranked: Ranked }) {
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];
  if (!first) return null;

  // urutan podium: 2 – 1 – 3
  const tiles: Array<Team & { total: number; place: 1 | 2 | 3 }> = [];
  if (second) tiles.push({ ...second, place: 2 });
  tiles.push({ ...first, place: 1 });
  if (third) tiles.push({ ...third, place: 3 });

  const cfg: Record<
    1 | 2 | 3,
    { bg: string; ring: string; icon: ReactNode; height: string; badge: string; numeral: string }
  > = {
    1: { bg: "from-yellow-300/70 to-amber-200/80", ring: "ring-amber-400", icon: <Crown className="w-6 h-6 text-yellow-600" />, height: "h-64 md:h-72", badge: "bg-amber-500 text-white", numeral: "text-amber-600/20" },
    2: { bg: "from-zinc-100/80 to-zinc-300/70", ring: "ring-zinc-300", icon: <Trophy className="w-6 h-6 text-zinc-600" />, height: "h-52 md:h-60", badge: "bg-zinc-600 text-white", numeral: "text-zinc-600/20" },
    3: { bg: "from-orange-200/80 to-amber-200/70", ring: "ring-orange-300", icon: <Medal className="w-6 h-6 text-orange-600" />, height: "h-48 md:h-56", badge: "bg-orange-600 text-white", numeral: "text-orange-600/20" },
  };

  // animasi naik-turun looping
  const delays: Record<1 | 2 | 3, number> = { 1: 0, 2: 0.25, 3: 0.5 };
  const distances: Record<1 | 2 | 3, number> = { 1: 14, 2: 10, 3: 8 };
  const durations: Record<1 | 2 | 3, number> = { 1: 4.5, 2: 4.2, 3: 4.0 };

  return (
    <div className="relative max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        {tiles.map((t) => {
          const c = cfg[t.place as 1 | 2 | 3];
          const d = distances[t.place];

          // ambil nomor kelompok: prioritaskan t.groupNo, fallback dari id 'kelX'
          const groupNo =
            (t as any).groupNo ??
            (typeof t.id === "string" ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined : undefined);

          // hitung jumlah anggota bila ada (dipakai di footer)
          const memberCount = Array.isArray((t as any).members) ? (t as any).members.length : 0;

          return (
            <motion.div
              key={t.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${c.bg} backdrop-blur ring ${c.ring} shadow-lg px-5 py-4 flex flex-col justify-between ${c.height}`}
              style={{ willChange: "transform" }}
              animate={{ y: [0, -d, 0, d, 0] }}
              transition={{ duration: durations[t.place], repeat: Infinity, ease: "easeInOut", delay: delays[t.place] }}
            >
              {/* ANGKA BESAR */}
              <div
                className={`pointer-events-none select-none absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-black leading-none ${c.numeral} text-[84px] md:text-[116px]`}
                aria-hidden
              >
                {t.place}
              </div>

              {/* header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <div className="leading-tight">
                    <div className="text-xl md:text-2xl font-extrabold tracking-wide" style={{ color: t.color }}>
                      {t.name}
                    </div>
                    {groupNo ? (
                      <div className="text-[11px] md:text-xs text-black/60">
                        kelompok {groupNo}
                      </div>
                    ) : null}
                  </div>
                </div>
                {c.icon}
              </div>

              {/* score */}
              <div className="relative z-10 text-[56px] md:text-[84px] font-black leading-none text-red-700 drop-shadow-sm">
                {t.total}
              </div>

              {/* footer */}
              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-xs md:text-sm px-3 py-1.5 rounded-full ${t.place === 1 ? "bg-amber-500" : t.place === 2 ? "bg-zinc-600" : "bg-orange-600"} text-white`}>
                  {t.place === 1 ? "Juara 1" : t.place === 2 ? "Juara 2" : "Juara 3"}
                </span>

                {/* kalau ada daftar anggota, tampilkan jumlahnya saja */}
                {memberCount > 0 ? (
                  <span className="text-[11px] md:text-xs px-2.5 py-1 rounded-full bg-white/75 border border-black/10 text-black/70">
                    {memberCount} anggota
                  </span>
                ) : (
                  <span className="text-[11px] md:text-xs opacity-70">Peringkat</span>
                )}
              </div>

              {/* alas */}
              <div className="absolute inset-x-5 bottom-2 h-1.5 rounded-full bg-black/5" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
