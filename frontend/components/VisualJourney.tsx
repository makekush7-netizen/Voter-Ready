"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { getJourneyStep, type JourneyStep } from "@/lib/api";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Puducherry",
];

const STEPS = [
  { id:1, label:"Check Electoral Roll",  icon:"📋", desc:"Verify if your name is already on the voter list." },
  { id:2, label:"Register / Update",     icon:"✍️",  desc:"Apply for a new registration or update your details." },
  { id:3, label:"Track Application",     icon:"🔍", desc:"Monitor the status of your submitted application." },
  { id:4, label:"Find Your Booth",       icon:"📍", desc:"Locate your polling station for election day." },
  { id:5, label:"Vote on Election Day",  icon:"🗳️", desc:"Know exactly what happens inside the booth." },
];

export default function VisualJourney() {
  const [state, setState]     = useState("Madhya Pradesh");
  const [activeStep, setActiveStep] = useState<number>(1);
  const [cache, setCache]     = useState<Record<string, JourneyStep>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string|null>(null);

  const key = (id:number) => `${id}::${state}`;

  const handleStep = async (id:number) => {
    setActiveStep(id);
    if (cache[key(id)]) return;
    
    setLoading(true); setError(null);
    try {
      const data = await getJourneyStep(id, state);
      setCache(c => ({...c, [key(id)]: data}));
    } catch(e:any) {
      setError(e.message ?? "Failed to load. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const changeState = (s:string) => { setState(s); setCache({}); handleStep(activeStep); };

  const data = cache[key(activeStep)];

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
          The Voter Journey
        </h2>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color:"var(--text-2)" }}>
          Follow these 5 steps to ensure you're ready for election day. Content is dynamically generated for your state.
        </p>
        
        <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-2xl shadow-sm" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color:"var(--text-3)" }}>State:</span>
          <select value={state} onChange={e => changeState(e.target.value)}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--blue)" }}>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start relative">
        {/* Left Side: Glowing Timeline */}
        <div className="w-full md:w-1/3 flex flex-col gap-3 relative z-10">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            
            return (
              <button key={step.id} onClick={() => handleStep(step.id)}
                className={`relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden ${isActive ? 'scale-105 shadow-xl' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={{ 
                  background: isActive ? "var(--surface)" : "transparent",
                  border: isActive ? "1px solid var(--blue)" : "1px solid transparent",
                  zIndex: isActive ? 20 : 10
                }}>
                
                {/* Active glow background */}
                {isActive && (
                  <motion.div layoutId="timeline-glow" className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "var(--blue)" }} />
                )}
                
                <div className="flex gap-4 items-center relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors`}
                    style={{ 
                      background: isActive ? "var(--blue)" : (isCompleted ? "var(--green-light)" : "var(--surface-2)"),
                      color: isActive ? "white" : (isCompleted ? "var(--green)" : "var(--text-1)"),
                      boxShadow: isActive ? "0 8px 20px -6px var(--blue)" : "none"
                    }}>
                    {isCompleted ? <CheckCircle2 size={24} /> : step.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: isActive ? "var(--blue)" : "var(--text-3)" }}>
                      Step 0{step.id}
                    </p>
                    <p className="font-bold text-sm leading-tight" style={{ color:"var(--text-1)", fontFamily:"var(--font-syne,Syne,sans-serif)" }}>
                      {step.label}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Glass Content Panel */}
        <div className="w-full md:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div key={activeStep}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 inset-x-0 h-1.5" style={{ background: "linear-gradient(90deg, var(--blue), var(--saffron))" }} />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "var(--blue-light)" }}>
                  {STEPS[activeStep - 1].icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
                    {STEPS[activeStep - 1].label}
                  </h3>
                  <p className="text-sm" style={{ color:"var(--text-3)" }}>For {state}</p>
                </div>
              </div>

              {loading && (
                <div className="space-y-4 py-4">
                  <motion.div className="flex items-center gap-3 text-sm font-bold" style={{ color: "var(--blue)" }}>
                    <Loader2 size={18} className="animate-spin" />
                    Retrieving official instructions for {state}...
                  </motion.div>
                  {[100, 85, 90, 60].map((w,i) => <div key={i} className="skeleton h-4 rounded" style={{ width:`${w}%` }}/>)}
                </div>
              )}

              {error && !loading && (
                <div className="p-4 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid rgba(255,0,0,0.1)" }}>
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              {data && !loading && (
                <div className="space-y-6">
                  <p className="text-sm leading-relaxed" style={{ color:"var(--text-2)" }}>
                    {data.plain_english}
                  </p>

                  <div className="p-5 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:"var(--text-1)" }}>
                      Action Plan
                    </p>
                    <ol className="space-y-3 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-[var(--border)]">
                      {data.how_to.map((h,i) => (
                        <li key={i} className="flex gap-4 relative z-10">
                          <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm"
                            style={{ background:"var(--blue)", color:"white", border: "2px solid var(--surface-2)" }}>
                            {i+1}
                          </span>
                          <span className="text-sm pt-1" style={{ color:"var(--text-2)" }}>{h}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {data.common_mistakes.length > 0 && (
                    <div className="p-5 rounded-2xl" style={{ background: "var(--red-light)", border: "1px solid rgba(255,0,0,0.1)" }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"var(--red)" }}>
                        Avoid These Mistakes
                      </p>
                      <ul className="space-y-2">
                        {data.common_mistakes.map((m,i) => (
                          <li key={i} className="flex items-start gap-3 text-sm" style={{ color:"#991b1b" }}>
                            <span className="mt-0.5 flex-shrink-0 font-bold">✕</span> {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a href={data.official_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
                    style={{ background:"var(--text-1)", color:"var(--surface)" }}>
                    Visit Official Portal <ExternalLink size={16}/>
                  </a>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
