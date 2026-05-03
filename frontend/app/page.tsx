"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, Map, Vote, Sun, Moon, MessageSquare, X, Send, Paperclip, Loader2, Image as ImageIcon } from "lucide-react";
import EligibilityChecker from "@/components/EligibilityChecker";
import VisualJourney from "@/components/VisualJourney";
import EVMSimulator from "@/components/EVMSimulator";
import BoothLocator from "@/components/BoothLocator";
import { chatWithAI } from "@/lib/api";

type Tab = "eligibility" | "journey" | "evm" | "booth";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "eligibility", label: "Eligibility Check", Icon: CheckCircle2 },
  { id: "journey",     label: "Voter Journey",     Icon: Map },
  { id: "evm",         label: "Practice EVM",      Icon: Vote },
  { id: "booth",       label: "Find Booth",        Icon: MapPin },
];

export default function Home() {
  const [active, setActive] = useState<Tab>("eligibility");
  const [dark, setDark]     = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<{role: 'bot'|'user', text: string, img?: string}[]>([
    { role: 'bot', text: "Hello! I'm your virtual election guide. I can help you understand the voting process, verify required documents, or learn how to use the EVM. What do you need help with?" }
  ]);
  const [input, setInput] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  useEffect(() => {
    const stored = localStorage.getItem("vr-theme");
    if (stored === "dark") setDark(true);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("vr-theme", next ? "dark" : "light");
  };

  const handleChatSubmit = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const msg = preset || input.trim();
    if (!msg && !imgPreview) return;

    const userMsg = { role: 'user' as const, text: msg, img: imgPreview || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setImgFile(null);
    setImgPreview(null);
    setLoadingChat(true);

    try {
      const reply = await chatWithAI(msg, userMsg.img);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImgPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex flex-col min-h-[100dvh]" style={{ background: "var(--bg)", overflow: "hidden" }}>
      
      {/* ── Ambient Background Mesh ─────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30 transition-opacity duration-1000">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] animate-blob"
          style={{ background: "var(--blue-light)" }}></div>
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"
          style={{ background: "var(--saffron-light)" }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"
          style={{ background: "var(--green-light)" }}></div>
      </div>

      {/* ── Top Navigation Bar ──────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl" style={{ background: "rgba(var(--surface-rgb, 255, 255, 255), 0.7)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActive("eligibility")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--blue), #1e3a8a)" }}>
              🗳️
            </div>
            <div>
              <p className="font-bold text-lg leading-none tracking-tight" style={{ fontFamily: "var(--font-syne,Syne,sans-serif)", color: "var(--text-1)" }}>
                Voter<span style={{ color: "var(--blue)" }}>Ready</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--text-3)" }}>
                Election Commission Guide
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {TABS.map(({ id, label, Icon }) => {
              const isActive = active === id;
              return (
                <button key={id} onClick={() => setActive(id)} className="relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                  style={{ color: isActive ? "var(--blue)" : "var(--text-2)" }}>
                  {isActive && (
                    <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl"
                      style={{ background: "var(--blue-light)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ───────────────────────── */}
      <main className="flex-1 relative z-10 flex flex-col items-center pb-32 pt-8 md:pt-12">
        
        {/* Animated Hero Header with Professional Glow */}
        <AnimatePresence>
          {active === "eligibility" && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="text-center mb-16 px-4 relative w-full">
              {/* Center Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full mix-blend-screen pointer-events-none opacity-40 dark:opacity-20" style={{ background: "radial-gradient(circle, var(--blue-light) 0%, transparent 70%)" }} />

              {/* Floating Graphics */}
              <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-[15%] hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-3xl">🗳️</motion.div>
              <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[40%] right-[12%] hidden lg:flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-4xl">🇮🇳</motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-10%] left-[25%] hidden lg:flex items-center justify-center w-12 h-12 rounded-xl shadow-xl bg-white/10 backdrop-blur-xl border border-white/20 text-2xl">✅</motion.div>

              <div className="relative z-10">
                <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold mb-6 shadow-xl cursor-pointer" style={{ background: "rgba(var(--surface-rgb,255,255,255), 0.8)", border: "1px solid var(--border)", color: "var(--blue)", backdropFilter: "blur(10px)" }}>
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_var(--green)]" style={{ background: "var(--green)" }}/>
                  Your Personalized Civic Companion
                </motion.div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight drop-shadow-sm" style={{ fontFamily: "var(--font-syne,Outfit,sans-serif)", color: "var(--text-1)" }}>
                  Your Vote Shapes <br className="hidden md:block" />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, var(--blue), #8b5cf6, var(--saffron))" }}>The Future</span>
                    <span className="absolute bottom-1 left-0 w-full h-3 opacity-30 -z-10" style={{ background: "var(--saffron)" }} />
                  </span>.
                </h1>
                
                <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium" style={{ color: "var(--text-2)" }}>
                  Empowering the next generation of Indian voters. Check your eligibility, navigate the voting process, and experience an authentic EVM simulation.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-4xl px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0  }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="bg-opacity-50 backdrop-blur-md rounded-3xl" style={{ padding: "2px", background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))" }}>
                {active === "eligibility" && <EligibilityChecker />}
                {active === "journey"     && <VisualJourney />}
                {active === "evm"         && <EVMSimulator />}
                {active === "booth"       && <BoothLocator />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Chatbot Overlay ────────────────────────────── */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="mb-4 w-80 md:w-96 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "450px" }}
            >
              <div className="px-5 py-4 flex justify-between items-center" style={{ background: "linear-gradient(135deg, var(--blue), #1e3a8a)", color: "white" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-xl backdrop-blur-sm">🤖</div>
                  <div>
                    <span className="font-bold text-base block leading-none" style={{ fontFamily: "var(--font-syne,Syne,sans-serif)" }}>Election AI</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">Powered by Gemini</span>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto space-y-4" style={{ background: "var(--surface-2)" }}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    {m.role === 'bot' && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm" style={{ background: "var(--blue)", color: "white" }}>🤖</div>
                    )}
                    <div className={`p-3 rounded-2xl shadow-sm text-sm flex flex-col gap-2 ${m.role === 'user' ? 'rounded-tr-sm text-white' : 'rounded-tl-sm'}`} 
                      style={m.role === 'user' ? { background: "var(--blue)" } : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                      {m.img && <img src={m.img} alt="upload" className="w-full max-h-40 object-cover rounded-lg" />}
                      <span style={{ lineHeight: "1.5" }}>{m.text}</span>
                    </div>
                  </div>
                ))}
                {loadingChat && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm" style={{ background: "var(--blue)", color: "white" }}>🤖</div>
                    <div className="p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm flex items-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                      <Loader2 size={16} className="animate-spin" /> Thinking...
                    </div>
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    <button onClick={() => handleChatSubmit(undefined, "How do I register?")} className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-[var(--blue-light)]" style={{ borderColor: "var(--blue)", color: "var(--blue)" }}>How to register?</button>
                    <button onClick={() => handleChatSubmit(undefined, "What documents are required?")} className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-[var(--blue-light)]" style={{ borderColor: "var(--blue)", color: "var(--blue)" }}>Required documents</button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                {imgPreview && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border shadow-sm">
                    <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => {setImgFile(null); setImgPreview(null);}} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"><X size={12}/></button>
                  </div>
                )}
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] text-[var(--text-2)] border" style={{ borderColor: "var(--border)" }}>
                    <Paperclip size={18} />
                  </button>
                  <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything or attach a photo..." className="flex-1 text-sm px-4 py-2 rounded-full outline-none transition-all focus:ring-2 ring-[var(--blue-light)]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                  <button type="submit" disabled={!input.trim() && !imgPreview} className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" style={{ background: "var(--blue)", color: "white" }}>
                    <Send size={18} className="ml-0.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all"
          style={{ background: "linear-gradient(135deg, var(--blue), #1e3a8a)", color: "white", boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.5)" }}
        >
          {chatOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pt-2 pb-5 backdrop-blur-xl" style={{ background: "rgba(var(--surface-rgb, 255, 255, 255), 0.8)", borderTop: "1px solid var(--border)" }}>
        <div className="flex justify-around items-center">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button key={id} onClick={() => setActive(id)}
                className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl"
                style={{ color: isActive ? "var(--blue)" : "var(--text-3)" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-pill-mobile"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: "var(--blue-light)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="text-[10px] font-bold relative z-10"
                  style={{ fontFamily: "var(--font-syne,Syne,sans-serif)" }}>
                  {label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
