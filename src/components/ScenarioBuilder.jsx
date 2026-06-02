import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const QUESTIONS = [
  {
    id: 'context',
    question: "What's the context for this scenario? Describe the customer situation, industry, and what product area you want to practice.",
    placeholder: "e.g. A VP of IT at a mid-size healthcare company who's evaluating ServiceNow ITSM to replace ServiceDesk Plus. They're skeptical about migration complexity and cost.",
  },
  {
    id: 'persona',
    question: "Who is the customer persona? Describe their role, personality, and what makes them a tough conversation.",
    placeholder: "e.g. A pragmatic CIO who came up through infrastructure. Doesn't trust vendors. Will challenge every claim with 'prove it'. Has a CFO blocking spend.",
  },
  {
    id: 'objectives',
    question: "What should the SA accomplish in this session? List the key objectives.",
    placeholder: "e.g. Uncover their top 3 pain points, neutralize the 'too expensive' objection, get agreement on a discovery workshop.",
  },
  {
    id: 'difficulty',
    question: "How hard should this be? Intermediate (realistic pushback, learnable) or Advanced (tough objections, competitive threats, multiple blockers)?",
    placeholder: "e.g. Advanced — they should bring up a competitor and have a budget freeze mid-conversation.",
  },
];

export default function ScenarioBuilder({ onBack, onApprove, editScenario = null, session }) {
  const [step, setStep] = useState(0); // 0-3 = Q&A, 4 = generating, 5 = preview
  const [answers, setAnswers] = useState({ context: '', persona: '', objectives: '', difficulty: '' });
  const [currentInput, setCurrentInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileText, setFileText] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const currentQ = QUESTIONS[step];
  const progress = ((step) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!currentInput.trim()) return;
    const key = QUESTIONS[step].id;
    const newAnswers = { ...answers, [key]: currentInput.trim() };
    setAnswers(newAnswers);
    setCurrentInput('');

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateScenario(newAnswers);
    }
  };

  const handleFileUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', f);
      const res = await fetch('/api/extract', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFileText(data.text);
    } catch (err) {
      setError(`File error: ${err.message}`);
      setFile(null);
      setFileText('');
    }
    setFileLoading(false);
  };

  const generateScenario = async (finalAnswers) => {
    setGenerating(true);
    setError('');
    const answersText = QUESTIONS.map(q => `${q.question}\n${finalAnswers[q.id]}`).join('\n\n');

    try {
      const res = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersText, fileText: fileText || null }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGenerated(data);
      setStep(5);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
    setGenerating(false);
  };

  const handleApprove = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...generated,
        is_builtin: false,
        created_by: session.user.id,
      };

      let result;
      if (editScenario) {
        result = await supabase.from('scenarios').update(payload).eq('id', editScenario.id).select().single();
      } else {
        result = await supabase.from('scenarios').insert(payload).select().single();
      }

      if (result.error) throw result.error;
      onApprove(result.data);
    } catch (err) {
      setError(`Save failed: ${err.message}`);
    }
    setSaving(false);
  };

  const DIFF_COLORS = { Intermediate: '#E8A817', Advanced: '#DC3545' };

  // Generating state
  if (generating) {
    return (
      <div style={screenStyle}>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🧠</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#A8B8DA', marginBottom: 8 }}>Building your scenario...</p>
          <p style={{ fontSize: 13, color: '#4D5E80' }}>Crafting the persona, situation, and objectives</p>
        </div>
      </div>
    );
  }

  // Preview state
  if (step === 5 && generated) {
    const diffColor = DIFF_COLORS[generated.difficulty] || '#E8A817';
    return (
      <div style={screenStyle}>
        <div style={{ padding: '0 20px 40px' }}>
          <button onClick={onBack} style={backBtnStyle}>← Reject & Discard</button>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#3D4B66', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Preview Scenario</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{generated.title}</h2>
            <p style={{ fontSize: 12, color: '#6B7A99', fontFamily: "'JetBrains Mono', monospace" }}>{generated.vertical} • {generated.product}</p>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: diffColor + '18', color: diffColor, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'JetBrains Mono', monospace" }}>{generated.difficulty}</span>
            </div>
            <p style={labelStyle}>Persona</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#E8ECF4', margin: '0 0 2px' }}>{generated.persona}</p>
            <p style={{ fontSize: 13, color: '#8B9BC0', margin: '0 0 4px' }}>{generated.personaTitle} — {generated.company}</p>
            <p style={{ fontSize: 12, color: '#4D5E80' }}>{generated.companyDesc}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Situation</p>
            <p style={{ fontSize: 13, color: '#A8B8DA', lineHeight: 1.7 }}>{generated.setup}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Objectives</p>
            {generated.objectives?.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: 'rgba(26,107,245,0.1)', border: '1px solid rgba(26,107,245,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1A6BF5', fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: '#A8B8DA', lineHeight: 1.5 }}>{o}</p>
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <p style={labelStyle}>Persona Prompt Preview</p>
            <p style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {generated.personaPrompt?.slice(0, 400)}...
            </p>
          </div>

          {error && <div style={errorStyle}><p style={{ fontSize: 13, color: '#DC3545' }}>{error}</p></div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onBack} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: '1px solid rgba(220,53,69,0.3)', background: 'rgba(220,53,69,0.08)', color: '#DC3545', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Reject
            </button>
            <button onClick={handleApprove} disabled={saving} style={{ flex: 2, padding: '14px 0', borderRadius: 12, border: 'none', background: saving ? '#1E2A42' : 'linear-gradient(135deg, #10B981, #059669)', color: saving ? '#6B7A99' : '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: saving ? 'none' : '0 6px 24px rgba(16,185,129,0.25)' }}>
              {saving ? 'Saving...' : '✓ Approve & Go Live'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Q&A flow
  return (
    <div style={screenStyle}>
      <div style={{ padding: '0 20px 40px' }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#E8ECF4' }}>{editScenario ? 'Edit Scenario' : 'New Scenario'}</p>
            <p style={{ fontSize: 11, color: '#3D4B66', fontFamily: "'JetBrains Mono', monospace" }}>{step + 1} / {QUESTIONS.length}</p>
          </div>
          <div style={{ width: '100%', height: 3, background: '#1E2A42', borderRadius: 2 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#1A6BF5', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#E8ECF4', lineHeight: 1.5, marginBottom: 6 }}>{currentQ.question}</p>
        </div>

        <textarea
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleNext(); }}
          placeholder={currentQ.placeholder}
          rows={5}
          autoFocus
          style={{
            width: '100%', background: '#111827', border: '1px solid #1E2A42',
            borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#E8ECF4',
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, resize: 'none',
            marginBottom: 12,
          }}
        />

        {/* File upload — only on last question */}
        {step === QUESTIONS.length - 1 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#4D5E80', marginBottom: 8 }}>
              Optional: upload supporting materials (PDF or PPTX)
            </p>
            <button onClick={() => fileRef.current?.click()} style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: `1px dashed ${file ? '#10B981' : '#1E2A42'}`,
              background: file ? 'rgba(16,185,129,0.05)' : 'transparent',
              color: file ? '#10B981' : '#4D5E80', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {fileLoading ? '⏳ Extracting...' : file ? `✓ ${file.name}` : '📎 Upload deck or notes'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.pptx" onChange={handleFileUpload} style={{ display: 'none' }} />
            {file && !fileLoading && (
              <p style={{ fontSize: 11, color: '#4D5E80', marginTop: 6, textAlign: 'center' }}>
                {fileText.length.toLocaleString()} characters extracted
              </p>
            )}
          </div>
        )}

        {error && <div style={{ ...errorStyle, marginBottom: 12 }}><p style={{ fontSize: 13, color: '#DC3545' }}>{error}</p></div>}

        <button
          onClick={handleNext}
          disabled={!currentInput.trim() || fileLoading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
            background: currentInput.trim() ? 'linear-gradient(135deg, #1A6BF5, #0D4CD4)' : '#1E2A42',
            color: currentInput.trim() ? '#fff' : '#4D5E80',
            fontSize: 14, fontWeight: 700, cursor: currentInput.trim() ? 'pointer' : 'default',
            boxShadow: currentInput.trim() ? '0 6px 24px rgba(26,107,245,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {step < QUESTIONS.length - 1 ? 'Next →' : '✨ Generate Scenario'}
        </button>

        <p style={{ fontSize: 11, color: '#2A3348', textAlign: 'center', marginTop: 10 }}>⌘↵ to continue</p>
      </div>
    </div>
  );
}

const screenStyle = {
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  maxWidth: 520, margin: '0 auto', minHeight: '100vh',
  background: '#0A0E17', color: '#E8ECF4',
};

const backBtnStyle = {
  background: 'none', border: 'none', color: '#6B7A99',
  fontSize: 13, padding: '20px 0 16px', cursor: 'pointer',
  display: 'block',
};

const cardStyle = {
  background: '#111827', border: '1px solid #1E2A42',
  borderRadius: 14, padding: '18px', marginBottom: 12,
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: '#3D4B66',
  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
};

const errorStyle = {
  background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)',
  borderRadius: 8, padding: '10px 12px',
};
