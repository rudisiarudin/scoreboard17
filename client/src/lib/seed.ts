import type { BoardState } from "@/types";

export const initialState: BoardState = {
  version: 1,
  teams: [
    {
      id: "kel1",
      name: "Merdeka",
      color: "#EF4444",
      members: [
        "Andrias","Asmawati","Desi","Felly","Intan","Katherine","Pipin","Rayviansyah","Ruby","Tunggul","Widya"
      ],
    },
    {
      id: "kel2",
      name: "Bersatu",
      color: "#10B981",
      members: [
        "Asep","Irsan","Lisi","Neysa","Ramdoni","Ryandhi","Sariana","Thomas","Yohan"
      ],
    },
    {
      id: "kel3",
      name: "Berjuang",
      color: "#F97316",
      members: [
        "Coraevi","Dinny","Harvey","Hilaluddin","Juni","Kevin","Lydia","Petrus","Stephanie","Yunus"
      ],
    },
    {
      id: "kel4",
      name: "Bangkit",
      color: "#3B82F6",
      members: [
        "Aldri","Dwi","Eliaanti","Mian","Nancy","Nike","Said","Sarwono","Stefanini","Titis"
      ],
    },
    {
      id: "kel5",
      name: "Berdaulat",
      color: "#A855F7",
      members: [
        "Andri","Donny","Hadly","Merly","Novitasari","Parawinata","Rahmat","Suryadi","Susilo","Yudha","Yuni"
      ],
    },
    {
      id: "kel6",
      name: "Indonesia Jaya",
      color: "#F59E0B",
      members: [
        "Aditya","Ayu","Etty","Hansdi","Husni","Maradona","Romli","Saroh","Vanesha","Winarti"
      ],
    },
  ],
  // Contoh event; silakan ganti sesuai kebutuhanmu
  events: [
    { id: "ev1", name: "Lomba 1", weight: 100 },
    { id: "ev2", name: "Lomba 2", weight: 100 },
    { id: "ev3", name: "Lomba 3", weight: 100 },
  ],
  scores: {},
};
