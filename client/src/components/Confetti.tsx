// src/components/Confetti.tsx
import { useMemo } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";

type Props = {
  pieces?: number;   // jumlah konfeti utama
  sparks?: number;   // jumlah sparkle / bintang kecil
  seed?: number;     // biar deterministik
};

export default function Confetti({ pieces = 140, sparks = 26, seed = 20250812 }: Props) {
  const palette = [
    "#F59E0B", "#EF4444", "#10B981", "#3B82F6",
    "#A78BFA", "#EC4899", "#22C55E", "#F97316", "#EAB308",
  ];

  // RNG deterministik
  function makeRand(s0: number) {
    let s = s0 >>> 0;
    return () => ((s = (1664525 * s + 1013904223) >>> 0) / 0xffffffff);
  }
  const rand = useMemo(() => makeRand(seed), [seed]);

  // ====== data konfeti ======
  const flakes = useMemo(() => {
    const arr: Array<{
      key: string;
      layer: 0 | 1 | 2;
      left: number;
      yFrom: number;
      size: number;
      heightFactor: number;
      drift: number;
      rotStart: number;
      rotX: number;
      rotY: number;
      turns: number;
      delay: number;
      duration: number;
      color: string;
      shape: "rect" | "circle" | "triangle" | "ribbon";
      blur: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < pieces; i++) {
      const layer = (rand() < 0.2 ? 0 : rand() < 0.6 ? 1 : 2) as 0 | 1 | 2;
      const left = rand() * 100;
      const yFrom = -50 - rand() * 220;

      const base = layer === 2 ? 9 : layer === 1 ? 7 : 5;
      const size = base + Math.floor(rand() * (layer === 2 ? 10 : 7));
      const duration = (layer === 2 ? 6 : layer === 1 ? 8 : 10) + rand() * 4;

      const heightFactor = 0.6 + (i % 3) * 0.25;
      const drift = (rand() * 60 - 30) * (layer === 2 ? 1 : layer === 1 ? 0.8 : 0.6);
      const rotStart = rand() * 360;
      const turns = 540 + rand() * 540;
      const rotX = rand() * 180 - 90;
      const rotY = rand() * 180 - 90;

      const rShape = rand();
      const shape: "rect" | "circle" | "triangle" | "ribbon" =
        rShape > 0.86 ? "ribbon" : rShape > 0.68 ? "triangle" : rShape > 0.36 ? "circle" : "rect";

      arr.push({
        key: `f${i}`,
        layer,
        left,
        yFrom,
        size,
        heightFactor,
        drift,
        rotStart,
        rotX,
        rotY,
        turns,
        delay: rand() * 4,
        duration,
        color: palette[Math.floor(rand() * palette.length)],
        shape,
        blur: layer === 0 ? 0.8 : layer === 1 ? 0.3 : 0,
        opacity: (layer === 2 ? 0.95 : layer === 1 ? 0.85 : 0.7) * (0.9 + rand() * 0.2),
      });
    }
    return arr;
  }, [pieces, seed]); // seed ikut depend biar konsisten

  // ====== sparkle (bintang kecil nyala-mati) ======
  const starlets = useMemo(() => {
    const arr: Array<{
      key: string;
      left: number;
      top: number;
      delay: number;
      size: number;
      hue: string;
    }> = [];
    for (let i = 0; i < sparks; i++) {
      arr.push({
        key: `s${i}`,
        left: rand() * 100,
        top: 5 + rand() * 40,
        delay: rand() * 3,
        size: 2 + Math.round(rand() * 2),
        hue: palette[Math.floor(rand() * palette.length)],
      });
    }
    return arr;
  }, [sparks, seed]); // seed ikut depend

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50" aria-hidden>
      {/* Sparkle layer */}
      {starlets.map((s) => (
        <motion.span
          key={s.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            backgroundColor: "#fff",
            filter: `drop-shadow(0 0 6px ${s.hue})`,
          }}
        />
      ))}

      {/* Confetti flakes */}
      {flakes.map((p) => {
        const isTriangle = p.shape === "triangle";
        const isCircle = p.shape === "circle";
        const isRibbon = p.shape === "ribbon";

        const width = isRibbon ? Math.max(5, Math.round(p.size * 0.7)) : p.size;
        const height = isRibbon
          ? Math.max(16, Math.round(p.size * (1.8 + p.heightFactor)))
          : Math.max(4, Math.round(p.size * p.heightFactor));

        const commonStyle: CSSProperties = {
          left: `${p.left}%`,
          top: -20,
          width,
          height,
          backgroundColor: isTriangle ? "transparent" : p.color,
          display: "inline-block",
          borderRadius: isCircle ? 9999 : isRibbon ? 9999 : 3,
          filter: `blur(${p.blur}px) drop-shadow(0 1px 1px rgba(0,0,0,0.15))`,
          willChange: "transform",
          transformOrigin: "center",
          clipPath: isTriangle ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
          backgroundImage: isRibbon
            ? "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.12))"
            : undefined,
        };

        const xFrames = [0, p.drift * 0.5, 0, -p.drift, 0, p.drift * 0.7, 0];

        return (
          <motion.span
            key={p.key}
            initial={{
              y: p.yFrom,
              x: 0,
              rotate: p.rotStart,
              rotateX: p.rotX,
              rotateY: p.rotY,
              opacity: p.opacity,
            }}
            animate={{
              y: 760,
              x: xFrames,
              rotate: p.rotStart + p.turns,
              rotateX: [p.rotX, -p.rotX, p.rotX],
              rotateY: [p.rotY, -p.rotY, p.rotY],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute"
            style={commonStyle}
          />
        );
      })}
    </div>
  );
}
