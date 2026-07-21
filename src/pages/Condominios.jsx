import React from 'react';
import { Building2, Settings2, Trash2 } from 'lucide-react';

export function Condominios({ condominios, itens, diasAte, setModal, setCondAberto }) {
  return (
    <div className="fade">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: "var(--ink)", fontFamily: "var(--font-display)" }}>Condomínios</h2>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Gerenciamento de clientes e infraestruturas locais</div>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setModal({ tipo: "cond", data: {} })}>
          + Novo Condomínio
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {condominios.map((c) => {
          const nItens = itens.filter((i) => i.condId === c.id).length;
          const nAlerta = itens.filter((i) => i.condId === c.id && diasAte(i.validade) <= 30).length;
          
          return (
            <button 
              key={c.id} 
              className="glass" 
              onClick={() => setCondAberto(c)}
              style={{ 
                textAlign: "left", padding: 24, cursor: "pointer", border: "1px solid var(--line)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--cyan)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.25)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ 
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0, display: "grid", placeItems: "center", 
                  background: "rgba(40,182,232,0.1)", color: "var(--cyan)"
                }}>
                  <Building2 size={24} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 18, fontFamily: "var(--font-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.administradora || "Administração autônoma"}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 8 }}>
                  {nItens} {nItens === 1 ? "registro" : "registros"}
                </span>
                {nAlerta > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "var(--red)", padding: "4px 12px", borderRadius: 8 }}>
                    {nAlerta} alerta{nAlerta > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}
        
        {condominios.length === 0 && (
          <div className="glass" style={{ padding: 40, color: "var(--muted)", gridColumn: "1/-1", textAlign: "center" }}>
            Nenhum condomínio cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}
