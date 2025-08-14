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

  // DIPAKAI di App.tsx & SpinWheel:
  isOpen: boolean;
  pendingSpin: PendingSpin | null;

  // JAGA KOMPATIBILITAS: kalau ada kode lain pakai ini, biarkan opsional
  mode?: WheelMode;
  startedAt?: number | null;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Event {
  id: string;
  name: string;
  weight: number;
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
  wheel: WheelState; // NON-NULL
}
