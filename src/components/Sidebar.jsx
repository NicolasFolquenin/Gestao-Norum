import React from 'react';
import { LayoutDashboard, FireExtinguisher, Droplets, UtensilsCrossed, Calendar, FileText, Receipt, Building2, LogOut } from 'lucide-react';

const NAV = [
  { k: "painel", label: "Painel de controle", icon: LayoutDashboard },
  { k: "extintor", label: "Extintores", icon: FireExtinguisher },
  { k: "caixa_dagua", label: "Reservatórios de água", icon: Droplets },
  { k: "caixa_gordura", label: "Caixas de gordura", icon: UtensilsCrossed },
  { k: "agenda", label: "Agenda de serviços", icon: Calendar },
  { k: "mensal", label: "Relatório mensal", icon: FileText },
  { k: "financeiro", label: "Financeiro", icon: Receipt },
  { k: "condominios", label: "Condomínios", icon: Building2 },
];

export function Sidebar({ aba, setAba, alertas, usuario, sair }) {
  return (
    <aside style={{ 
      width: 280, flexShrink: 0, 
      background: "var(--navy-dk)", 
      borderRight: "1px solid var(--line)",
      padding: "32px 20px", display: "flex", flexDirection: "column", gap: 8, 
      position: "sticky", top: 0, height: "100vh" 
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 8px 32px" }}>
        <div style={{
          width: 44, height: 44, background: "var(--cyan)", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--navy-dk)", fontWeight: 900, fontSize: 24, fontFamily: "var(--font-display)"
        }}>
          N
        </div>
        <div>
          <div style={{ fontWeight: 800, letterSpacing: "0.1em", fontSize: 20, fontFamily: "var(--font-display)" }}>NORUM</div>
          <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: "0.2em", textTransform: "uppercase" }}>Engenharia</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((n) => {
          const isActive = aba === n.k;
          const Icon = n.icon;
          return (
            <button 
              key={n.k} 
              onClick={() => setAba(n.k)}
              style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%",
                background: isActive ? "rgba(40,182,232,0.1)" : "transparent",
                color: isActive ? "var(--ink)" : "var(--muted)",
                padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                fontSize: 14, fontWeight: isActive ? 600 : 500, border: "none",
                transition: "all 0.2s", position: "relative"
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.color = "var(--ink)";
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--muted)";
                }
              }}
            >
              {isActive && <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 4, borderRadius: 4, background: "var(--cyan)" }} />}
              <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
              {n.label}
              {n.k === "painel" && alertas > 0 && (
                <span style={{ 
                  marginLeft: "auto", background: "var(--red)", borderRadius: 999, 
                  fontSize: 11, fontWeight: 800, padding: "2px 8px", color: "#fff"
                }}>
                  {alertas}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{usuario}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Sessão ativa</div>
        </div>
        <button onClick={sair} style={{ 
          background: "rgba(255,255,255,0.05)", border: "none", color: "var(--muted)", 
          padding: 8, borderRadius: 8, cursor: "pointer", transition: "all 0.2s" 
        }} title="Encerrar sessão" onMouseEnter={e => e.currentTarget.style.color = "var(--red)"} onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
