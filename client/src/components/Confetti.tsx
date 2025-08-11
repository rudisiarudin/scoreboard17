import { useMemo } from "react";

export default function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 70 }), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      <style>{`@keyframes fall { to { transform: translate3d(var(--x), 110vh, 0) rotate(var(--r)); opacity: 0.9; } }`}</style>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const dur = 1.6 + Math.random() * 0.9;
        const x = (-20 + Math.random() * 40).toFixed(1) + "vw";
        const r = (90 + Math.random() * 180).toFixed(1) + "deg";
        const bg = i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#ffffff" : "#fecaca";
        const size = 6 + Math.random() * 10;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-10vh",
              left: left + "vw",
              width: size,
              height: size * 0.6,
              background: bg,
              borderRadius: 2,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
              animation: `fall ${dur}s ease-in forwards`,
              animationDelay: `${delay}s`,
              transform: "translate3d(0,-10vh,0)",
              // @ts-ignore
              ["--x" as any]: x,
              ["--r" as any]: r,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
