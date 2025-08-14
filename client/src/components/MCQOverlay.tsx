import { useEffect } from "react";

export type MCQ = {
  id: string;
  text: string;
  choices: string[];   // 4 opsi
  correct?: number;    // index 0..3 (opsional)
  imageUrl?: string;
};

export default function MCQOverlay({
  open,
  mcq,
  selected,
  reveal,
  visible,
  readonly,
  onSelect,
  onReveal,
  onClose,
  onPrev,
  onNext,
  onRandom,
  onNextOption,
  onResetOptions,
  onShowAllOptions,
}: {
  open: boolean;
  mcq: MCQ | null;
  selected: number | null;
  reveal: boolean;
  visible: number;
  readonly?: boolean;
  onSelect: (i: number) => void;
  onReveal: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onNextOption: () => void;
  onResetOptions: () => void;
  onShowAllOptions: () => void;
}) {
  // Hotkeys untuk OPERATOR saja
  useEffect(() => {
    if (!open || readonly) return;
    const onKey = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) onSelect(Number(e.key) - 1);
      else if (e.key === " ") { e.preventDefault(); onReveal(); }
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key.toLowerCase() === "n") onNextOption();
      else if (e.key === "0") onResetOptions();
      else if (e.key.toLowerCase() === "a" && e.shiftKey) onShowAllOptions();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, readonly, onSelect, onReveal, onPrev, onNext, onNextOption, onResetOptions, onShowAllOptions, onClose]);

  if (!open || !mcq) return null;

  const total = mcq.choices.length;
  const shown = Math.max(0, Math.min(visible, total));

  /* ===================== MODE PENONTON (readonly) ===================== */
  if (readonly) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center">
        <div className="relative w-full max-w-5xl mx-4 rounded-3xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
          <div className="p-7 space-y-6">
            {/* Soal besar */}
            <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 text-center leading-snug">
              {mcq.text}
            </div>

            {/* Gambar (opsional) */}
            {mcq.imageUrl && (
              <div className="rounded-2xl overflow-hidden border">
                <img src={mcq.imageUrl} alt="" className="w-full object-contain" />
              </div>
            )}

            {/* Pilihan (tampilkan satu-per-satu) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcq.choices.map((c, i) => {
                const isVisible = i < shown || reveal;
                if (!isVisible) return null; // penonton: yang belum diumumkan jangan tampil

                const isCorrect = mcq.correct === i;
                const isSel = selected === i;

                let cls =
                  "w-full text-left rounded-xl border px-4 py-4 text-[16px] transition flex items-center gap-3 h-[64px]";
                if (reveal && mcq.correct != null) {
                  cls += isCorrect
                    ? " border-green-300 bg-green-50"
                    : isSel
                    ? " border-red-300 bg-red-50"
                    : " border-neutral-200 bg-white";
                } else {
                  cls += " border-neutral-200 bg-white";
                }

                return (
                  <div key={i} className={cls}>
                    <span className="inline-flex w-8 h-8 rounded-full border items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{c}</span>
                  </div>
                );
              })}
            </div>

            {/* Info jawaban (opsional) */}
            {reveal && mcq.correct != null && (
              <div className="text-base text-green-700 font-semibold text-center">
                Jawaban Benar: {String.fromCharCode(65 + mcq.correct)} — {mcq.choices[mcq.correct]}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== MODE OPERATOR (lengkap) ===================== */
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
      <div className="relative w-full max-w-5xl mx-4 rounded-3xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="font-semibold text-neutral-800">Lomba — The Gesit Way of Thinking</div>
          <div className="text-xs text-neutral-500">
            Hotkeys: N=Next opsi • 0=Reset opsi • Shift+A=Tampilkan semua • 1–4=pilih • Space=jawaban • ←/→ pindah soal • Esc=tutup
          </div>
        </div>

        {/* Konten */}
        <div className="p-7 space-y-6">
          {/* Soal besar */}
          <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 text-center leading-snug">
            {mcq.text}
          </div>

          {/* Gambar (opsional) */}
          {mcq.imageUrl && (
            <div className="rounded-2xl overflow-hidden border">
              <img src={mcq.imageUrl} alt="" className="w-full object-contain" />
            </div>
          )}

          {/* Pilihan — tampilkan satu-per-satu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mcq.choices.map((c, i) => {
              const isVisible = i < shown || reveal;
              const isSel = selected === i;
              const isCorrect = mcq.correct === i;

              if (!isVisible) {
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 px-4 py-4 text-neutral-400 flex items-center gap-3 h-[64px]"
                  >
                    <span className="inline-flex w-8 h-8 rounded-full border items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm italic opacity-70">Opsi akan diumumkan…</span>
                  </div>
                );
              }

              let cls =
                "w-full text-left rounded-xl border px-4 py-4 text-[15px] transition flex items-center gap-3 h-[64px]";
              if (reveal && mcq.correct != null) {
                cls += isCorrect
                  ? " border-green-300 bg-green-50"
                  : isSel
                  ? " border-red-300 bg-red-50"
                  : " border-neutral-200 bg-white";
              } else {
                cls += isSel ? " border-indigo-300 bg-indigo-50" : " border-neutral-200 bg-white hover:bg-neutral-50";
              }

              return (
                <button key={i} onClick={() => onSelect(i)} className={cls}>
                  <span className="inline-flex w-8 h-8 rounded-full border items-center justify-center text-sm font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[16px]">{c}</span>
                </button>
              );
            })}
          </div>

          {/* Info jawaban */}
          {reveal && mcq.correct != null && (
            <div className="text-base text-green-700 font-semibold text-center">
              Jawaban Benar: {String.fromCharCode(65 + mcq.correct)} — {mcq.choices[mcq.correct]}
            </div>
          )}
        </div>

        {/* Toolbar bawah (operator) */}
        <div className="px-6 py-4 border-t bg-neutral-50 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-neutral-500">
            MC membacakan opsi; tampilkan satu-per-satu. Setelah peserta menjawab, tampilkan jawaban.
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onPrev} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50">Sebelumnya</button>
            <button onClick={onNext} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50">Berikutnya</button>
            <button onClick={onRandom} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50">Acak Soal</button>

            <div className="w-px h-6 bg-neutral-300 mx-1" />

            <button onClick={onNextOption} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50">Next Opsi</button>
            <button onClick={onResetOptions} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50">Reset Opsi</button>
            <button onClick={onShowAllOptions} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50">Tampilkan Semua</button>

            {!reveal && (
              <button onClick={onReveal} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">
                Tampilkan Jawaban
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-xl border bg-white hover:bg-neutral-50">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}
