import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { BoardState } from "@/types";

type Options = { readOnly?: boolean; rowId?: string };

export function useSupabaseSync(
  state: BoardState,
  setState: (s: BoardState) => void,
  options: Options = {}
) {
  const rowId = options.rowId ?? "main";
  const readOnly = !!options.readOnly;
  const applyingRemote = useRef(false);

  // Load awal (+ seed hanya jika !readOnly)
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
        if (!readOnly) {
          await supabase.from("scoreboard").insert({
            id: rowId,
            state,
            version: state.version ?? 1,
          });
        }
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
  }, [rowId, readOnly]);

  // Subscribe realtime (selalu aktif, read/write sama)
  useEffect(() => {
    const channel = supabase
      .channel(`scoreboard:${rowId}`)
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
  }, [rowId, state.version]);

  // Push ke Supabase saat state berubah (SKIP kalau readOnly)
  useEffect(() => {
    if (readOnly || applyingRemote.current) return;
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
  }, [state, rowId, readOnly]);
}
