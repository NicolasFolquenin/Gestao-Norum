import React from 'react';
import { KPI } from '../components/ui';
import { AlertCircle, Wallet, FileCheck, CheckCircle2 } from 'lucide-react';

export function Dashboard({ alertas, aReceber, naoEmitido, recebido, registrarManut, nomeCliente, diasAte, TIPOS_ITEM, brl, fmtData }) {
  return (
    <div className="fade">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
        <KPI titulo="Itens em alerta" valor={alertas.length} cor="var(--red)" sub="Vencidos ou vencendo em 30d" icon={AlertCircle} />
        <KPI titulo="Valores a receber" valor={brl(aReceber)} cor="var(--yellow)" sub="Notas emitidas aguardando pgto" icon={Wallet} />
        <KPI titulo="A faturar" valor={brl(naoEmitido)} cor="var(--orange)" sub="Serviços pendentes de nota" icon={FileCheck} />
        <KPI titulo="Receita realizada" valor={brl(recebido)} cor="var(--green)" sub="Notas liquidadas" icon={CheckCircle2} />
      </div>

      <div className="glass" style={{ overflow: "hidden" }}>
        <div style={{ 
          padding: "20px 24px", fontWeight: 700, color: "var(--ink)", 
          borderBottom: "1px solid var(--line)", fontFamily: "var(--font-display)",
          fontSize: 18, display: "flex", alignItems: "center", gap: 12
        }}>
          <AlertCircle size={20} color="var(--red)" />
          Atenção Imediata Necessária
        </div>
        
        {alertas.length === 0 ? (
          <div style={{ padding: 40, color: "var(--muted)", textAlign: "center" }}>
            Ambiente seguro. Não há itens vencidos ou a vencer.
          </div>
        ) : (
          <div className="data-grid" style={{ padding: 12 }}>
            <div className="data-header">
              <div style={{ flex: 1.5 }}>Item Monitorado</div>
              <div style={{ flex: 1.5 }}>Local / Condomínio</div>
              <div style={{ flex: 1 }}>Status</div>
              <div style={{ width: 180, textAlign: "right" }}>Ação</div>
            </div>
            
            {alertas.map(i => {
              const dias = diasAte(i.validade);
              const isVencido = dias < 0;
              const T = TIPOS_ITEM[i.tipo];
              
              return (
                <div key={i.id} className="data-row">
                  <div className="data-cell" style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 10, background: `${T.cor}15`, 
                      color: T.cor, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12
                    }}>
                      {T.cod}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--ink)" }}>{T.label}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Vence em: {fmtData(i.validade)}</div>
                    </div>
                  </div>
                  
                  <div className="data-cell" style={{ flex: 1.5 }}>
                    <div style={{ fontWeight: 500, color: "var(--ink)" }}>{i.local}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{nomeCliente(i)}</div>
                  </div>
                  
                  <div className="data-cell" style={{ flex: 1 }}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, 
                      color: isVencido ? "var(--red)" : "var(--yellow)", 
                      background: isVencido ? "rgba(229, 88, 79, 0.1)" : "rgba(245, 185, 33, 0.1)",
                      border: `1px solid ${isVencido ? "rgba(229, 88, 79, 0.3)" : "rgba(245, 185, 33, 0.3)"}`
                    }}>
                      {isVencido ? `Vencido há ${Math.abs(dias)} dias` : `Vence em ${dias} dias`}
                    </span>
                  </div>
                  
                  <div className="data-cell" style={{ width: 180, textAlign: "right" }}>
                    <button className="btn btn-primary" onClick={() => registrarManut(i)}>
                      Registrar
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
