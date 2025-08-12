// src/components/PodiumXL.tsx
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Medal } from "lucide-react";
import type { Team } from "@/types";

type Ranked = Array<Team & { total: number }>;

export default function PodiumXL({ ranked }: { ranked: Ranked }) {
  if (!ranked?.length) return null;

  // Ambil 3 total unik teratas (dense ranking: 1,2,3 meski ada seri)
  const uniqTotals = Array.from(new Set(ranked.map((r) => r.total))); // ranked sudah desc
  const placeTotals: Record<1 | 2 | 3, number | undefined> = {
    1: uniqTotals[0],
    2: uniqTotals[1],
    3: uniqTotals[2],
  };

  // Kelompokkan tim per tempat 1/2/3 (tiap grup bisa >1 tim kalau seri)
  const groups = ([
    1, 2, 3,
  ] as const)
    .map((p) => {
      const tv = placeTotals[p];
      const teams = tv == null ? [] : ranked.filter((t) => t.total === tv);
      return { place: p, total: tv, teams };
    })
    .filter((g) => g.total != null && g.teams.length > 0);

  if (!groups.length) return null;

  // urutan visual: 2 – 1 – 3 (yang ada saja)
  const order: (1 | 2 | 3)[] = [2, 1, 3];
  const tiles = order
    .map((p) => groups.find((g) => g.place === p))
    .filter(Boolean) as typeof groups;

  const cfg: Record<
    1 | 2 | 3,
    { bg: string; ring: string; icon: ReactNode; height: string; badge: string; numeral: string }
  > = {
    1: {
      bg: "from-yellow-300/70 to-amber-200/80",
      ring: "ring-amber-400",
      icon: <Crown className="w-6 h-6 text-yellow-600" />,
      height: "h-64 md:h-72",
      badge: "bg-amber-500 text-white",
      numeral: "text-amber-600/20",
    },
    2: {
      bg: "from-zinc-100/80 to-zinc-300/70",
      ring: "ring-zinc-300",
      icon: <Trophy className="w-6 h-6 text-zinc-600" />,
      height: "h-52 md:h-60",
      badge: "bg-zinc-600 text-white",
      numeral: "text-zinc-600/20",
    },
    3: {
      bg: "from-orange-200/80 to-amber-200/70",
      ring: "ring-orange-300",
      icon: <Medal className="w-6 h-6 text-orange-600" />,
      height: "h-48 md:h-56",
      badge: "bg-orange-600 text-white",
      numeral: "text-orange-600/20",
    },
  };

  // animasi naik-turun looping
  const delays: Record<1 | 2 | 3, number> = { 1: 0, 2: 0.25, 3: 0.5 };
  const distances: Record<1 | 2 | 3, number> = { 1: 14, 2: 10, 3: 8 };
  const durations: Record<1 | 2 | 3, number> = { 1: 4.5, 2: 4.2, 3: 4.0 };

  return (
    <div className="relative max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        {tiles.map((g) => {
          const c = cfg[g.place];
          const d = distances[g.place];
          const label =
            g.place === 1 ? "Juara 1" : g.place === 2 ? "Juara 2" : "Juara 3";
          const tie = g.teams.length > 1;

          return (
            <motion.div
              key={`place-${g.place}`}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${c.bg} backdrop-blur
                          ring ${c.ring} shadow-lg px-5 py-4 flex flex-col justify-between ${c.height}`}
              style={{ willChange: "transform" }}
              animate={{ y: [0, -d, 0, d, 0] }}
              transition={{
                duration: durations[g.place],
                repeat: Infinity,
                ease: "easeInOut",
                delay: delays[g.place],
              }}
            >
              {/* ANGKA BESAR */}
              <div
                className={`pointer-events-none select-none absolute right-3 md:right-4 top-1/2 -translate-y-1/2
                            font-black leading-none ${c.numeral}
                            text-[84px] md:text-[116px]`}
                aria-hidden
              >
                {g.place}
              </div>

              {/* header: daftar tim (seri bisa >1) */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1">
                  {/* chips tim – tampilkan s.d. 3, sisanya “+N” */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {g.teams.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold bg-white/80 border border-black/10"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="tracking-wide" style={{ color: t.color }}>
                          {t.name}
                        </span>
                      </span>
                    ))}
                    {g.teams.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/70 border border-black/10 text-black/70">
                        +{g.teams.length - 3} lagi
                      </span>
                    )}
                  </div>

                  {/* keterangan kelompok untuk kasus 1 tim (agar ringkas); kalau seri, skip */}
                  {g.teams.length === 1 && (
                    <SmallGroupNote team={g.teams[0]} />
                  )}
                </div>
                {c.icon}
              </div>

              {/* score (sama untuk semua tim di grup) */}
              <div className="relative z-10 text-[56px] md:text-[84px] font-black leading-none text-red-700 drop-shadow-sm">
                {g.total}
              </div>

              {/* footer */}
              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-xs md:text-sm px-3 py-1.5 rounded-full ${c.badge}`}>
                  {label}
                  {tie ? " (Bersama)" : ""}
                </span>
                {tie ? (
                  <span className="text-[11px] md:text-xs px-2.5 py-1 rounded-full bg-white/75 border border-black/10 text-black/70">
                    {g.teams.length} tim
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

/* ===== Helper kecil: subjudul “Kelompok X” (hanya saat 1 tim di ubin) ===== */
function SmallGroupNote({ team }: { team: Team }) {
  const groupNo =
    (team as any).groupNo ??
    (typeof team.id === "string"
      ? Number(/^kel(\d+)$/i.exec(team.id)?.[1]) || undefined
      : undefined);
  if (!groupNo) return null;
  return <div className="text-[11px] md:text-xs text-black/60">kelompok {groupNo}</div>;
}
