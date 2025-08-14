// src/hooks/useWS.ts
import { useEffect, useRef, useState } from "react";
import type { BoardState, WSStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

export function useWS(onRemote: (s: BoardState) => void, current: BoardState) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>("connecting");
  const clientId = useRef(uuidv4());
  const suppress = useRef(false);
  const deb = useRef<any>(null);

  useEffect(() => {
    let retry = 0, hb: any = null;
    function connect() {
      const ws = new WebSocket(WS_URL); wsRef.current = ws; setStatus("connecting");
      ws.onopen = () => {
        retry = 0; setStatus("online");
        ws.send(JSON.stringify({ type: "state", payload: current, source: clientId.current }));
        hb = setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({ type: "ping" })), 15000);
      };
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          if (d?.type === "state") {
            if (d.source === clientId.current) return;
            suppress.current = true; onRemote(d.payload as BoardState);
          }
        } catch {}
      };
      const down = () => {
        clearInterval(hb); setStatus("offline");
        const delay = Math.min(2000 * 2 ** retry, 15000) + Math.random() * 500;
        retry++; setTimeout(connect, delay);
      };
      ws.onclose = down; ws.onerror = down;
    }
    connect();
    return () => { try { wsRef.current?.close(); } catch {} };
  }, []);

  function broadcast(state: BoardState) {
    if (suppress.current) { suppress.current = false; return; }
    clearTimeout(deb.current);
    deb.current = setTimeout(() => {
      wsRef.current?.readyState === 1 &&
        wsRef.current.send(JSON.stringify({ type: "state", payload: state, source: clientId.current }));
    }, 80);
  }

  return { status, broadcast };
}
