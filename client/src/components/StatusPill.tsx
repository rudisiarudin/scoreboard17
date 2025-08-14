// src/components/StatusPill.tsx
import type { WSStatus } from "@/types";

export default function StatusPill({ connected }: { connected: WSStatus }) {
  const label =
    connected === "online" ? "Realtime" :
    connected === "connecting" ? "Menyambung…" :
    "Offline";

  const color =
    connected === "online" ? "bg-red-600" :
    connected === "connecting" ? "bg-amber-500" :
    "bg-gray-400";

  return (
    <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs text-white shadow ${color}`}>
      <span className="w-2 h-2 rounded-full bg-white/90" />
      {label}
    </span>
  );
}
