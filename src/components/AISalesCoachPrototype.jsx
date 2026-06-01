import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// REPSIM — Pre-Sales Training Simulator (Voice Edition)
// ============================================================

const SCENARIOS = [
  {
    id: "discovery_tl_csm",
    title: "Cold Discovery: Global Logistics VP",
    vertical: "Transportation & Logistics",
    product: "Customer Service Management",
    persona: "Jennifer Huang",
    personaTitle: "VP of Customer Experience",
    company: "Meridian Freight Corp",
    companyDesc: "$6B global freight forwarder, 15,000 employees, 200+ distribution centers",
    difficulty: "Intermediate",
    setup: "You're 10 minutes into a first discovery call. The prospect agreed to the meeting because they're drowning in customer complaints about shipment visibility. They currently use Salesforce Service Cloud and a custom-built tracking portal. The VP is skeptical — she's been burned by platform vendors before.",
    objectives: ["Uncover 2-3 specific pain points tied to their current stack", "Connect pain to CSM capabilities without pitching features", "Earn a follow-up meeting with her and the CIO"],
    personaPrompt: `You are Jennifer Huang, VP of Customer Experience at Meridian Freight Corp, a $6B global freight forwarder.

YOUR SITUATION:
- Your team handles 40,000+ customer inquiries/month across phone, email, and a clunky self-service portal
- Salesforce Service Cloud is your current CRM but it's siloed from operations — agents can't see real-time shipment status
- You built a custom tracking portal 3 years ago but it's brittle, expensive to maintain, and doesn't integrate with your TMS
- Customer satisfaction (CSAT) dropped from 78 to 64 over the past year
- CEO is breathing down your neck about retention — lost two top-10 accounts last quarter
- Skeptical of "platform plays" — been sold big promises before

YOUR PERSONALITY:
- Direct, data-driven, no patience for buzzwords
- Push back on vague claims — ask for specifics and proof points
- Warm up if the SA shows genuine understanding of logistics complexity
- Secretly interested in AI-powered case routing but won't bring it up unless the SA earns trust
- If the SA mentions "digital transformation" or "single pane of glass" you get visibly annoyed`
  },
  {
    id: "objection_tl_security",
    title: "Security Objection: Armis & Veza Play",
    vertical: "Transportation & Logistics",
    product: "Security Ops + Armis + Veza",
    persona: "David Kowalski",
    personaTitle: "CISO",
    company: "Pacific Intermodal",
    companyDesc: "$3.2B intermodal shipping, 8,000 employees, heavy OT/IoT environment",
    difficulty: "Advanced",
    setup: "You're in a competitive deal against Palo Alto XSOAR and CrowdStrike. The CISO had a bad experience with ServiceNow SecOps 2 years ago and thinks it's 'just a ticketing system.' You need to reposition with the Armis and Veza acquisitions.",
    objectives: ["Reframe ServiceNow Security beyond ticketing", "Position Armis asset discovery for OT/IoT", "Introduce Veza identity security for AI agent governance", "Neutralize Palo Alto and CrowdStrike threat"],
    personaPrompt: `You are David Kowalski, CISO of Pacific Intermodal, a $3.2B intermodal shipping company.

YOUR SITUATION:
- 50,000+ OT/IoT devices across ports, rail yards, distribution centers — most unmanaged
- Evaluated ServiceNow SecOps 2 years ago and rejected it as "just a ticketing system"
- Currently evaluating Palo Alto XSOAR and CrowdStrike for SOC modernization
- Board pushing AI adoption but worried about ungoverned AI agents accessing sensitive data
- Ransomware incident 8 months ago from an unmanaged OT device
- Identity management is a mess — 3 different IAM tools, no unified view

YOUR PERSONALITY:
- Technical and skeptical — came up through pen testing and incident response
- Respects vendors who know their limitations
- Biased toward best-of-breed over platforms
- Will bring up "ticketing system" objection early
- If SA articulates how Armis and Veza change the game for OT/IoT and AI governance, you'll engage
- Hates slides — wants architecture and technical depth`
  },
  {
    id: "expansion_tl_itom",
    title: "Expansion: ITOM to Full Platform",
    vertical: "Transportation & Logistics",
    product: "ITOM → ITSM + HRSD + CSM",
    persona: "Robert Chen",
    personaTitle: "CIO",
    company: "TransGlobal Logistics",
    companyDesc: "$9B contract logistics, 45,000 employees, 500+ warehouses globally",
    difficulty: "Advanced",
    setup: "TransGlobal has used ServiceNow ITOM for 3 years. They love Discovery and Service Mapping. The CIO wants to explore the full platform but finance is pushing back. Make the case for ITSM, HRSD, and CSM expansion.",
    objectives: ["Build on ITOM success to justify expansion", "Address CFO concern about vendor consolidation ROI", "Map T&L pain points to ITSM, HRSD, and CSM", "Get agreement to a joint value assessment"],
    personaPrompt: `You are Robert Chen, CIO of TransGlobal Logistics, a $9B contract logistics company.

YOUR SITUATION:
- Used ServiceNow ITOM (Discovery, Service Mapping, Event Management) for 3 years — it's been a win
- ITSM is on BMC Helix and your IT team hates it
- HR runs 4 different systems across regions — onboarding a warehouse worker takes 3 weeks
- Customer service is fragmented — 3PL clients complain about visibility
- CFO thinks you're too dependent on ServiceNow and wants competitive bids
- Personally bullish on AI but needs hard ROI numbers
- Intrigued by Now Assist but hasn't seen it for logistics use cases

YOUR PERSONALITY:
- Strategic, former management consultant
- Speaks in frameworks, wants clear business cases
- Will challenge SA to quantify value
- Likes SAs who understand logistics, not just technology
- Will name-drop CFO as blocker at least twice
- Open to platform play but needs ammunition to sell internally`
  },
  {
    id: "demo_tl_nowassist",
    title: "Now Assist: Warehouse Operations",
    vertical: "Transportation & Logistics",
    product: "Now Assist + AI Agents",
    persona: "Maria Santos",
    personaTitle: "VP of Operations",
    company: "Summit Distribution",
    companyDesc: "$2.1B regional distribution, 6,000 employees, 80 fulfillment centers",
    difficulty: "Intermediate",
    setup: "The VP of Operations saw Now Assist at Knowledge and wants to understand how AI agents could help warehouse operations. She's technical but not IT. Translate AI into operational outcomes.",
    objectives: ["Explain Now Assist in operational language", "Connect AI to specific warehouse pain points", "Address AI reliability in safety-critical environments", "Propose a focused POC"],
    personaPrompt: `You are Maria Santos, VP of Operations at Summit Distribution, a $2.1B regional distribution company.

YOUR SITUATION:
- Run 80 fulfillment centers — biggest problems are unplanned downtime and labor scheduling
- Conveyor belt failures cost $50K/hour — average 3 per week across your network
- Losing warehouse workers to Amazon — onboarding and scheduling is a mess
- Saw Now Assist at Knowledge and got excited but IT team is skeptical
- No idea what "ITSM" or "CMDB" means — cares about pallets per hour
- Worried about AI in safety-critical environments (forklifts, conveyors)

YOUR PERSONALITY:
- Operations-first — everything is throughput, uptime, and safety
- Allergic to IT jargon — if SA says "CMDB" without explaining in warehouse terms, you check out
- Responds to concrete examples with real numbers
- Worried about change management — warehouse managers are old school
- Will ask about AI hallucinations and safety
- If SA paints a picture of a self-running warehouse, you're sold`
  },
];

const DIFF_COLORS = { Intermediate: "#E8A817", Advanced: "#DC3545" };

// ============================================================
// VOICE HOOKS
// ============================================================

function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript((final + interim).trim());
      };

      recognition.onerror = (e) => {
        if (e.error !== "aborted") console.error("Speech error:", e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    return () => { synthRef.current?.cancel(); };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) { console.error("Start error:", e); }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text, onDone) => {
    if (!voiceEnabled || !synthRef.current) {
      onDone?.();
      return;
    }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to pick a natural voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Daniel") || v.name.includes("Google US"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onDone?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onDone?.(); };
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const hasRecognition = !!recognitionRef.current;

  return { isListening, transcript, setTranscript, isSpeaking, voiceEnabled, setVoiceEnabled, startListening, stopListening, speak, stopSpeaking, hasRecognition };
}

// ============================================================
// MAIN APP
// ============================================================

export default function AISalesCoach() {
  const [screen, setScreen] = useState("home");
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [turnCount, setTurnCount] = useState(0);

  const startScenario = (s) => { setScenario(s); setMessages([]); setTurnCount(0); setFeedback(null); setScreen("briefing"); };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      maxWidth: 520, margin: "0 auto", minHeight: "100vh",
      background: "#0A0E17", color: "#E8ECF4",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes micPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(220,53,69,0.4); } 50% { box-shadow: 0 0 0 16px rgba(220,53,69,0); } }
        @keyframes speakPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(26,107,245,0.3); } 50% { box-shadow: 0 0 0 12px rgba(26,107,245,0); } }
        @keyframes typing { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }
        @keyframes waveform { 0%, 100% { height: 8px; } 50% { height: 24px; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2A3348; border-radius: 2px; }
        input:focus, textarea:focus { outline: none; }
        button { cursor: pointer; }
        button:active { transform: scale(0.97); }
      `}</style>

      {screen === "home" && <HomeScreen scenarios={SCENARIOS} onSelect={startScenario} />}
      {screen === "briefing" && <BriefingScreen scenario={scenario} onStart={() => setScreen("roleplay")} onBack={() => setScreen("home")} />}
      {screen === "roleplay" && <RoleplayScreen scenario={scenario} messages={messages} setMessages={setMessages} turnCount={turnCount} setTurnCount={setTurnCount} onEnd={() => setScreen("debrief")} setFeedback={setFeedback} />}
      {screen === "debrief" && <DebriefScreen scenario={scenario} messages={messages} feedback={feedback} setFeedback={setFeedback} onHome={() => setScreen("home")} onRetry={() => startScenario(scenario)} />}
    </div>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================

function HomeScreen({ scenarios, onSelect }) {
  return (
    <div style={{ padding: "0 20px 40px", animation: "fadeIn 0.5s ease" }}>
      <div style={{ padding: "40px 0 32px", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
          background: "linear-gradient(135deg, #1A6BF5 0%, #0D4CD4 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(26,107,245,0.25)",
        }}>
          <span style={{ fontSize: 28 }}>🎯</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 6px", color: "#fff" }}>AI Sales Coach</h1>
        <p style={{ fontSize: 13, color: "#6B7A99", fontWeight: 500 }}>Pre-Sales Training Simulator</p>
        <p style={{ fontSize: 12, color: "#3D4B66", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>ServiceNow • T&L Vertical • Voice Enabled 🎙️</p>
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(26,107,245,0.08) 0%, rgba(26,107,245,0.02) 100%)",
        border: "1px solid rgba(26,107,245,0.15)", borderRadius: 12,
        padding: "14px 16px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>🎙️</span>
        <p style={{ fontSize: 12, color: "#8B9BC0", lineHeight: 1.6 }}>
          Speak your responses like a real meeting. The customer talks back. <strong style={{ color: "#A8B8DA" }}>5-15 min per session.</strong>
        </p>
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Scenarios</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {scenarios.map((s, i) => (
          <button key={s.id} onClick={() => onSelect(s)}
            style={{
              width: "100%", textAlign: "left", background: "#111827",
              border: "1px solid #1E2A42", borderRadius: 14, padding: "16px 18px",
              transition: "all 0.2s", animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A6BF5"; e.currentTarget.style.background = "#131D30"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E2A42"; e.currentTarget.style.background = "#111827"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                background: DIFF_COLORS[s.difficulty] + "18", color: DIFF_COLORS[s.difficulty],
                textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "'JetBrains Mono', monospace",
              }}>{s.difficulty}</span>
              <span style={{ fontSize: 10, color: "#3D4B66", fontFamily: "'JetBrains Mono', monospace" }}>{s.product}</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#E8ECF4", margin: "0 0 6px", lineHeight: 1.3 }}>{s.title}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7A99" }}>
              <span>{s.persona} — {s.personaTitle}</span>
            </div>
            <p style={{ fontSize: 11, color: "#3D4B66", marginTop: 4 }}>{s.company}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BRIEFING SCREEN
// ============================================================

function BriefingScreen({ scenario, onStart, onBack }) {
  return (
    <div style={{ padding: "0 20px 40px", animation: "fadeIn 0.4s ease" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B7A99", fontSize: 13, padding: "20px 0 16px" }}>← Back</button>

      <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 16, padding: "24px 20px", marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: DIFF_COLORS[scenario.difficulty] + "18", color: DIFF_COLORS[scenario.difficulty], textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "'JetBrains Mono', monospace" }}>{scenario.difficulty}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "12px 0 6px" }}>{scenario.title}</h2>
        <p style={{ fontSize: 12, color: "#6B7A99", fontFamily: "'JetBrains Mono', monospace" }}>{scenario.vertical} • {scenario.product}</p>
      </div>

      <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your Customer</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#E8ECF4", margin: "0 0 2px" }}>{scenario.persona}</p>
        <p style={{ fontSize: 13, color: "#8B9BC0", margin: "0 0 4px" }}>{scenario.personaTitle} — {scenario.company}</p>
        <p style={{ fontSize: 12, color: "#4D5E80" }}>{scenario.companyDesc}</p>
      </div>

      <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Situation</p>
        <p style={{ fontSize: 13, color: "#A8B8DA", lineHeight: 1.7 }}>{scenario.setup}</p>
      </div>

      <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Objectives</p>
        {scenario.objectives.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: "rgba(26,107,245,0.1)", border: "1px solid rgba(26,107,245,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#1A6BF5", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
            <p style={{ fontSize: 13, color: "#A8B8DA", lineHeight: 1.5 }}>{o}</p>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
        background: "linear-gradient(135deg, #1A6BF5, #0D4CD4)",
        color: "#fff", fontSize: 15, fontWeight: 700,
        boxShadow: "0 8px 32px rgba(26,107,245,0.3)",
      }}>
        🎙️ Begin Voice Role-Play →
      </button>
    </div>
  );
}

// ============================================================
// ROLEPLAY SCREEN (Voice-Enabled)
// ============================================================

function RoleplayScreen({ scenario, messages, setMessages, turnCount, setTurnCount, onEnd, setFeedback }) {
  const voice = useVoice();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("idle"); // idle, listening, thinking, speaking
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, voice.transcript]);

  // Sync voice transcript to input
  useEffect(() => {
    if (voice.transcript) setInput(voice.transcript);
  }, [voice.transcript]);

  const callClaude = async (msgs, sys) => {
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: msgs }),
      });
      const d = await r.json();
      return d.content?.[0]?.text || "Could you repeat that?";
    } catch (e) { return "[Connection issue — try again]"; }
  };

  const sysPrompt = (turn) => `${scenario.personaPrompt}

RULES:
- Stay fully in character. You ARE ${scenario.persona}.
- This is a VOICE conversation — keep responses to 2-3 sentences max. Be concise like a real executive on a call.
- React naturally to what the SA says. Push back, ask questions, show skepticism or interest as your character would.
- Never break character or mention AI.
- Turn ${turn} of the conversation.`;

  const startConversation = async () => {
    setStarted(true); setLoading(true); setMode("thinking");
    const text = await callClaude(
      [{ role: "user", content: "The SA just joined the call and introduced themselves. Open the conversation in character. Keep it to 2-3 sentences." }],
      sysPrompt(0)
    );
    setMessages([{ role: "customer", text }]);
    setLoading(false); setMode("speaking");
    voice.speak(text, () => setMode("idle"));
  };

  const sendMessage = async (overrideText) => {
    const msgText = overrideText || input.trim();
    if (!msgText || loading) return;
    voice.stopListening(); voice.stopSpeaking();
    const userMsg = { role: "sa", text: msgText };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput(""); voice.setTranscript("");
    setTurnCount(prev => prev + 1);
    setLoading(true); setMode("thinking");

    const apiMsgs = [{ role: "user", content: "Start. The SA just joined. Open in character." }];
    for (const m of newMsgs) {
      apiMsgs.push(m.role === "customer" ? { role: "assistant", content: m.text } : { role: "user", content: m.text });
    }

    const text = await callClaude(apiMsgs, sysPrompt(turnCount + 1));
    setMessages(prev => [...prev, { role: "customer", text }]);
    setLoading(false); setMode("speaking");
    voice.speak(text, () => setMode("idle"));
  };

  const toggleMic = () => {
    if (voice.isListening) {
      voice.stopListening();
      // Auto-send after stopping if there's content
      setTimeout(() => {
        const t = voice.transcript?.trim();
        if (t) sendMessage(t);
      }, 300);
    } else {
      voice.stopSpeaking();
      setInput(""); voice.setTranscript("");
      voice.startListening();
      setMode("listening");
    }
  };

  const handleEnd = async () => {
    voice.stopListening(); voice.stopSpeaking();
    setLoading(true);
    const convo = messages.map(m => m.role === "sa" ? `SA: ${m.text}` : `${scenario.persona}: ${m.text}`).join("\n\n");
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          messages: [{ role: "user", content: `Expert pre-sales coach evaluating a ServiceNow SA's role-play.

SCENARIO: ${scenario.title} | ${scenario.vertical} | ${scenario.product}
PROSPECT: ${scenario.persona}, ${scenario.personaTitle} at ${scenario.company}
OBJECTIVES: ${scenario.objectives.join("; ")}

CONVERSATION:
${convo}

Respond ONLY with valid JSON (no markdown):
{"overallScore":<1-10>,"scores":{"discovery":<1-10>,"productKnowledge":<1-10>,"verticalExpertise":<1-10>,"objectionHandling":<1-10>,"nextSteps":<1-10>},"objectiveResults":[${scenario.objectives.map(() => '"met"|"partial"|"missed"').join(",")}],"strengths":["...","..."],"improvements":["...","...","..."],"coachingTip":"...","missedOpportunity":"..."}` }],
        }),
      });
      const d = await r.json();
      const raw = d.content?.[0]?.text || "{}";
      setFeedback(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch (e) { setFeedback({ overallScore: 0, error: true }); }
    setLoading(false); onEnd();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A42", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0F1624" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#E8ECF4", margin: 0 }}>{scenario.persona}</p>
          <p style={{ fontSize: 11, color: "#4D5E80", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{scenario.personaTitle}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => voice.setVoiceEnabled(!voice.voiceEnabled)} style={{
            padding: "4px 8px", borderRadius: 6, border: "1px solid #1E2A42",
            background: voice.voiceEnabled ? "rgba(26,107,245,0.1)" : "transparent",
            fontSize: 14, color: voice.voiceEnabled ? "#1A6BF5" : "#3D4B66",
          }}>{voice.voiceEnabled ? "🔊" : "🔇"}</button>
          <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(26,107,245,0.1)", border: "1px solid rgba(26,107,245,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#1A6BF5" }}>
            Turn {turnCount}
          </div>
          <button onClick={handleEnd} disabled={messages.length < 2 || loading} style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid #DC354540",
            background: "rgba(220,53,69,0.08)", color: "#DC3545",
            fontSize: 11, fontWeight: 600, opacity: messages.length < 2 ? 0.4 : 1,
          }}>End</button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", WebkitOverflowScrolling: "touch" }}>
        {!started && (
          <div style={{ textAlign: "center", paddingTop: 50, animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#A8B8DA", marginBottom: 8 }}>Voice Role-Play</p>
            <p style={{ fontSize: 13, color: "#4D5E80", marginBottom: 8, lineHeight: 1.6 }}>
              {scenario.persona} will open the conversation.<br />Respond by tapping the mic and speaking.
            </p>
            <p style={{ fontSize: 11, color: "#3D4B66", marginBottom: 28, fontFamily: "'JetBrains Mono', monospace" }}>
              You can also type if you prefer
            </p>
            <button onClick={startConversation} style={{
              padding: "14px 36px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #1A6BF5, #0D4CD4)",
              color: "#fff", fontSize: 15, fontWeight: 600,
              boxShadow: "0 6px 24px rgba(26,107,245,0.3)",
            }}>Start Conversation</button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "sa" ? "flex-end" : "flex-start", marginBottom: 14, animation: `fadeIn 0.3s ease` }}>
            {msg.role === "customer" && (
              <div style={{ width: 30, height: 30, borderRadius: 8, marginRight: 8, marginTop: 2, flexShrink: 0, background: "#1E2A42", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
            )}
            <div style={{
              maxWidth: "80%", padding: "12px 16px", fontSize: 13, lineHeight: 1.7,
              borderRadius: msg.role === "sa" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              background: msg.role === "sa" ? "linear-gradient(135deg, #1A6BF5, #0D4CD4)" : "#151D2E",
              color: msg.role === "sa" ? "#fff" : "#C8D4E8",
              border: msg.role === "sa" ? "none" : "1px solid #1E2A42",
            }}>{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1E2A42", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
            <div style={{ background: "#151D2E", border: "1px solid #1E2A42", borderRadius: "4px 14px 14px 14px", padding: "14px 18px", display: "flex", gap: 5 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#4D5E80", animation: `typing 1s ease ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}

        {/* Live transcript preview */}
        {voice.isListening && voice.transcript && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, opacity: 0.6 }}>
            <div style={{ maxWidth: "80%", padding: "12px 16px", fontSize: 13, lineHeight: 1.7, borderRadius: "14px 4px 14px 14px", background: "rgba(26,107,245,0.15)", color: "#8BB8F5", border: "1px dashed rgba(26,107,245,0.3)", fontStyle: "italic" }}>
              {voice.transcript}...
            </div>
          </div>
        )}
      </div>

      {/* Voice Input Bar */}
      {started && (
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid #1E2A42", background: "#0A0E17" }}>
          {/* Status indicator */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              color: mode === "listening" ? "#DC3545" : mode === "speaking" ? "#1A6BF5" : mode === "thinking" ? "#E8A817" : "#3D4B66",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {mode === "listening" ? "● LISTENING..." : mode === "speaking" ? "● CUSTOMER SPEAKING..." : mode === "thinking" ? "● THINKING..." : "TAP MIC TO RESPOND"}
            </span>
          </div>

          {/* Waveform when listening */}
          {voice.isListening && (
            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12, height: 28, alignItems: "center" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  width: 3, borderRadius: 2, background: "#DC3545",
                  animation: `waveform 0.8s ease ${i * 0.07}s infinite`,
                }} />
              ))}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
            {/* Text input fallback */}
            <input
              value={voice.isListening ? voice.transcript : input}
              onChange={e => { if (!voice.isListening) setInput(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Or type here..."
              style={{
                flex: 1, background: "#111827", border: "1px solid #1E2A42", borderRadius: 12,
                padding: "12px 16px", fontSize: 13, color: "#E8ECF4", maxWidth: 260,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            {/* Mic button */}
            {voice.hasRecognition && (
              <button onClick={toggleMic} disabled={loading || mode === "thinking"} style={{
                width: 56, height: 56, borderRadius: "50%", border: "none",
                background: voice.isListening
                  ? "linear-gradient(135deg, #DC3545, #B91C2C)"
                  : "linear-gradient(135deg, #1A6BF5, #0D4CD4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: voice.isListening ? "0 0 0 0 rgba(220,53,69,0.4)" : "0 4px 16px rgba(26,107,245,0.3)",
                animation: voice.isListening ? "micPulse 1.5s ease infinite" : mode === "speaking" ? "speakPulse 1.5s ease infinite" : "none",
                transition: "all 0.2s", flexShrink: 0,
                opacity: loading || mode === "thinking" ? 0.4 : 1,
              }}>
                <span style={{ fontSize: 24 }}>{voice.isListening ? "⏹" : "🎙️"}</span>
              </button>
            )}

            {/* Send button (text fallback) */}
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading || voice.isListening} style={{
              width: 44, height: 44, borderRadius: 12, border: "none",
              background: input.trim() && !loading ? "#1E2A42" : "#111827",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: input.trim() && !loading && !voice.isListening ? 0.8 : 0.3, flexShrink: 0,
            }}>
              <span style={{ fontSize: 16 }}>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DEBRIEF SCREEN
// ============================================================

function DebriefScreen({ scenario, messages, feedback, setFeedback, onHome, onRetry }) {
  if (!feedback) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(26,107,245,0.1)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s ease infinite" }}>🧠</div>
      <p style={{ fontSize: 14, color: "#6B7A99" }}>Analyzing your performance...</p>
    </div>
  );

  if (feedback.error) return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <p style={{ color: "#DC3545", marginBottom: 16 }}>Couldn't generate feedback.</p>
      <button onClick={onRetry} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "#1A6BF5", color: "#fff", fontSize: 14, fontWeight: 600 }}>Retry</button>
    </div>
  );

  const sc = (s) => s >= 8 ? "#10B981" : s >= 6 ? "#E8A817" : "#DC3545";
  const cats = [
    { key: "discovery", label: "Discovery & Questioning" },
    { key: "productKnowledge", label: "Product Knowledge" },
    { key: "verticalExpertise", label: "Vertical Expertise" },
    { key: "objectionHandling", label: "Objection Handling" },
    { key: "nextSteps", label: "Next Steps & Close" },
  ];
  const objIcons = { met: "✅", partial: "🔶", missed: "❌" };
  const objColors = { met: "#10B981", partial: "#E8A817", missed: "#DC3545" };

  return (
    <div style={{ padding: "0 20px 40px", overflowY: "auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ padding: "32px 0 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Session Debrief</p>
        <div style={{ width: 88, height: 88, borderRadius: "50%", margin: "0 auto 16px", background: `conic-gradient(${sc(feedback.overallScore)} ${feedback.overallScore * 10}%, #1E2A42 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0A0E17", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: sc(feedback.overallScore), fontFamily: "'JetBrains Mono', monospace" }}>{feedback.overallScore}</span>
            <span style={{ fontSize: 10, color: "#4D5E80" }}>/10</span>
          </div>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#A8B8DA" }}>{scenario.title}</p>
        <p style={{ fontSize: 12, color: "#4D5E80" }}>{messages.filter(m => m.role === "sa").length} responses • {messages.length} exchanges</p>
      </div>

      <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Skill Breakdown</p>
        {cats.map(c => {
          const s = feedback.scores?.[c.key] || 0;
          return (
            <div key={c.key} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#8B9BC0" }}>{c.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sc(s), fontFamily: "'JetBrains Mono', monospace" }}>{s}/10</span>
              </div>
              <div style={{ width: "100%", height: 4, background: "#1E2A42", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${s * 10}%`, height: "100%", background: sc(s), borderRadius: 2, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Objectives</p>
        {scenario.objectives.map((o, i) => {
          const r = feedback.objectiveResults?.[i] || "missed";
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>{objIcons[r]}</span>
              <div>
                <p style={{ fontSize: 13, color: "#A8B8DA", lineHeight: 1.4 }}>{o}</p>
                <span style={{ fontSize: 10, fontWeight: 600, color: objColors[r], textTransform: "uppercase" }}>{r}</span>
              </div>
            </div>
          );
        })}
      </div>

      {feedback.strengths?.length > 0 && (
        <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#10B981", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>💪 Strengths</p>
          {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: "#A8B8DA", lineHeight: 1.6, marginBottom: 6 }}>• {s}</p>)}
        </div>
      )}

      {feedback.improvements?.length > 0 && (
        <div style={{ background: "#111827", border: "1px solid #1E2A42", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#E8A817", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🎯 Improve</p>
          {feedback.improvements.map((s, i) => <p key={i} style={{ fontSize: 13, color: "#A8B8DA", lineHeight: 1.6, marginBottom: 6 }}>• {s}</p>)}
        </div>
      )}

      {feedback.missedOpportunity && (
        <div style={{ background: "rgba(26,107,245,0.05)", border: "1px solid rgba(26,107,245,0.2)", borderRadius: 14, padding: "18px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#1A6BF5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>💡 Missed Opportunity</p>
          <p style={{ fontSize: 13, color: "#A8B8DA", lineHeight: 1.7 }}>{feedback.missedOpportunity}</p>
        </div>
      )}

      {feedback.coachingTip && (
        <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#10B981", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏆 Coach's Note</p>
          <p style={{ fontSize: 14, color: "#A8B8DA", lineHeight: 1.7, fontStyle: "italic" }}>"{feedback.coachingTip}"</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onRetry} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "1px solid #1E2A42", background: "#111827", color: "#A8B8DA", fontSize: 14, fontWeight: 600 }}>Retry</button>
        <button onClick={onHome} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1A6BF5, #0D4CD4)", color: "#fff", fontSize: 14, fontWeight: 700 }}>New Scenario</button>
      </div>
    </div>
  );
}
