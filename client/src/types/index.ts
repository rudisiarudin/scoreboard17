// re-export semua tipe
export * from "./state";

// enum untuk status koneksi (dipakai di runtime)
export enum WSStatus {
  CONNECTING = "connecting",
  OPEN = "open",
  CLOSED = "closed",
  ERROR = "error",
}
