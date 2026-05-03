"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle } from "lucide-react";

type Screen = "voting" | "vvpat" | "confirmed";

const CANDIDATES = [
  { id: 1, name: "Amit Sharma",   party: "Rashtriya Vikas Dal", symbol: "🌾" },
  { id: 2, name: "Priya Gupta",   party: "Jan Seva Party",      symbol: "🌿" },
  { id: 3, name: "Rajesh Patel",  party: "Bharat Kalyan Sangh", symbol: "⚙️" },
  { id: 4, name: "Sunita Devi",   party: "Pragati Dal",         symbol: "🌻" },
  { id: 5, name: "Mohammed Khan", party: "Samajwadi Morcha",    symbol: "🌙" },
  { id: 6, name: "NOTA",          party: "None of the Above",   symbol: "✖️" },
];

const FACTS = [
  "India used EVMs nationwide for the first time in the 2004 General Elections.",
  "Each Ballot Unit can record up to 64 candidates. Multiple units can be daisy-chained.",
  "The EVM runs on a 6V alkaline battery — no mains power needed at remote booths.",
  "A VVPAT slip is visible through the glass window for exactly 7 seconds.",
  "The EVM software is one-time programmable — it cannot be updated or reprogrammed.",
];

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.frequency.value = 900;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

export default function EVMSimulator() {
  const [screen, setScreen]     = useState<Screen>("voting");
  const [selected, setSelected] = useState<number | null>(null);
  const [enabled, setEnabled]   = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [slipPhase, setSlipPhase] = useState<"in" | "out" | "hidden">("hidden");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fact = useRef(FACTS[Math.floor(Math.random() * FACTS.length)]);

  const handleBallotButton = () => {
    if (enabled) return;
    beep();
    setEnabled(true);
  };

  const handleSelect = (id: number) => {
    if (!enabled || selected !== null) return;
    beep();
    setSelected(id);
  };

  const castVote = () => {
    if (selected === null) return;
    setScreen("vvpat");
    setSlipPhase("in");
    let c = 7;
    setCountdown(c);
    timerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timerRef.current!);
        setSlipPhase("out");
        setTimeout(() => { setSlipPhase("hidden"); setScreen("confirmed"); }, 500);
      }
    }, 1000);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen("voting"); setSelected(null); setEnabled(false);
    setSlipPhase("hidden"); setCountdown(7);
    fact.current = FACTS[Math.floor(Math.random() * FACTS.length)];
  };

  const candidate = CANDIDATES.find(c => c.id === selected);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-syne,Syne,sans-serif)", color: "var(--text-1)" }}>
          Interactive EVM
        </h2>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
          Experience a high-fidelity simulation of the real Indian Electronic Voting Machine.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── SCREEN 1: EVM ─────────────────────────────── */}
        {screen === "voting" && (
          <motion.div key="evm"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}
            className="w-full max-w-2xl flex flex-col items-center gap-8 relative"
          >
            {/* Dynamic Instruction Tooltip */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="px-6 py-3 rounded-full shadow-lg z-20 sticky top-20 text-center backdrop-blur-md"
              style={{ background: "rgba(var(--blue-rgb, 37,99,235), 0.1)", border: "1px solid var(--blue)", color: "var(--blue)" }}
            >
              {!enabled
                ? <><strong className="uppercase tracking-wider text-xs">Step 1:</strong> Press <strong>BALLOT</strong> on the Control Unit below</>
                : selected === null
                ? <><strong className="uppercase tracking-wider text-xs">Step 2:</strong> Press the blue button next to your candidate</>
                : <><strong className="uppercase tracking-wider text-xs">Step 3:</strong> Press <strong>Cast Vote</strong> to confirm</>
              }
            </motion.div>

            {/* ── Machines layout (VERTICAL) ─────────────────────── */}
            <div className="flex flex-col gap-8 items-center w-full relative">
              
              {/* Cable connecting the two units visually */}
              <div className="absolute inset-y-0 w-px bg-dashed z-0" style={{ backgroundImage: "linear-gradient(to bottom, var(--text-3) 50%, transparent 50%)", backgroundSize: "100% 12px", width: "4px", left: "50%", transform: "translateX(-50%)" }} />

              {/* CONTROL UNIT (TOP) */}
              <div className="evm-body p-0 overflow-hidden w-72 shadow-[0_15px_35px_rgba(0,0,0,0.2)] relative z-10 transform hover:scale-[1.02] transition-transform" style={{ background: "url('https://www.transparenttextures.com/patterns/cubes.png'), #d8dce3" }}>
                <div className="px-4 py-2 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "#4a5568" }}>Control Unit</span>
                  <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded-full">
                    <div className="evm-status-led green" />
                    <span className="text-[9px] font-bold uppercase" style={{ color: "#166534" }}>On</span>
                    <div className="evm-status-led red-indicator ml-2" />
                    <span className="text-[9px] font-bold uppercase" style={{ color: "#991b1b" }}>Busy</span>
                  </div>
                </div>

                <div className="p-4 bg-[#c8cdd6] m-3 rounded-lg shadow-inner border border-white/40">
                  <div className="evm-display rounded-lg px-4 py-3 text-2xl text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] tracking-[0.3em] flex flex-col justify-center border-4 border-[#1a1a1a]" style={{ height: "70px" }}>
                    <div style={{ opacity: 0.3, fontSize: "10px", lineHeight: "1" }}>VOTES</div>
                    <div>{selected !== null ? "00001" : "00000"}</div>
                  </div>
                </div>

                <div className="px-5 pb-5 flex justify-center gap-8 mt-2">
                  <div className="flex flex-col items-center gap-2">
                    <button className="w-16 h-16 rounded-full text-transparent transition-all shadow-[0_5px_0_#475569,inset_0_2px_4px_rgba(255,255,255,0.4)] active:translate-y-1 active:shadow-none"
                      style={{ background: "linear-gradient(145deg, #94a3b8, #64748b)", border: "2px solid #475569" }} disabled>
                    </button>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#475569]">Total</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <button onClick={handleBallotButton} disabled={enabled}
                      className={`w-16 h-16 rounded-full text-transparent transition-all shadow-[0_5px_0_#475569,inset_0_2px_4px_rgba(255,255,255,0.4)] ${!enabled ? 'hover:brightness-110 active:translate-y-1 active:shadow-none cursor-pointer' : ''}`}
                      style={{
                        background: "linear-gradient(145deg, #94a3b8, #64748b)", 
                        border: "2px solid #475569",
                        boxShadow: enabled ? "inset 0 2px 4px rgba(0,0,0,0.4)" : "0 5px 0 #475569, inset 0 2px 4px rgba(255,255,255,0.4)",
                        transform: enabled ? "translateY(2px)" : "none",
                      }}>
                    </button>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#475569]">Ballot</span>
                  </div>
                </div>
              </div>

              {/* BALLOT UNIT (BOTTOM, BIGGER) */}
              <div className="evm-body p-0 overflow-hidden w-full max-w-lg shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative z-10" style={{ background: "url('https://www.transparenttextures.com/patterns/cubes.png'), #d8dce3" }}>
                <div className="evm-blue-panel px-4 py-3 flex items-center justify-between rounded-t-lg shadow-md border-b border-black/20 z-20 relative">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border border-black/40 ${enabled ? "bg-[#4ade80] shadow-[0_0_12px_#4ade80]" : "bg-[#064e3b]"}`} />
                    <span className="text-[10px] text-white/90 font-extrabold uppercase tracking-widest">{enabled ? "Ready" : "Standby"}</span>
                  </div>
                  <span className="text-xs font-extrabold tracking-widest text-white uppercase opacity-90">Balloting Unit</span>
                </div>

                <div className="p-3 bg-[#e2e8f0] shadow-inner">
                  {CANDIDATES.map((c) => {
                    const isSelected = selected === c.id;
                    const isDisabled = !enabled || (selected !== null && !isSelected);
                    return (
                      <div key={c.id} className={`evm-candidate-row p-2 mb-2 rounded-lg transition-all border ${isSelected ? "selected ring-2 ring-[var(--blue)] shadow-lg bg-white scale-[1.02] z-10 relative border-transparent" : "bg-[#f8fafc] border-[#cbd5e1] hover:bg-white"}`}
                        style={{ opacity: isDisabled && selected !== null ? 0.4 : 1, gridTemplateColumns: "36px 1fr 48px 30px 60px", alignItems: "center" }}>
                        <span className="text-center text-sm font-extrabold text-[#475569]">{c.id}</span>

                        <div className="rounded-md px-3 py-2 min-w-0 bg-white border border-[#e2e8f0] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
                          <p className="text-[15px] font-extrabold truncate text-[#0f172a] tracking-tight">{c.name}</p>
                          <p className="text-[10px] truncate font-bold text-[#64748b] uppercase tracking-wider">{c.party}</p>
                        </div>

                        <div className="w-12 h-10 rounded bg-white flex items-center justify-center text-2xl flex-shrink-0 border border-[#cbd5e1] shadow-sm">
                          {c.symbol}
                        </div>

                        <div className="flex justify-center">
                          <div className={`evm-led w-4 h-4 rounded-full border-2 ${isSelected ? "lit scale-125 bg-[#ef4444] shadow-[0_0_10px_#ef4444] border-[#991b1b]" : "bg-[#450a0a] border-[#2e0707]"} flex-shrink-0 transition-all duration-200`} />
                        </div>

                        <div className="flex justify-end pr-1">
                          <button onClick={() => handleSelect(c.id)} disabled={isDisabled}
                            className={`w-12 h-10 rounded-md transition-all border border-[#1e3a8a] ${isSelected ? "bg-[#1e3a8a] shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)] translate-y-1" : "bg-[#2563eb] shadow-[0_4px_0_#1e3a8a,inset_0_2px_3px_rgba(255,255,255,0.3)]"} ${enabled && selected === null ? "hover:brightness-110 active:translate-y-1 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)] cursor-pointer" : ""}`}
                            aria-label={`Vote for ${c.name}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="evm-blue-panel rounded-b-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" style={{ height: 16 }} />
              </div>
            </div>

            <AnimatePresence>
              {selected !== null && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sticky bottom-4 w-full max-w-sm z-50">
                  <button onClick={castVote} className="w-full py-4 rounded-2xl text-white font-extrabold text-lg shadow-[0_10px_30px_rgba(22,101,52,0.4)] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, var(--green), #14532d)" }}>
                    CAST VOTE <CheckCircle size={22} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SCREEN 2: VVPAT ─────────────────────────── */}
        {screen === "vvpat" && (
          <motion.div key="vvpat"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-syne,Syne,sans-serif)", color: "var(--text-1)" }}>Verifying Print...</h3>
              <p className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: "var(--blue-light)", color: "var(--blue)" }}>
                Visible for exactly {countdown} seconds
              </p>
            </div>

            {/* VVPAT Machine (Large) */}
            <div className="w-72 md:w-80 rounded-3xl overflow-hidden shadow-2xl relative" style={{ background: "linear-gradient(180deg, #d8dce3, #cbd1db)", border: "4px solid #b0b6c0" }}>
              <div className="evm-blue-panel px-6 py-3 text-center rounded-none shadow-md">
                <span className="text-xs text-white font-extrabold tracking-[0.2em] uppercase">VVPAT System</span>
              </div>

              {/* Glass viewing window with lighting effects */}
              <div className="m-5 rounded-2xl overflow-hidden relative shadow-inner flex justify-center" style={{
                height: 240, background: "radial-gradient(circle at center, rgba(200,220,255,0.15) 0%, rgba(0,0,0,0.8) 100%)",
                border: "4px solid #9ba8bc"
              }}>
                {/* Lighting reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* VVPAT slip */}
                {slipPhase !== "hidden" && candidate && (
                  <div className={`absolute bottom-4 w-4/5 bg-white rounded-lg p-4 text-center shadow-2xl ${
                    slipPhase === "in" ? "slip-rise" : "slip-fall"
                  }`} style={{ border: "1px solid #e2e8f0" }}>
                    <p className="text-gray-400 font-mono mb-2 text-[10px]">
                      SL.NO: {Date.now().toString().slice(-8)}
                    </p>
                    <p className="text-5xl mb-3 mt-1 drop-shadow-sm">{candidate.symbol}</p>
                    <p className="font-extrabold text-gray-900 text-lg leading-tight tracking-tight uppercase">{candidate.name}</p>
                    <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Election Commission of India</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SCREEN 3: Confirmed ─────────────────────── */}
        {screen === "confirmed" && (
          <motion.div key="confirmed"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="p-10 rounded-3xl text-center shadow-2xl relative overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {/* Celebration background rays */}
              <motion.div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 pointer-events-none"
                animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ background: "conic-gradient(from 0deg, transparent 0deg, var(--green-light) 45deg, transparent 90deg, var(--green-light) 135deg, transparent 180deg, var(--green-light) 225deg, transparent 270deg, var(--green-light) 315deg, transparent 360deg)" }} />

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
                style={{ background: "var(--green)", border: "4px solid #86efac" }}>
                <CheckCircle size={56} className="text-white drop-shadow-md" />
              </motion.div>

              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-syne,Syne,sans-serif)", color: "var(--text-1)" }}>
                  Vote Confirmed!
                </h3>
                <p className="text-base mb-8" style={{ color: "var(--text-2)" }}>
                  Your simulated vote has been securely recorded. In real life, this process guarantees absolute anonymity.
                </p>
              </div>

              <div className="text-left p-5 rounded-2xl mb-8 relative z-10 shadow-sm" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue)" }}>Did You Know?</p>
                <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-1)" }}>{fact.current}</p>
              </div>

              <button onClick={reset} className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-md relative z-10"
                style={{ background: "var(--text-1)", color: "var(--surface)" }}>
                <RefreshCw size={18} /> Simulate Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
