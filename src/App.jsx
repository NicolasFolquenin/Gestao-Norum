import React, { useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigurado } from "./supabase.js";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Condominios } from "./pages/Condominios";
import { Servicos } from "./pages/Servicos";
import { Modal, Actions } from "./components/ui";
import { Settings, Shield } from "lucide-react";
import { TelaLogin, Saudacao } from "./components/TelaLogin";
import './styles/global.css';

const TIPOS_ITEM = {
  extintor: { label: "Extintores", validadeMeses: 12, cod: "EXT", cor: "var(--red)" },
  caixa_gordura: { label: "Caixas de gordura", validadeMeses: 6, cod: "CXG", cor: "var(--orange)" },
  caixa_dagua: { label: "Reservatório de água", validadeMeses: 6, cod: "RSV", cor: "var(--cyan)" },
};
const STATUS_NOTA = {
  nao_emitida: { label: "Nota fiscal pendente", cor: "var(--muted)" },
  emitida_nao_paga: { label: "Emitida aguardando pgto", cor: "var(--yellow)" },
  paga: { label: "Liquidada", cor: "var(--green)" },
};

const uid = () => Math.random().toString(36).slice(2, 10);
const AVULSO = "__avulso__"; 
const hoje = () => new Date().toISOString().slice(0, 10);
const addMeses = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
const diasAte = (d) => Math.round((new Date(d) - new Date(hoje())) / 86400000);
const fmtData = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
const brl = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const nuloSeAvulso = (condId) => (condId === AVULSO ? null : condId);
const condDeLinha = (r) => ({ id: r.id, nome: r.nome, endereco: r.endereco || "", sindico: r.sindico || "", telefone: r.telefone || "", administradora: r.administradora || "" });
const condParaLinha = (c) => ({ nome: c.nome, endereco: c.endereco || null, sindico: c.sindico || null, telefone: c.telefone || null, administradora: c.administradora || null });
const itemDeLinha = (r) => ({ id: r.id, condId: r.condominio_id || AVULSO, clienteAvulso: r.cliente_avulso || "", tipo: r.tipo, local: r.local, ultima: r.ultima_manutencao, validade: r.validade });
const itemParaLinha = (i) => ({ condominio_id: nuloSeAvulso(i.condId), cliente_avulso: i.condId === AVULSO ? (i.clienteAvulso || "Avulso") : null, tipo: i.tipo, local: i.local, periodicidade_meses: TIPOS_ITEM[i.tipo].validadeMeses, ultima_manutencao: i.ultima, validade: i.validade });
const servDeLinha = (r) => ({ id: r.id, condId: r.condominio_id || AVULSO, clienteAvulso: r.cliente_avulso || "", titulo: r.titulo, data: r.data_agendada, valor: Number(r.valor), status: r.status_nota, nfNumero: r.nf_numero || "", pgtoData: r.pago_em || "" });
const servParaLinha = (s) => ({ condominio_id: nuloSeAvulso(s.condId), cliente_avulso: s.condId === AVULSO ? (s.clienteAvulso || "Avulso") : null, titulo: s.titulo, data_agendada: s.data, valor: s.valor, status_nota: s.status, nf_numero: s.nfNumero || null, nf_emitida_em: s.status !== "nao_emitida" ? (s.nfEmitidaEm || hoje()) : null, pago_em: s.pgtoData || null });

async function carregarTudo() {
  const [c, i, s] = await Promise.all([
    supabase.from("condominios").select("*").order("nome"),
    supabase.from("itens_monitorados").select("*"),
    supabase.from("servicos").select("*"),
  ]);
  if (c.error || i.error || s.error) throw (c.error || i.error || s.error);
  return {
    condominios: (c.data || []).map(condDeLinha),
    itens: (i.data || []).map(itemDeLinha),
    servicos: (s.data || []).map(servDeLinha),
  };
}

export default function App() {
  const [db, setDb] = useState(null);
  const [aba, setAba] = useState("painel");
  const [condFiltro, setCondFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [condAberto, setCondAberto] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [saudacao, setSaudacao] = useState(false);
  const [erroBanco, setErroBanco] = useState("");

  const recarregar = useCallback(async () => {
    try { setDb(await carregarTudo()); setErroBanco(""); }
    catch (e) { setErroBanco(e.message || "Falha ao carregar dados."); setDb({ condominios: [], itens: [], servicos: [] }); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setUsuario(data.session.user.email.split("@")[0].toUpperCase());
        recarregar();
      }
    });
  }, [recarregar]);

  const aoEntrar = async (nome) => { setUsuario(nome); setSaudacao(true); await recarregar(); };
  const sair = async () => { await supabase.auth.signOut(); setUsuario(null); setDb(null); setAba("painel"); };

  if (!usuario) return <TelaLogin onEntrar={aoEntrar} />;
  if (!db) return <div style={{ padding: 40, fontFamily: "var(--font-display)" }}>Carregando arquitetura de dados…</div>;

  const condById = (id) => id === AVULSO ? { id: AVULSO, nome: "Avulso / sem condomínio" } : db.condominios.find((c) => c.id === id);
  const opcoesCliente = [...db.condominios, { id: AVULSO, nome: "Avulso / sem condomínio" }];
  const nomeCliente = (reg) => reg.condId === AVULSO ? (reg.clienteAvulso ? `${reg.clienteAvulso} (avulso)` : "Avulso") : (condById(reg.condId)?.nome || "—");
  const filtra = (arr) => condFiltro === "todos" ? arr : arr.filter((x) => x.condId === condFiltro);
  const itens = filtra(db.itens), servicos = filtra(db.servicos);

  const alertas = db.itens.map((i) => ({ ...i, dias: diasAte(i.validade) })).filter((i) => i.dias <= 30).sort((a, b) => a.dias - b.dias);
  const aReceber = db.servicos.filter((s) => s.status === "emitida_nao_paga").reduce((t, s) => t + s.valor, 0);
  const naoEmitido = db.servicos.filter((s) => s.status === "nao_emitida").reduce((t, s) => t + s.valor, 0);
  const recebido = db.servicos.filter((s) => s.status === "paga").reduce((t, s) => t + s.valor, 0);

  const erroAlerta = (e) => alert("Erro: " + (e.message || e));

  const salvarCond = async (d) => {
    const { error } = d.id ? await supabase.from("condominios").update(condParaLinha(d)).eq("id", d.id) : await supabase.from("condominios").insert(condParaLinha(d));
    if (error) return erroAlerta(error);
    setModal(null); await recarregar();
  };
  const salvarItem = async (d) => {
    const validade = d.validade || addMeses(d.ultima, TIPOS_ITEM[d.tipo].validadeMeses);
    const { error } = d.id ? await supabase.from("itens_monitorados").update(itemParaLinha({ ...d, validade })).eq("id", d.id) : await supabase.from("itens_monitorados").insert(itemParaLinha({ ...d, validade }));
    if (error) return erroAlerta(error);
    setModal(null); await recarregar();
  };
  const registrarManut = async (item) => {
    const u = hoje(); const validade = addMeses(u, TIPOS_ITEM[item.tipo].validadeMeses);
    const { error } = await supabase.from("itens_monitorados").update({ ultima_manutencao: u, validade }).eq("id", item.id);
    if (error) return erroAlerta(error);
    await recarregar();
  };
  const salvarServico = async (d) => {
    const { error } = d.id ? await supabase.from("servicos").update(servParaLinha(d)).eq("id", d.id) : await supabase.from("servicos").insert(servParaLinha(d));
    if (error) return erroAlerta(error);
    setModal(null); await recarregar();
  };
  const excluir = async (col, id) => {
    if (!confirm("Excluir definitivamente este registro?")) return;
    const { error } = await supabase.from(col).delete().eq("id", id);
    if (error) return erroAlerta(error);
    await recarregar();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {saudacao && <Saudacao usuario={usuario} onFim={() => setSaudacao(false)} />}
      <Sidebar aba={aba} setAba={setAba} alertas={alertas.length} usuario={usuario} sair={sair} />
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, padding: 32 }}>
        <header style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <select value={condFiltro} onChange={(e) => setCondFiltro(e.target.value)} style={{ width: 280 }}>
            <option value="todos">Todos os condomínios / clientes</option>
            {db.condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <button className="btn btn-ghost"><Settings size={18} /></button>
          </div>
        </header>

        <main style={{ flex: 1, paddingBottom: 60 }}>
          {aba === "painel" && <Dashboard {...{alertas, aReceber, naoEmitido, recebido, registrarManut, nomeCliente, diasAte, TIPOS_ITEM, brl, fmtData}} />}
          {aba === "condominios" && <Condominios {...{condominios: db.condominios, itens: db.itens, diasAte, setModal, setCondAberto}} />}
          {aba === "agenda" && <Servicos {...{servicos, setModal, excluir, nomeCliente, brl, fmtData, STATUS_NOTA, diasAte}} />}
          
          {TIPOS_ITEM[aba] && (
            <div className="fade">
              <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, color: "var(--ink)", fontFamily: "var(--font-display)" }}>{TIPOS_ITEM[aba].label}</h2>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Monitoramento e revisão periódica (a cada {TIPOS_ITEM[aba].validadeMeses} meses)</div>
                </div>
                <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setModal({ tipo: "item", data: { tipo: aba, ultima: hoje() } })}>
                  + Cadastrar Registro
                </button>
              </div>
              <div className="glass" style={{ overflow: "hidden" }}>
                <div className="data-grid" style={{ padding: 12 }}>
                  <div className="data-header">
                    <div style={{ flex: 1.5 }}>Identificação / Local</div>
                    <div style={{ flex: 1.5 }}>Condomínio</div>
                    <div style={{ flex: 1 }}>Última Rev.</div>
                    <div style={{ flex: 1 }}>Validade</div>
                    <div style={{ width: 140, textAlign: "right" }}>Ações</div>
                  </div>
                  {itens.filter(i => i.tipo === aba).map(i => (
                    <div key={i.id} className="data-row">
                      <div className="data-cell" style={{ flex: 1.5, fontWeight: 600 }}>{i.local}</div>
                      <div className="data-cell" style={{ flex: 1.5, color: "var(--muted)" }}>{nomeCliente(i)}</div>
                      <div className="data-cell" style={{ flex: 1 }}>{fmtData(i.ultima)}</div>
                      <div className="data-cell" style={{ flex: 1 }}>
                        <span style={{ 
                          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, 
                          color: diasAte(i.validade) < 0 ? "var(--red)" : "var(--green)", 
                          background: diasAte(i.validade) < 0 ? "rgba(229,88,79,0.1)" : "rgba(46,209,143,0.1)" 
                        }}>
                          {fmtData(i.validade)}
                        </span>
                      </div>
                      <div className="data-cell" style={{ width: 140, textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => registrarManut(i)}>Renovar</button>
                        <button className="btn btn-ghost" style={{ padding: "6px", color: "var(--red)" }} onClick={() => excluir("itens_monitorados", i.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {modal?.tipo === "cond" && (
        <Modal titulo={modal.data.id ? "Editar Condomínio" : "Novo Condomínio"} onClose={() => setModal(null)}>
          <label>Nome do condomínio</label><input value={modal.data.nome||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, nome: e.target.value }})} placeholder="Ex.: Edifício Central" />
          <label>Endereço</label><input value={modal.data.endereco||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, endereco: e.target.value }})} />
          <label>Síndico(a)</label><input value={modal.data.sindico||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, sindico: e.target.value }})} />
          <label>Administradora</label><input value={modal.data.administradora||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, administradora: e.target.value }})} />
          <Actions onSave={() => salvarCond(modal.data)} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal?.tipo === "item" && (
        <Modal titulo="Registro de Equipamento" onClose={() => setModal(null)}>
          <label>Cliente</label>
          <select value={modal.data.condId||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, condId: e.target.value }})}>
            {opcoesCliente.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label>Localização / Ref</label><input value={modal.data.local||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, local: e.target.value }})} />
          <label>Última Manutenção</label><input type="date" value={modal.data.ultima||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, ultima: e.target.value }})} />
          <Actions onSave={() => salvarItem(modal.data)} onClose={() => setModal(null)} />
        </Modal>
      )}
      
      {modal?.tipo === "servico" && (
        <Modal titulo="Agendar Serviço" onClose={() => setModal(null)}>
          <label>Cliente</label>
          <select value={modal.data.condId||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, condId: e.target.value }})}>
            {opcoesCliente.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label>Descrição</label><input value={modal.data.titulo||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, titulo: e.target.value }})} />
          <label>Data</label><input type="date" value={modal.data.data||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, data: e.target.value }})} />
          <label>Valor R$</label><input type="number" value={modal.data.valor||""} onChange={(e) => setModal({ ...modal, data: { ...modal.data, valor: parseFloat(e.target.value) }})} />
          <Actions onSave={() => salvarServico(modal.data)} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function TelaLogin({ onEntrar }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  
  const entrar = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({ email: login, password: senha });
    if (!error) onEntrar(data.session.user.email.split("@")[0]);
  };
  
  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <div className="glass fade" style={{ padding: 48, width: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <Shield size={32} color="var(--cyan)" />
          <div>
            <div style={{ color: "var(--ink)", fontWeight: 800, letterSpacing: 2, fontSize: 24, fontFamily: "var(--font-display)" }}>NORUM</div>
            <div style={{ color: "var(--muted)", fontSize: 11, letterSpacing: 1.5 }}>ENGENHARIA</div>
          </div>
        </div>
        <label>Usuário Administrativo</label>
        <input value={login} onChange={(e) => setLogin(e.target.value)} style={{ marginBottom: 16 }} />
        <label>Senha de Acesso</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ marginBottom: 24 }} />
        <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 14 }} onClick={entrar}>Autenticar no Sistema</button>
      </div>
    </div>
  );
}
