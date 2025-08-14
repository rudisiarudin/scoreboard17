// src/types.ts

export interface PendingSpin {
  targetIndex: number;
  startedAt: number;
  durationMs: number;
  nonce: number;
}

export type WheelMode = 'idle' | 'spinning' | 'paused';

export interface WheelState {
  seed: number;
  queueIds: string[];
  activeIndex: number;

  // Fields yang memang dipakai di App & SpinWheel saat ini:
  isOpen: boolean;
  pendingSpin: PendingSpin | null;

  // (Opsional) tetap ada kalau file lain menggunakannya:
  mode?: WheelMode;
  startedAt?: number | null;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  // Tambahan field lain (jika ada) biarkan seperti semula
}

export interface Event {
  id: string;
  name: string;
  weight: number;
  // Tambahan field lain (jika ada) biarkan seperti semula
}

// eventId -> (teamId -> score)
export type Scores = Record<string, Record<string, number>>;

export interface BoardState {
  version: number;
  title?: string;
  currentEventId?: string | null;
  teams: Team[];
  events: Event[];
  scores: Scores;
  // penting: non-null supaya tidak kejadian WheelState | null
  wheel: WheelState;
}
