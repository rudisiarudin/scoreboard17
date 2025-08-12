// client/src/hooks/useSupabaseSync.ts
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { BoardState } from "@/types";

export function useSupabaseSync(
  state: BoardState,
  setState: (s: BoardState) => void,
  rowId = "main"
) {
  const applyingRemote = useRef(false);

  // Load awal & seed
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("scoreboard")
        .select("state, version")
        .eq("id", rowId)
        .maybeSingle();

      if (error) {
        console.warn("Supabase load error:", error);
        return;
      }
      if (!data) {
        await supabase.from("scoreboard").insert({
          id: rowId,
          state,
          version: state.version ?? 1,
        });
        return;
      }
      const remote = data.state as BoardState | undefined;
      const rv = (data.version as number) ?? 0;
      if (remote && rv > (state.version ?? 0)) {
        applyingRemote.current = true;
        setState(remote);
        applyingRemote.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe realtime
  useEffect(() => {
    const channel = supabase
      .channel("scoreboard:main")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scoreboard", filter: `id=eq.${rowId}` },
        (payload) => {
          try {
            const remote = (payload.new as any)?.state as BoardState | undefined;
            const rv = (payload.new as any)?.version as number | undefined;
            if (!remote || !rv) return;
            if (rv > (state.version ?? 0)) {
              applyingRemote.current = true;
              setState(remote);
              applyingRemote.current = false;
            }
          } catch (e) {
            console.warn("Realtime parse failed:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.version]);

  // Push setiap perubahan lokal (debounce kecil)
  useEffect(() => {
    if (applyingRemote.current) return;
    const t = setTimeout(async () => {
      const { error } = await supabase
        .from("scoreboard")
        .update({
          state,
          version: state.version ?? 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rowId);
      if (error) console.warn("Supabase push error:", error);
    }, 120);
    return () => clearTimeout(t);
  }, [state, rowId]);
}
