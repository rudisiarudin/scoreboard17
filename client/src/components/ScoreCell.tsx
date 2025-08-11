import { useEffect, useRef, useState } from "react";

export default function ScoreCell({ value }:{ value:number }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(()=> {
    if (value !== prev.current) { setFlash(true); const t=setTimeout(()=>setFlash(false), 600); prev.current=value; return ()=>clearTimeout(t); }
  }, [value]);
  return (
    <span className={`tabular-nums transition-colors duration-500 ${flash ? "bg-yellow-200 px-1 rounded" : ""}`}>
      {value}
    </span>
  );
}
