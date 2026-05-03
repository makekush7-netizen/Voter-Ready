"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, ChevronDown, ExternalLink, AlertTriangle, Shield } from "lucide-react";
import { checkEligibility, type EligibilityResult } from "@/lib/api";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman & Nicobar Islands","Chandigarh",
  "Dadra & Nagar Haveli","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];

type FormData = {
  age: number | "";
  isCitizen: boolean | null;
  state: string;
  residenceDuration: "<1month" | "1-6months" | "6months+" | "";
  hasVoterId: boolean | null;
};

const STEP_LABELS = ["Your Age", "Citizenship", "Your State", "Address Duration", "Voter ID"];

export default function EligibilityChecker() {
  const [view, setView]   = useState<"welcome"|"form"|"loading"|"result">("welcome");
  const [step, setStep]   = useState(1);
  const [fd, setFd]       = useState<FormData>({ age:"", isCitizen:null, state:"", residenceDuration:"", hasVoterId:null });
  const [result, setResult] = useState<EligibilityResult|null>(null);
  const [error, setError]   = useState<string|null>(null);
  const [sq, setSq]         = useState("");
  const [docsOpen, setDocsOpen] = useState(false);

  const filtered = STATES.filter(s => s.toLowerCase().includes(sq.toLowerCase()));

  const canNext = () => {
    if (step===1) return fd.age !== "" && Number(fd.age) >= 1;
    if (step===2) return fd.isCitizen !== null;
    if (step===3) return fd.state !== "";
    if (step===4) return fd.residenceDuration !== "";
    if (step===5) return fd.hasVoterId !== null;
    return false;
  };

  const handleNext = async () => {
    if (step < 5) { setStep(s => s+1); return; }
    setView("loading"); setError(null);
    try {
      const data = await checkEligibility({
        age: Number(fd.age), isCitizen: fd.isCitizen!,
        state: fd.state, residenceDuration: fd.residenceDuration as any,
        hasVoterId: fd.hasVoterId!,
      });
      setResult(data); setView("result");
    } catch(e:any) { setError(e.message ?? "Could not connect to server. Is the backend running?"); setView("form"); }
  };

  const reset = () => {
    setView("welcome"); setStep(1);
    setFd({ age:"", isCitizen:null, state:"", residenceDuration:"", hasVoterId:null });
    setResult(null); setError(null); setSq("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
          Eligibility Checker
        </h2>
        <p className="text-sm mt-1" style={{ color:"var(--text-2)" }}>
          Find out if you can vote — takes about 30 seconds
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Welcome ─────────────────────────────────── */}
        {view==="welcome" && (
          <motion.div key="w" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.22}}>
            <div className="card-lg p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background:"var(--blue-light)", border:"1.5px solid var(--blue-mid)" }}>
                <CheckCircle size={32} style={{ color:"var(--blue)" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                  Are you eligible to vote?
                </h3>
                <p className="text-sm mt-2 leading-relaxed max-w-xs mx-auto" style={{ color:"var(--text-2)" }}>
                  Answer 5 quick questions. We check the rules ourselves — Gemini AI only writes the explanation, not the verdict.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs" style={{ color:"var(--text-3)" }}>
                <span className="flex items-center gap-1"><Shield size={12}/> PII Tokenized</span>
                <span>·</span>
                <span>🤖 Gemini AI</span>
                <span>·</span>
                <span>✅ Free</span>
              </div>
              <button onClick={() => setView("form")} className="btn-primary w-full py-3.5">
                Start Check <ChevronRight size={18}/>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Form ────────────────────────────────────── */}
        {view==="form" && (
          <motion.div key="f" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.22}}>
            <div className="card-lg p-6 space-y-6">
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs" style={{ color:"var(--text-3)" }}>
                  <span style={{ fontWeight:600, color:"var(--text-2)" }}>{STEP_LABELS[step-1]}</span>
                  <span>Step {step} of 5</span>
                </div>
                <div className="progress-track">
                  <motion.div className="progress-fill" animate={{ width:`${(step/5)*100}%` }} transition={{duration:0.4}}/>
                </div>
              </div>

              {error && (
                <div className="alert alert-red text-sm" style={{ color:"var(--red)" }}>{error}</div>
              )}

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:0.18}} className="space-y-4">

                  {step===1 && (
                    <div className="space-y-3">
                      <p className="font-semibold text-lg" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                        How old are you?
                      </p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setFd(f=>({...f,age:Math.max(1,Number(f.age||1)-1)}))}
                          className="btn-secondary w-12 h-12 justify-center p-0 text-lg font-bold flex-shrink-0">−</button>
                        <input type="number" min={1} max={120} value={fd.age}
                          onChange={e => setFd(f=>({...f,age:e.target.value===""?"":Number(e.target.value)}))}
                          className="flex-1 text-center text-3xl font-bold bg-transparent border-0 outline-none"
                          style={{ color:"var(--text-1)" }} placeholder="—"/>
                        <button onClick={() => setFd(f=>({...f,age:Number(f.age||0)+1}))}
                          className="btn-secondary w-12 h-12 justify-center p-0 text-lg font-bold flex-shrink-0">+</button>
                      </div>
                      <p className="text-xs text-center" style={{ color:"var(--text-3)" }}>
                        Must be 18 or above on election day to vote
                      </p>
                    </div>
                  )}

                  {step===2 && (
                    <div className="space-y-3">
                      <p className="font-semibold text-lg" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                        Are you an Indian citizen?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {([{v:true,l:"Yes 🇮🇳"},{v:false,l:"No"}] as const).map(({v,l}) => (
                          <button key={String(v)} onClick={() => setFd(f=>({...f,isCitizen:v}))}
                            className={`option-tile ${fd.isCitizen===v?"selected":""}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step===3 && (
                    <div className="space-y-3">
                      <p className="font-semibold text-lg" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                        Which state do you live in?
                      </p>
                      <input type="text" placeholder="Search state or UT…" value={sq}
                        onChange={e => setSq(e.target.value)} className="input" />
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {filtered.map(s => (
                          <button key={s} onClick={() => { setFd(f=>({...f,state:s})); setSq(s); }}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              background: fd.state===s ? "var(--blue-light)" : "var(--surface-2)",
                              border: `1.5px solid ${fd.state===s ? "var(--blue)" : "var(--border)"}`,
                              color: fd.state===s ? "var(--blue)" : "var(--text-1)",
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step===4 && (
                    <div className="space-y-3">
                      <p className="font-semibold text-lg" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                        How long have you lived at your current address?
                      </p>
                      {([["<1month","Less than 1 month","🗓️"],["1-6months","1 to 6 months","📅"],["6months+","6 months or more","🏠"]] as const).map(([v,l,icon]) => (
                        <button key={v} onClick={() => setFd(f=>({...f,residenceDuration:v}))}
                          className={`option-tile justify-start gap-3 text-left ${fd.residenceDuration===v?"selected":""}`}>
                          <span className="text-xl flex-shrink-0">{icon}</span>
                          <span>{l}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step===5 && (
                    <div className="space-y-3">
                      <p className="font-semibold text-lg" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                        Do you already have a Voter ID card?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {([{v:true,l:"Yes, I have one 🪪"},{v:false,l:"No, I don't"}] as const).map(({v,l}) => (
                          <button key={String(v)} onClick={() => setFd(f=>({...f,hasVoterId:v}))}
                            className={`option-tile text-sm ${fd.hasVoterId===v?"selected":""}`}>{l}</button>
                        ))}
                      </div>
                      <p className="text-xs" style={{ color:"var(--text-3)" }}>
                        A Voter ID (EPIC card) is issued by the Election Commission after successful registration
                      </p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3 pt-2">
                {step>1 && (
                  <button onClick={() => setStep(s=>s-1)} className="btn-secondary">
                    <ArrowLeft size={16}/> Back
                  </button>
                )}
                <button onClick={handleNext} disabled={!canNext()} className="btn-primary flex-1">
                  {step<5 ? <>Next <ChevronRight size={18}/></> : "Check Eligibility →"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Loading ──────────────────────────────────── */}
        {view==="loading" && (
          <motion.div key="l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="card-lg p-10 flex flex-col items-center gap-5 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background:"var(--blue-light)", border:"1.5px solid var(--blue-mid)" }}>
                <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1.2,ease:"linear"}}
                  className="w-7 h-7 rounded-full border-2 border-transparent"
                  style={{ borderTopColor:"var(--blue)", borderRightColor:"var(--blue)" }}/>
              </div>
              <div>
                <p className="font-semibold text-base" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                  Checking your eligibility…
                </p>
                <p className="text-sm mt-1" style={{ color:"var(--text-2)" }}>
                  Gemini AI is generating your personalised explanation
                </p>
              </div>
              <div className="w-full space-y-2.5">
                {[85,65,75].map((w,i) => <div key={i} className="skeleton h-4 mx-auto" style={{ width:`${w}%` }}/>)}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Result ───────────────────────────────────── */}
        {view==="result" && result && (
          <motion.div key="r" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.3}}>
            <div className="card-lg p-6 space-y-5">

              {/* Verdict */}
              <div className={`alert ${result.eligible?"alert-green":"alert-red"}`}>
                {result.eligible
                  ? <CheckCircle size={26} style={{ color:"var(--green)", flexShrink:0 }}/>
                  : <XCircle    size={26} style={{ color:"var(--red)",   flexShrink:0 }}/>}
                <div>
                  <p className="font-bold text-base leading-snug" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:result.eligible?"var(--green)":"var(--red)" }}>
                    {result.eligible ? "You're Eligible to Vote! 🎉" : "Not Eligible Yet"}
                  </p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color:"var(--text-2)" }}>{result.summary}</p>
                </div>
              </div>

              {/* Form needed */}
              {result.form_needed && result.form_needed!=="None" && (
                <div className="alert alert-amber">
                  <AlertTriangle size={18} style={{ color:"var(--amber)", flexShrink:0 }}/>
                  <p className="text-sm" style={{ color:"var(--text-2)" }}>
                    You need to submit <strong style={{ color:"var(--amber)" }}>{result.form_needed}</strong> for voter registration.
                  </p>
                </div>
              )}

              {/* Documents accordion */}
              {result.documents_needed.length > 0 && (
                <div>
                  <button className="accordion-trigger" onClick={() => setDocsOpen(o=>!o)}>
                    <span>Documents Needed ({result.documents_needed.length})</span>
                    <motion.div animate={{ rotate:docsOpen?180:0 }} transition={{duration:0.2}}>
                      <ChevronDown size={16}/>
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {docsOpen && (
                      <motion.ul initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                        exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                        {result.documents_needed.map((d,i) => (
                          <li key={i} className="flex items-start gap-2.5 py-2.5 text-sm border-b last:border-0"
                            style={{ borderColor:"var(--border)", color:"var(--text-2)" }}>
                            <span style={{ color:"var(--green)", marginTop:2, flexShrink:0 }}>✓</span>{d}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Next steps */}
              {result.next_steps.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Next Steps</p>
                  {result.next_steps.map((s,i) => (
                    <div key={i} className="flex items-start gap-3 text-sm" style={{ color:"var(--text-2)" }}>
                      <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{ background:"var(--blue-mid)", color:"var(--blue)" }}>{i+1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Caveat */}
              <div className="rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs"
                style={{ background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text-3)" }}>
                <span className="flex-shrink-0">ℹ️</span>
                {result.caveat}
              </div>

              <a href="https://nvsp.in" target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
                Go to nvsp.in <ExternalLink size={15}/>
              </a>
              <button onClick={reset} className="btn-ghost w-full justify-center">Start Over</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
