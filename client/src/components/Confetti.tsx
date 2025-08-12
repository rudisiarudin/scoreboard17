import { useMemo } from "react";
import { motion } from "framer-motion";

export default function Confetti({ pieces = 100 }: { pieces?: number }) {
  const seed = 20250812;
  const palette = [
    "#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#A78BFA", "#EC4899", "#22C55E", "#F97316", "#EAB308",
  ];

  const data = useMemo(() => {
    return Array.from({ length: pieces }, (_, i) => {
      let s = (seed + i * 1013904223) >>> 0;
      const rand = () => (s = (1664525 * s + 1013904223) >>> 0) / 0xffffffff;
      return {
        i,
        left: rand() * 100,
        size: 6 + Math.floor(rand() * 10),
        duration: 6 + rand() * 5,
        delay: rand() * 4,
        drift: rand() * 40 - 20,
        yStart: -50 - rand() * 200,
        rotateStart: rand() * 360,
        rotateTurns: 720 + rand() * 360,
        color: palette[Math.floor(rand() * palette.length)],
        circle: rand() > 0.82,
        opacity: 0.8 + rand() * 0.2,
        heightFactor: 0.6 + ((i % 3) * 0.2),
      };
    });
  }, [pieces]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50" aria-hidden>
      {data.map((p) => (
        <motion.span
          key={p.i}
          initial={{ y: p.yStart, x: 0, rotate: p.rotateStart, opacity: p.opacity }}
          animate={{ y: 700, x: [0, p.drift, 0, -p.drift, 0], rotate: p.rotateStart + p.rotateTurns }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          className="absolute"
          style={{
            left: `${p.left}%`, top: -20, width: p.size, height: Math.max(4, Math.round(p.size * p.heightFactor)),
            backgroundColor: p.color, display: "inline-block", borderRadius: p.circle ? 9999 : 2,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
          }}
        />
      ))}
    </div>
  );
}
