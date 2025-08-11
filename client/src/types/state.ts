import type { BoardState, Event, Team } from "@/types";
const STORAGE_KEY = "scoreboard6.multilomba.ui.v8.poster";
const SCHEMA = 2;
const DEFAULT_TEAM_IDS = ["team-1","team-2","team-3","team-4","team-5","team-6"];

export function createDefaultTeams(): Team[] {
  const names = ["Kelompok 1","Kelompok 2","Kelompok 3","Kelompok 4","Kelompok 5","Kelompok 6"];
  const reds  = ["#b91c1c","#dc2626","#ef4444","#f97316","#fb7185","#e11d48"];
  return names.map((n,i)=>({ id: DEFAULT_TEAM_IDS[i], name:n, color: reds[i%reds.length]}));
}
export function createDefaultEvents(): Event[] {
  return [
    { id:"evt-yelyel",  name:"Penampilan Yel-Yel", weight:20 },
    { id:"evt-gesit",   name:"Lomba - The Gesit Way of Thinking", weight:20 },
    { id:"evt-lagu",    name:"Lomba Tebak Lagu Nasional", weight:20 },
    { id:"evt-estafet", name:"Lomba Estafet Balon", weight:20 },
    { id:"evt-costume", name:"Best Costume", weight:10 },
    { id:"evt-potluck", name:"Potluck Merah Putih – Cita Rasa Nusantara", weight:10 },
  ];
}
export function blankScores(events: Event[], teams: Team[]) {
  const s: any = {}; for (const e of events) { s[e.id]={}; for (const t of teams) s[e.id][t.id]=0; } return s;
}
function fresh(): BoardState {
  const teams = createDefaultTeams(); const events = createDefaultEvents();
  return { title:"Skor 17 Agustusan – Multi Lomba (6 Kelompok)", version:1, teams, events, scores: blankScores(events,teams), schema: SCHEMA };
}
export function loadState(): BoardState {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return fresh();
    const parsed = JSON.parse(raw); if (parsed?.schema !== SCHEMA) return { ...fresh(), ...parsed, schema: SCHEMA }; return parsed;
  } catch { return fresh(); }
}
export function saveState(s: BoardState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, schema: SCHEMA })); } catch {} }
