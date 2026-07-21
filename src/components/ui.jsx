import React from 'react';

export function Badge({ children, cor }) {
  return (
    <span style={{ 
      fontSize: 11, fontWeight: 700, padding: "4px 12px", 
      borderRadius: 999, color: "#fff", background: cor, 
      whiteSpace: "nowrap", letterSpacing: "0.03em" 
    }}>
      {children}
    </span>
  );
}

export function KPI({ titulo, valor, cor, sub, icon: Icon }) {
  return (
    <div className="glass fade" style={{ padding: 24, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: cor }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{titulo}</div>
        {Icon && <Icon size={20} color={cor} style={{ opacity: 0.8 }} />}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: "var(--ink)", margin: "12px 0 8px", fontFamily: "var(--font-display)" }}>{valor}</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>{sub}</div>
    </div>
  );
}

export function Modal({ children, onClose, titulo }) {
  return (
    <div onClick={onClose} style={{ 
      position: "fixed", inset: 0, background: "rgba(3,12,23,0.65)", 
      backdropFilter: "blur(6px)", display: "grid", placeItems: "center", 
      padding: 20, zIndex: 100 
    }}>
      <div onClick={(e) => e.stopPropagation()} className="glass fade" style={{ 
        padding: 32, width: 500, maxWidth: "100%", maxHeight: "90vh", 
        overflow: "auto", background: "var(--card-solid)" 
      }}>
        {titulo && <h2 style={{ marginTop: 0, marginBottom: 24, color: "var(--ink)" }}>{titulo}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Actions({ onSave, onClose }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
      <button className="btn btn-primary" onClick={onSave}>Salvar alterações</button>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
    </div>
  );
}
