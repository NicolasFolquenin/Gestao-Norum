import React from 'react';
import { Calendar, Receipt, MoreVertical } from 'lucide-react';

export function Servicos({ servicos, setModal, excluir, nomeCliente, brl, fmtData, STATUS_NOTA, diasAte }) {
  return (
    <div className="fade">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: "var(--ink)", fontFamily: "var(--font-display)" }}>Agenda de Serviços</h2>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Programação de manutenções e faturamento</div>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setModal({ tipo: "servico", data: { status: "nao_emitida", valor: 0 } })}>
          + Agendar Serviço
        </button>
      </div>

      <div className="glass" style={{ overflow: "hidden" }}>
        {servicos.length === 0 ? (
          <div style={{ padding: 40, color: "var(--muted)", textAlign: "center" }}>
            Nenhum serviço agendado no momento.
          </div>
        ) : (
          <div className="data-grid" style={{ padding: 12 }}>
            <div className="data-header">
              <div style={{ width: 110 }}>Data</div>
              <div style={{ flex: 1.5 }}>Serviço</div>
              <div style={{ flex: 1 }}>Condomínio</div>
              <div style={{ width: 120 }}>Valor</div>
              <div style={{ width: 180 }}>Situação Fiscal</div>
              <div style={{ width: 120, textAlign: "right" }}>Ações</div>
            </div>
            
            {[...servicos].sort((a, b) => a.data.localeCompare(b.data)).map(s => {
              const d = diasAte(s.data);
              const proximo = d >= 0 && d <= 7;
              
              return (
                <div key={s.id} className="data-row">
                  <div className="data-cell" style={{ width: 110 }}>
                    <div style={{ 
                      fontWeight: proximo ? 700 : 500, 
                      color: proximo ? "var(--cyan)" : "var(--ink)" 
                    }}>
                      {fmtData(s.data)}
                    </div>
                  </div>
                  
                  <div className="data-cell" style={{ flex: 1.5, fontWeight: 500 }}>
                    {s.titulo}
                  </div>
                  
                  <div className="data-cell" style={{ flex: 1, color: "var(--muted)" }}>
                    {nomeCliente(s)}
                  </div>
                  
                  <div className="data-cell" style={{ width: 120, fontWeight: 600 }}>
                    {brl(s.valor)}
                  </div>
                  
                  <div className="data-cell" style={{ width: 180 }}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, 
                      color: STATUS_NOTA[s.status].cor, background: `${STATUS_NOTA[s.status].cor}15` 
                    }}>
                      {STATUS_NOTA[s.status].label}
                    </span>
                  </div>
                  
                  <div className="data-cell" style={{ width: 120, textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button className="btn btn-ghost" style={{ padding: "8px 12px" }} onClick={() => setModal({ tipo: "servico", data: s })}>
                      Editar
                    </button>
                    <button className="btn btn-ghost" style={{ padding: "8px", color: "var(--red)" }} onClick={() => excluir("servicos", s.id)}>
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
