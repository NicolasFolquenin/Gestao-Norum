import React, { useState, useEffect } from "react";
import { supabase, supabaseConfigurado } from "../supabase.js";

const NAVY = "#12325B";
const ETAPAS_OBRA = [
  "Autenticando credenciais",
  "Nivelando fundação",
  "Erguendo estrutura",
  "Instalando sistemas prediais",
  "Integrando dados de gestão",
  "Ambiente pronto",
];

export function LogoN({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="NORUM">
      <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill={NAVY} stroke="#fff" strokeWidth="4" />
      <polygon points="50,13 83,31 83,69 50,87 17,69 17,31" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.55" />
      <path d="M36 68 V34 L64 68 V34" fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function TorreConstrucao({ ativo, prog }) {
  const CX = 130, TOPO = 40, BASE = 250;
  const RX = 52, RY = 15;
  const VOLTAS = 6;
  const N = 240;

  const pts = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const ang = f * VOLTAS * Math.PI * 2;
    const y = BASE - f * (BASE - TOPO);
    const raioF = 1 - f * 0.5;
    const x = CX + Math.cos(ang) * RX * raioF;
    const yy = y + Math.sin(ang) * RY * raioF;
    pts.push([x, yy, y, ang, raioF]);
  }
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  const desenhado = Math.floor(prog * N);

  const montantes = [0, 0.25, 0.5, 0.75].map((off) => {
    const ang0 = off * Math.PI * 2;
    const topX = CX + Math.cos(ang0) * RX * 0.5;
    const botX = CX + Math.cos(ang0) * RX;
    const topYo = Math.sin(ang0) * RY * 0.5;
    const botYo = Math.sin(ang0) * RY;
    return { botX, topX, botY: BASE + botYo, topY: TOPO + topYo };
  });

  const niveis = [0, 1, 2, 3, 4, 5, 6];

  return (
    <svg viewBox="0 0 260 290" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#28B6E8" />
          <stop offset="100%" stopColor="#7FE1FF" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#28B6E8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#28B6E8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={CX} cy="150" rx="120" ry="135" fill="url(#glow)" style={{ opacity: ativo ? 1 : 0, transition: "opacity 1s ease" }} />
      <ellipse cx={CX} cy={BASE} rx={RX + 6} ry={RY + 3} fill="none" stroke="#28B6E8" strokeWidth="1" opacity={ativo ? 0.5 : 0} style={{ transition: "opacity .6s ease" }} />

      {montantes.map((m, i) => {
        const p = Math.min(prog * 1.1, 1);
        const curX = m.botX + (m.topX - m.botX) * p;
        const curY = m.botY + (m.topY - m.botY) * p;
        return <line key={i} x1={m.botX} y1={m.botY} x2={curX} y2={curY} stroke="#28B6E8" strokeWidth="1.2" opacity={ativo ? 0.55 : 0} style={{ transition: "opacity .5s ease" }} />;
      })}

      {niveis.map((n) => {
        const f = n / (niveis.length - 1);
        const y = BASE - f * (BASE - TOPO);
        const raioF = 1 - f * 0.5;
        const visivel = ativo && prog >= f * 0.92;
        return (
          <ellipse key={n} cx={CX} cy={y} rx={RX * raioF} ry={RY * raioF} fill="none" stroke="url(#edge)" strokeWidth="1"
            opacity={visivel ? 0.7 : 0} style={{ transition: "opacity .4s ease" }} />
        );
      })}

      <path d={d} fill="none" stroke="url(#edge)" strokeWidth="2.4" strokeLinecap="round"
        style={{
          strokeDasharray: len,
          strokeDashoffset: ativo ? len * (1 - prog) : len,
          transition: "stroke-dashoffset .12s linear",
          filter: "drop-shadow(0 0 5px rgba(40,182,232,.7))",
        }} />

      {ativo && prog > 0 && prog < 1 && pts[desenhado] && (
        <>
          <circle cx={pts[desenhado][0]} cy={pts[desenhado][1]} r="4.5" fill="#7FE1FF" style={{ filter: "drop-shadow(0 0 8px #7FE1FF)" }} />
          <circle cx={pts[desenhado][0]} cy={pts[desenhado][1]} r="8" fill="none" stroke="#7FE1FF" strokeWidth="1" opacity="0.5">
            <animate attributeName="r" values="6;11;6" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      <g style={{ opacity: prog >= 0.96 ? 1 : 0, transition: "opacity .5s ease" }}>
        <line x1={CX} y1={TOPO} x2={CX} y2={TOPO - 16} stroke="url(#edge)" strokeWidth="1.5" />
        <circle cx={CX} cy={TOPO - 18} r="3" fill="#E5584F">
          <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

export function TelaLogin({ onEntrar }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [fase, setFase] = useState("form");
  const [erro, setErro] = useState("");
  const [prog, setProg] = useState(0);
  const [etapa, setEtapa] = useState(0);

  const preencheu = Math.min(login.length / 6, 1) * 0.2 + Math.min(senha.length / 6, 1) * 0.2;
  useEffect(() => {
    if (fase === "construindo") return;
    let raf;
    const passo = () => {
      setProg((p) => {
        const alvo = preencheu;
        const np = p + (alvo - p) * 0.15;
        if (Math.abs(alvo - np) > 0.002) raf = requestAnimationFrame(passo);
        return np;
      });
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [preencheu, fase]);

  useEffect(() => {
    if (fase !== "construindo") return;
    const inicio = performance.now();
    const partida = prog;
    const DUR = 3200;
    let raf;
    const tick = (t) => {
      const avanco = Math.min((t - inicio) / DUR, 1);
      const p = partida + (1 - partida) * avanco;
      setProg(p);
      setEtapa(Math.min(Math.floor(p * ETAPAS_OBRA.length), ETAPAS_OBRA.length - 1));
      if (avanco < 1) raf = requestAnimationFrame(tick);
      else {
        const nome = login.trim().split(/[.@\s]/)[0].replace(/^\w/, (c) => c.toUpperCase());
        setTimeout(() => onEntrar(nome), 500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fase]);

  const [entrando, setEntrando] = useState(false);
  const entrar = async () => {
    if (!login.trim()) { setErro("Informe o usuário para continuar."); return; }
    if (!senha) { setErro("Informe a senha."); return; }
    setErro("");
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: login.trim(), password: senha });
    setEntrando(false);
    if (error) { setErro("Usuário ou senha inválidos."); return; }
    setFase("construindo");
  };

  const construindo = fase === "construindo";
  const codigoProjeto = "NRM-" + (login.trim() ? login.trim().slice(0, 3).toUpperCase().padEnd(3, "X") : "000") + "-26";
  const espiralAtiva = construindo || login.length + senha.length > 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
      background: "radial-gradient(1200px 700px at 20% -10%, #10345f 0%, transparent 55%), radial-gradient(900px 600px at 110% 20%, #0a2748 0%, transparent 50%), #061626" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(16px);} to { opacity:1; transform:none; } }
        @keyframes gridmove { 0% { background-position:0 0; } 100% { background-position:0 40px; } }
        @keyframes hudspin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .login-in { animation: fadeUp .6s ease both; }
        .login-input { width:100%; padding:13px 15px; border-radius:11px; font-size:14px; color:#eaf3ff;
          background:rgba(255,255,255,.05); border:1px solid rgba(127,225,255,.22); outline:none; transition: border .2s, box-shadow .2s; }
        .login-input::placeholder { color:#5f7ba0; }
        .login-input:focus { border-color:#28B6E8; box-shadow:0 0 0 3px rgba(40,182,232,.2); }
        .login-btn { width:100%; margin-top:20px; padding:14px; border:none; border-radius:11px; cursor:pointer;
          font-weight:800; font-size:14px; letter-spacing:.4px; color:#04121f;
          background: linear-gradient(135deg, #28B6E8, #7FE1FF); transition: transform .15s, box-shadow .25s; }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(40,182,232,.35); }
        .login-btn:disabled { opacity:.7; cursor:default; }
        .hud-ring { position:absolute; border:1px solid rgba(127,225,255,.18); border-radius:50%; }
      `}</style>

      <div style={{ flex: 1.2, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40, overflow: "hidden",
        backgroundImage: "linear-gradient(rgba(127,225,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,225,255,.06) 1px, transparent 1px)",
        backgroundSize: "40px 40px", animation: "gridmove 6s linear infinite" }}>
        
        <div className="hud-ring" style={{ width: 460, height: 460, animation: "hudspin 40s linear infinite" }} />
        <div className="hud-ring" style={{ width: 360, height: 360, borderStyle: "dashed", animation: "hudspin 26s linear infinite reverse" }} />

        {[["8px", "8px", "0", "0"], ["8px", "auto", "0", "8px"], ["auto", "8px", "8px", "0"], ["auto", "auto", "8px", "8px"]].map((c, i) => (
          <div key={i} style={{ position: "absolute", top: c[0], right: c[1], bottom: c[2], left: c[3], width: 26, height: 26,
            borderTop: i < 2 ? "2px solid rgba(127,225,255,.4)" : "none", borderBottom: i >= 2 ? "2px solid rgba(127,225,255,.4)" : "none",
            borderLeft: i % 2 === 0 ? "2px solid rgba(127,225,255,.4)" : "none", borderRight: i % 2 === 1 ? "2px solid rgba(127,225,255,.4)" : "none", margin: 22 }} />
        ))}

        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", color: "#4f6c93", fontSize: 11, letterSpacing: 3, fontFamily: "monospace" }}>
          PROJETO {codigoProjeto} · {construindo ? "EM EXECUÇÃO" : "AGUARDANDO ACESSO"}
        </div>

        <div style={{ width: 300, height: 320, position: "relative", zIndex: 2 }}>
          <TorreConstrucao ativo={espiralAtiva} prog={prog} />
        </div>

        <div style={{ width: 340, marginTop: 6, minHeight: 56, zIndex: 2 }}>
          {construindo ? (
            <div className="login-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ color: "#7FE1FF", fontWeight: 700, letterSpacing: .5, fontSize: 13 }}>{ETAPAS_OBRA[etapa]}</span>
                <span style={{ color: "#eaf3ff", fontWeight: 800, fontSize: 15, fontFamily: "monospace" }}>{Math.round(prog * 100)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(127,225,255,.12)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${prog * 100}%`, borderRadius: 999, background: "linear-gradient(90deg, #28B6E8, #7FE1FF)", boxShadow: "0 0 12px rgba(40,182,232,.6)", transition: "width .1s linear" }} />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {ETAPAS_OBRA.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= etapa ? "#28B6E8" : "rgba(127,225,255,.15)", transition: "background .3s" }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#4f6c93", fontWeight: 600, letterSpacing: 3, fontSize: 12 }}>ENGENHARIA · GESTÃO PREDIAL</div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 460, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 52px",
        background: "rgba(4,14,26,.55)", backdropFilter: "blur(12px)", borderLeft: "1px solid rgba(127,225,255,.12)" }}>
        <div className="login-in">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
            <LogoN size={48} />
            <div>
              <div style={{ color: "#fff", fontWeight: 800, letterSpacing: 2, fontSize: 22 }}>NORUM</div>
              <div style={{ color: "#5f7ba0", fontSize: 11, letterSpacing: 1.5 }}>ENGENHARIA</div>
            </div>
          </div>
          <h1 style={{ color: "#eaf3ff", fontSize: 24, margin: "0 0 6px" }}>Acesso ao sistema</h1>
          <p style={{ color: "#5f7ba0", fontSize: 13.5, margin: "0 0 26px" }}>Plataforma de gestão predial e manutenção</p>

          <label style={{ color: "#9fb6d6", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 7 }}>Usuário</label>
          <input className="login-input" value={login} disabled={construindo} onChange={(e) => setLogin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()} placeholder="nome de usuário ou e-mail" />

          <label style={{ color: "#9fb6d6", fontSize: 12, fontWeight: 700, display: "block", margin: "16px 0 7px" }}>Senha</label>
          <input className="login-input" type="password" value={senha} disabled={construindo} onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()} placeholder="••••••••" />

          {erro && <div style={{ color: "#FF9B94", fontSize: 12.5, marginTop: 12 }}>{erro}</div>}

          <button className="login-btn" onClick={entrar} disabled={construindo || entrando}>
            {construindo ? "Preparando ambiente…" : entrando ? "Verificando…" : "Entrar na plataforma"}
          </button>
          <div style={{ color: "#3f5a7d", fontSize: 11.5, textAlign: "center", marginTop: 22 }}>
            NORUM Engenharia · uso corporativo restrito
          </div>
        </div>
      </div>
    </div>
  );
}

export function Saudacao({ usuario, onFim }) {
  const [sai, setSai] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setSai(true), 2200);
    const t2 = setTimeout(onFim, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFim]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center",
      background: "radial-gradient(900px 600px at 50% 30%, #10345f 0%, #061626 70%)",
      opacity: sai ? 0 : 1, transition: "opacity .6s ease", pointerEvents: sai ? "none" : "auto" }}>
      <style>{`
        @keyframes riseIn { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform:none; } }
        @keyframes ringspin { from { transform: rotate(0);} to { transform: rotate(360deg);} }
        @keyframes glowpulse { 0%,100%{ opacity:.4; transform:scale(1);} 50%{ opacity:.8; transform:scale(1.05);} }
      `}</style>
      <div style={{ position: "absolute", width: 420, height: 420, border: "1px solid rgba(127,225,255,.18)", borderRadius: "50%", animation: "ringspin 30s linear infinite" }} />
      <div style={{ position: "absolute", width: 320, height: 320, border: "1px dashed rgba(127,225,255,.25)", borderRadius: "50%", animation: "ringspin 20s linear infinite reverse" }} />
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,182,232,.25), transparent 70%)", animation: "glowpulse 3s ease-in-out infinite" }} />
      <div style={{ textAlign: "center", animation: "riseIn .7s ease both", position: "relative" }}>
        <div style={{ display: "inline-block", marginBottom: 22 }}><LogoN size={64} /></div>
        <div style={{ color: "#7FE1FF", fontSize: 13, letterSpacing: 3, fontWeight: 700, marginBottom: 10 }}>BEM-VINDO</div>
        <h1 style={{ color: "#fff", fontSize: 38, margin: 0, fontWeight: 800 }}>Olá, {usuario}</h1>
        <p style={{ color: "#9fb6d6", fontSize: 17, marginTop: 12 }}>O que faremos hoje?</p>
      </div>
    </div>
  );
}
