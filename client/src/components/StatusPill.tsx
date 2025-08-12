import { WSStatus } from "@/types/state";             // NILAI runtime
import type { WSStatus as WSStatusT } from "@/types"; // TIPE dari barrel

export default function StatusPill({ connected }: { connected: WSStatusT }) {
  const map = {
    [WSStatus.OPEN]:       { label: "Realtime",    color: "bg-red-600" },
    [WSStatus.CONNECTING]: { label: "Menyambung…", color: "bg-amber-500" },
    [WSStatus.CLOSED]:     { label: "Offline",     color: "bg-gray-400" },
    [WSStatus.ERROR]:      { label: "Offline",     color: "bg-gray-400" },
  } as const;

  const { label, color } = map[connected] ?? map[WSStatus.CLOSED];
  return (
    <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs text-white shadow ${color}`}>
      <span className="w-2 h-2 rounded-full bg-white/90" />{label}
    </span>
  );
}
