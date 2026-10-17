import React from "react";
import { COR, MARCA } from "./marca";

/** Selo pequeno no canto superior esquerdo: pinos de plinko + nome. */
export const Logo: React.FC = () => (
  <div style={{ position: "absolute", left: 60, top: 304, display: "flex", alignItems: "center", gap: 14,
    padding: "8px 22px 8px 10px", borderRadius: 40, background: "rgba(10,5,40,0.55)",
    border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 6px 20px rgba(0,0,0,0.35)" }}>
    <svg width={44} height={44} viewBox="0 0 44 44">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COR.amarelo} /><stop offset="1" stopColor={COR.laranja} />
        </linearGradient>
      </defs>
      <rect width={44} height={44} rx={13} fill="url(#lg)" />
      <circle cx={22} cy={12} r={4} fill={COR.fundo} />
      <circle cx={13} cy={26} r={4} fill={COR.fundo} />
      <circle cx={31} cy={26} r={4} fill={COR.fundo} />
      <circle cx={22} cy={36} r={3} fill={COR.magenta} />
    </svg>
    <span style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: 30, color: "#fff", letterSpacing: 1.5 }}>{MARCA.nome}</span>
  </div>
);
