import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import ScenarioBuilder from "./ScenarioBuilder";
import HistoryScreen from "./HistoryScreen";

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
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah — soft, clear female
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
    voiceId: "nPczCjzI2devNBz1zQrb", // Brian — authoritative male
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
    voiceId: "JBFqnCBsd6RMkjVDRZzb", // George — deep, warm male
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
    voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte — confident female
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
// PULL TO REFRESH
// ============================================================

function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const THRESHOLD = 72;

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0) startYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (startYRef.current === null) return;
      const dist = e.touches[0].clientY - startYRef.current;
      if (dist > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPullDistance(Math.min(dist * 0.4, THRESHOLD + 20));
      }
    };
    const onTouchEnd = async () => {
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(0);
        // Check for waiting service worker update
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) await reg.update();
          if (reg?.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
            return;
          }
        }
        await onRefresh();
        setRefreshing(false);
      } else {
        setPullDistance(0);
      }
      startYRef.current = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return { pullDistance, refreshing };
}

// ============================================================
// VOICE HOOKS
// ============================================================

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Tiny silent MP3 — used to unlock <audio> on iOS during a user gesture
const SILENT_MP3 = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAYAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ttsError, setTtsError] = useState("");
  const [pendingTranscript, setPendingTranscript] = useState("");
  const [micLevels, setMicLevels] = useState(new Array(12).fill(0));
  const recognitionRef = useRef(null);
  const audioElRef = useRef(null);
  const audioSourceRef = useRef(null);
  const audioCtxRef = useRef(null);
  const interimRef = useRef("");
  const onEndSendRef = useRef(null);
  const micStreamRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const micRafRef = useRef(null);

  // Called synchronously inside a user gesture — unlocks audio for iOS
  const unlockAudio = useCallback(() => {
    // Create and unlock a persistent <audio> element
    if (!audioElRef.current) {
      const el = new Audio();
      el.src = SILENT_MP3;
      el.play().catch(() => {});
      audioElRef.current = el;
    }
    // Also create AudioContext for non-iOS
    if (!isIOS) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const createRecognition = () => {
        const recognition = new SpeechRecognition();
        // iOS Safari does not support continuous mode — use single-shot
        recognition.continuous = !isIOS;
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
          const combined = (final + interim).trim();
          interimRef.current = combined;
          setTranscript(combined);
        };

        recognition.onerror = (e) => {
          if (e.error !== "aborted" && e.error !== "no-speech") {
            console.error("Speech error:", e.error);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          stopMicMeter();
          // On iOS, recognition stops naturally — auto-send if we captured anything
          const captured = interimRef.current.trim();
          if (isIOS && captured) {
            if (onEndSendRef.current) {
              onEndSendRef.current(captured);
              interimRef.current = "";
            } else {
              setPendingTranscript(captured);
            }
          }
        };

        return recognition;
      };

      recognitionRef.current = createRecognition();
      // Store factory for iOS re-creation
      recognitionRef.current._create = createRecognition;
    }
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const startMicMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      micAnalyserRef.current = { analyser, ctx };

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const BAR_COUNT = 12;
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels = Array.from({ length: BAR_COUNT }, (_, i) => {
          const idx = Math.floor((i / BAR_COUNT) * dataArray.length * 0.6);
          return Math.min(dataArray[idx] / 255, 1);
        });
        setMicLevels(levels);
        micRafRef.current = requestAnimationFrame(tick);
      };
      micRafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      console.log("Mic meter unavailable:", e.message);
    }
  }, []);

  const stopMicMeter = useCallback(() => {
    if (micRafRef.current) { cancelAnimationFrame(micRafRef.current); micRafRef.current = null; }
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
    micAnalyserRef.current?.ctx.close();
    micAnalyserRef.current = null;
    setMicLevels(new Array(12).fill(0));
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    // iOS: recreate recognition instance each time (Safari requires fresh instance)
    if (isIOS && recognitionRef.current._create) {
      const fresh = recognitionRef.current._create();
      fresh._create = recognitionRef.current._create;
      recognitionRef.current = fresh;
    }
    interimRef.current = "";
    setTranscript("");
    setPendingTranscript("");
    startMicMeter();
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) { console.error("Start error:", e); stopMicMeter(); }
  }, [startMicMeter, stopMicMeter]);

  const stopListening = useCallback(() => {
    stopMicMeter();
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening, stopMicMeter]);

  const speak = useCallback(async (text, voiceId, onDone) => {
    if (!voiceEnabled) { onDone?.(); return; }

    // Stop any current playback
    if (isIOS) {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.src = "";
      }
    } else {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (_) {}
        audioSourceRef.current = null;
      }
    }

    try {
      setIsSpeaking(true);
      setTtsError("");
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`TTS API ${response.status}: ${err.error || "unknown"}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (isIOS) {
        // iOS: reuse the pre-unlocked <audio> element
        const el = audioElRef.current || new Audio();
        audioElRef.current = el;
        el.src = url;
        el.onended = () => { URL.revokeObjectURL(url); setIsSpeaking(false); onDone?.(); };
        el.onerror = () => { URL.revokeObjectURL(url); setIsSpeaking(false); onDone?.(); };
        await el.play();
      } else {
        // Desktop/Android: use AudioContext for reliable async playback
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") await ctx.resume();

        const arrayBuffer = await fetch(url).then(r => r.arrayBuffer());
        URL.revokeObjectURL(url);

        // decodeAudioData: use callback form for max browser compatibility
        const decoded = await new Promise((resolve, reject) =>
          ctx.decodeAudioData(arrayBuffer, resolve, reject)
        );
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);
        audioSourceRef.current = source;
        source.onended = () => { audioSourceRef.current = null; setIsSpeaking(false); onDone?.(); };
        source.start(0);
      }
    } catch (e) {
      console.error("ElevenLabs TTS error:", e);
      setTtsError(e.message);
      setIsSpeaking(false);
      onDone?.();
    }
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (isIOS) {
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current.src = ""; }
    } else {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (_) {}
        audioSourceRef.current = null;
      }
    }
    setIsSpeaking(false);
  }, []);

  const hasRecognition = !!recognitionRef.current;

  return { isListening, transcript, setTranscript, isSpeaking, voiceEnabled, setVoiceEnabled, startListening, stopListening, speak, stopSpeaking, hasRecognition, unlockAudio, ttsError, pendingTranscript, setPendingTranscript, onEndSendRef, interimRef, micLevels };
}

// ============================================================
// MAIN APP
// ============================================================

export default function AISalesCoach({ session }) {
  const [screen, setScreen] = useState("home");
  const [scenario, setScenario] = useState(null);
  const [editScenario, setEditScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [historySession, setHistorySession] = useState(null); // session being viewed from history

  useEffect(() => { loadScenarios(); }, []);

  const loadScenarios = async () => {
    setScenariosLoading(true);
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .order("is_builtin", { ascending: false })
      .order("created_at", { ascending: true });
    if (!error && data) setScenarios(data);
    setScenariosLoading(false);
  };

  const startScenario = (s) => { setScenario(s); setMessages([]); setTurnCount(0); setFeedback(null); setScreen("briefing"); };
  const handleSignOut = () => supabase.auth.signOut();

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
        @keyframes pullSpin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2A3348; border-radius: 2px; }
        input:focus, textarea:focus { outline: none; }
        button { cursor: pointer; }
        button:active { transform: scale(0.97); }
      `}</style>

      {screen === "home" && (
        <HomeScreen
          scenarios={scenarios}
          loading={scenariosLoading}
          onSelect={startScenario}
          onNew={() => { setEditScenario(null); setScreen("builder"); }}
          onEdit={(s) => { setEditScenario(s); setScreen("builder"); }}
          onSignOut={handleSignOut}
          onHistory={() => setScreen("history")}
          onRefresh={loadScenarios}
          session={session}
        />
      )}
      {screen === "history" && (
        <HistoryScreen
          session={session}
          onBack={() => setScreen("home")}
          onViewDebrief={(s) => {
            setHistorySession(s);
            setFeedback(s.feedback);
            setMessages(s.messages);
            setScenario({ title: s.scenario_title, persona: s.persona, personaTitle: s.persona_title, company: s.company, objectives: s.feedback?.objectiveResults ? [] : [] });
            setScreen("debrief");
          }}
        />
      )}
      {screen === "builder" && (
        <ScenarioBuilder
          onBack={() => setScreen("home")}
          onApprove={(newScenario) => { loadScenarios(); setScreen("home"); }}
          editScenario={editScenario}
          session={session}
        />
      )}
      {screen === "briefing" && <BriefingScreen scenario={scenario} onStart={() => setScreen("roleplay")} onBack={() => setScreen("home")} />}
      {screen === "roleplay" && <RoleplayScreen scenario={scenario} messages={messages} setMessages={setMessages} turnCount={turnCount} setTurnCount={setTurnCount} onEnd={() => setScreen("debrief")} setFeedback={setFeedback} session={session} />}
      {screen === "debrief" && <DebriefScreen scenario={scenario} messages={messages} feedback={feedback} setFeedback={setFeedback} onHome={() => setScreen("home")} onRetry={() => startScenario(scenario)} />}
    </div>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================

function HomeScreen({ scenarios, loading, onSelect, onNew, onEdit, onSignOut, onHistory, session, onRefresh }) {
  const { pullDistance, refreshing } = usePullToRefresh(onRefresh);
  const THRESHOLD = 72;
  const pulled = pullDistance > 0 || refreshing;

  return (
    <div style={{ padding: "0 20px 40px", animation: "fadeIn 0.5s ease" }}>
      {/* Pull to refresh indicator */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: `translateX(-50%) translateY(${pulled ? Math.min(pullDistance, THRESHOLD) - 44 : -44}px)`,
        transition: pullDistance === 0 ? "transform 0.3s ease" : "none",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: "50%",
        background: pullDistance >= THRESHOLD || refreshing ? "#1A6BF5" : "#1E2A42",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}>
        <span style={{
          fontSize: 16,
          display: "inline-block",
          animation: refreshing ? "pullSpin 0.8s linear infinite" : "none",
          transform: !refreshing ? `rotate(${Math.min(pullDistance / THRESHOLD, 1) * 180}deg)` : undefined,
        }}>↻</span>
      </div>
      {/* Header */}
      <div style={{ padding: "32px 0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11, flexShrink: 0,
            background: "linear-gradient(135deg, #1A6BF5 0%, #0D4CD4 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(26,107,245,0.25)",
            fontSize: 16, fontWeight: 700, color: "#fff",
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.5,
          }}>SC</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, margin: 0, color: "#fff" }}>Sales Craft</h1>
            <p style={{ fontSize: 11, color: "#3D4B66", fontFamily: "'JetBrains Mono', monospace" }}>Voice Enabled 🎙️</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onHistory} style={{
            background: "none", border: "1px solid #1E2A42", borderRadius: 8,
            padding: "6px 10px", fontSize: 11, color: "#4D5E80", cursor: "pointer",
          }}>📋 History</button>
          <button onClick={onSignOut} style={{
            background: "none", border: "1px solid #1E2A42", borderRadius: 8,
            padding: "6px 10px", fontSize: 11, color: "#4D5E80", cursor: "pointer",
          }}>Sign out</button>
        </div>
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(26,107,245,0.08) 0%, rgba(26,107,245,0.02) 100%)",
        border: "1px solid rgba(26,107,245,0.15)", borderRadius: 12,
        padding: "14px 16px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>🎙️</span>
        <p style={{ fontSize: 12, color: "#8B9BC0", lineHeight: 1.6 }}>
          Speak your responses like a real meeting. The customer talks back. <strong style={{ color: "#A8B8DA" }}>5-15 min per session.</strong>
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#3D4B66", textTransform: "uppercase", letterSpacing: 1.5 }}>Scenarios</p>
        <button onClick={onNew} style={{
          padding: "6px 12px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg, #1A6BF5, #0D4CD4)",
          color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>+ New</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 13, color: "#4D5E80" }}>Loading scenarios...</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scenarios.map((s, i) => (
            <div key={s.id} style={{ position: "relative", animation: `fadeIn 0.4s ease ${i * 0.06}s both` }}>
              <button onClick={() => onSelect(s)}
                style={{
                  width: "100%", textAlign: "left", background: "#111827",
                  border: "1px solid #1E2A42", borderRadius: 14, padding: "16px 18px",
                  paddingRight: s.is_builtin ? "18px" : "52px",
                  transition: "all 0.2s",
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
                  {!s.is_builtin && <span style={{ fontSize: 10, color: "#1A6BF5", fontFamily: "'JetBrains Mono', monospace" }}>custom</span>}
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#E8ECF4", margin: "0 0 6px", lineHeight: 1.3 }}>{s.title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7A99" }}>
                  <span>{s.persona} — {s.personaTitle}</span>
                </div>
                <p style={{ fontSize: 11, color: "#3D4B66", marginTop: 4 }}>{s.company}</p>
              </button>
              {!s.is_builtin && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "#1E2A42", border: "none", borderRadius: 6,
                  padding: "5px 8px", fontSize: 11, color: "#6B7A99", cursor: "pointer",
                }}>Edit</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// BRIEFING SCREEN
// ============================================================

function BriefingScreen({ scenario, onStart, onBack }) {
  return (
    <div style={{ padding: "0 20px 40px", animation: "fadeIn 0.4s ease" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B7A99", fontSize: 13, padding: "calc(env(safe-area-inset-top) + 16px) 0 16px" }}>← Back</button>

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

function RoleplayScreen({ scenario, messages, setMessages, turnCount, setTurnCount, onEnd, setFeedback, session }) {
  const voice = useVoice();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("idle"); // idle, listening, thinking, speaking
  const scrollRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Keep screen awake during roleplay
  useEffect(() => {
    const acquireWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (e) {
          console.log("Wake lock unavailable:", e.message);
        }
      }
    };
    acquireWakeLock();

    // Re-acquire if tab becomes visible again (iOS releases lock on background)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquireWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      wakeLockRef.current?.release();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, voice.transcript]);

  // Sync voice transcript to input
  useEffect(() => {
    if (voice.transcript) setInput(voice.transcript);
  }, [voice.transcript]);

  // Register auto-send callback for iOS (recognition ends naturally)
  useEffect(() => {
    voice.onEndSendRef.current = (text) => {
      if (!loading) sendMessage(text);
    };
    return () => { voice.onEndSendRef.current = null; };
  });

  // If there's a pending transcript from before conversation started, send it now
  useEffect(() => {
    if (started && voice.pendingTranscript && !loading) {
      const t = voice.pendingTranscript;
      voice.setPendingTranscript("");
      sendMessage(t);
    }
  }, [started, voice.pendingTranscript]);

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
    voice.unlockAudio(); // Must be called synchronously within user gesture to unlock iOS audio
    setStarted(true); setLoading(true); setMode("thinking");
    const text = await callClaude(
      [{ role: "user", content: "The SA just joined the call and introduced themselves. Open the conversation in character. Keep it to 2-3 sentences." }],
      sysPrompt(0)
    );
    setMessages([{ role: "customer", text }]);
    setLoading(false); setMode("speaking");
    voice.speak(text, scenario.voice_id || scenario.voiceId, () => setMode("idle"));
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
    voice.speak(text, scenario.voice_id || scenario.voiceId, () => setMode("idle"));
  };

  const toggleMic = () => {
    voice.unlockAudio();
    if (voice.isListening) {
      voice.stopListening();
      // iOS: onend fires automatically and calls onEndSendRef — nothing to do here
      // Desktop: onend doesn't auto-send, so we trigger it after a short delay
      if (!isIOS) {
        setTimeout(() => {
          const captured = voice.interimRef?.current?.trim() || input.trim();
          if (captured) sendMessage(captured);
        }, 200);
      }
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
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setFeedback(parsed);
      // Auto-save session to Supabase
      try {
        await supabase.from("sessions").insert({
          user_id: session.user.id,
          scenario_id: scenario.id || null,
          scenario_title: scenario.title,
          persona: scenario.persona,
          persona_title: scenario.persona_title || scenario.personaTitle,
          company: scenario.company,
          messages,
          feedback: parsed,
          overall_score: parsed.overallScore,
        });
      } catch (e) { console.error("Session save failed:", e); }
    } catch (e) { setFeedback({ overallScore: 0, error: true }); }
    setLoading(false); onEnd();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 16px 12px", borderBottom: "1px solid #1E2A42", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0F1624" }}>
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
        <div style={{ padding: "12px 16px calc(env(safe-area-inset-bottom) + 20px)", borderTop: "1px solid #1E2A42", background: "#0A0E17" }}>
          {/* Status indicator */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              color: mode === "listening" ? "#DC3545" : mode === "speaking" ? "#1A6BF5" : mode === "thinking" ? "#E8A817" : "#3D4B66",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {mode === "listening" ? "● LISTENING..." : mode === "speaking" ? "● CUSTOMER SPEAKING..." : mode === "thinking" ? "● THINKING..." : "TAP MIC TO RESPOND"}
            </span>
            {voice.ttsError && (
              <p style={{ fontSize: 10, color: "#DC3545", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                ⚠ {voice.ttsError}
              </p>
            )}
          </div>

          {/* Real mic level meter */}
          {voice.isListening && (
            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12, height: 36, alignItems: "center" }}>
              {voice.micLevels.map((level, i) => {
                const minH = 3;
                const maxH = 34;
                const h = Math.max(minH, Math.round(minH + level * (maxH - minH)));
                // Color shifts green→yellow→red with volume
                const r = Math.round(40 + level * 192);
                const g = Math.round(220 - level * 120);
                const color = `rgb(${r},${g},60)`;
                return (
                  <div key={i} style={{
                    width: 4, borderRadius: 2,
                    height: h,
                    background: color,
                    transition: "height 0.05s ease, background 0.1s ease",
                  }} />
                );
              })}
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

          {/* End session button — full width, always reachable */}
          {messages.length >= 2 && (
            <button onClick={handleEnd} disabled={loading} style={{
              width: "100%", marginTop: 10, padding: "11px 0", borderRadius: 10,
              border: "1px solid rgba(220,53,69,0.3)",
              background: "rgba(220,53,69,0.08)", color: "#DC3545",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: loading ? 0.4 : 1,
            }}>
              {loading ? "Generating debrief..." : "End Session & Get Debrief →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DEBRIEF SCREEN
// ============================================================

function buildShareText(scenario, messages, feedback) {
  const cats = { discovery: "Discovery", productKnowledge: "Product Knowledge", verticalExpertise: "Vertical Expertise", objectionHandling: "Objection Handling", nextSteps: "Next Steps" };
  const bar = (s) => s >= 8 ? "🟢" : s >= 6 ? "🟡" : "🔴";
  return [
    `📊 Sales Craft — Session Debrief`,
    `Scenario: ${scenario?.title || "Role-Play"}`,
    `Persona: ${scenario?.persona || ""} — ${scenario?.personaTitle || ""}`,
    ``,
    `Overall Score: ${feedback.overallScore}/10`,
    ``,
    `Skill Scores:`,
    ...Object.entries(cats).map(([k, label]) => `${bar(feedback.scores?.[k])} ${label}: ${feedback.scores?.[k]}/10`),
    ``,
    feedback.strengths?.length ? `💪 Strengths:\n${feedback.strengths.map(s => `• ${s}`).join("\n")}` : "",
    feedback.improvements?.length ? `🎯 Improvements:\n${feedback.improvements.map(s => `• ${s}`).join("\n")}` : "",
    feedback.coachingTip ? `🏆 Coach's Note:\n"${feedback.coachingTip}"` : "",
    ``,
    `Practiced with Sales Craft — salescraft.app`,
  ].filter(Boolean).join("\n");
}

async function shareDebrief(text) {
  if (navigator.share) {
    await navigator.share({ title: "Sales Craft Debrief", text });
  } else {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }
}

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

      <button
        onClick={() => shareDebrief(buildShareText(scenario, messages, feedback))}
        style={{
          width: "100%", padding: "14px 0", borderRadius: 12, marginBottom: 10,
          border: "1px solid rgba(26,107,245,0.3)",
          background: "rgba(26,107,245,0.08)", color: "#1A6BF5",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
        <span>⬆</span> Share Results
      </button>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onRetry} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "1px solid #1E2A42", background: "#111827", color: "#A8B8DA", fontSize: 14, fontWeight: 600 }}>Retry</button>
        <button onClick={onHome} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1A6BF5, #0D4CD4)", color: "#fff", fontSize: 14, fontWeight: 700 }}>New Scenario</button>
      </div>
    </div>
  );
}
