import type { BoardState } from "@/types";

export const initialState: BoardState = {
  version: 1,
  teams: [
    {
      id: "kel1",
      name: "KELOMPOK 1",
      color: "#EF4444",
      members: [
        "Andrias","Asmawati","Desi","Felly","Intan","Katherine","Pipin","Rayviansyah","Ruby","Tunggul","Widya"
      ],
    },
    {
      id: "kel2",
      name: "KELOMPOK 12",
      color: "#10B981",
      members: [
        "Asep","Irsan","Lisi","Neysa","Ramdoni","Ryandhi","Sariana","Thomas","Yohan"
      ],
    },
    {
      id: "kel3",
      name: "KELOMPOK 3",
      color: "#F97316",
      members: [
        "Coraevi","Dinny","Harvey","Hilaluddin","Juni","Kevin","Lydia","Petrus","Stephanie","Yunus"
      ],
    },
    {
      id: "kel4",
      name: "KELOMPOK 4",
      color: "#3B82F6",
      members: [
        "Aldri","Dwi","Eliaanti","Mian","Nancy","Nike","Said","Sarwono","Stefanini","Titis"
      ],
    },
    {
      id: "kel5",
      name: "KELOMPOK 5",
      color: "#A855F7",
      members: [
        "Andri","Donny","Hadly","Merly","Novitasari","Parawinata","Rahmat","Suryadi","Susilo","Yudha","Yuni"
      ],
    },
    {
      id: "KELOMPOK 6",
      name: "Indonesia Jaya",
      color: "#F59E0B",
      members: [
        "Aditya","Ayu","Etty","Hansdi","Husni","Maradona","Romli","Saroh","Vanesha","Winarti"
      ],
    },
  ],
  // Contoh event; silakan ganti sesuai kebutuhanmu
events: [
  { id: "ev-yelyel", name: "Penampilan Yel-Yel", weight: 20 },
  { id: "ev-gesit-think", name: "Lomba - The Gesit Way of Thinking", weight: 30 },
  { id: "ev-tebak-lagu", name: "Lomba Tebak Lagu Nasional", weight: 30 },
  { id: "ev-estafet-balon", name: "Lomba Estafet Balon", weight: 20 },
  { id: "ev-potluck", name: "Potluck Merah Putih", weight: 10 },
],
  scores: {},
};
