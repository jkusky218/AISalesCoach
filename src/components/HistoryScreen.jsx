import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const sc = (s) => s >= 8 ? '#10B981' : s >= 6 ? '#E8A817' : '#DC3545';

export default function HistoryScreen({ session, onBack, onViewDebrief }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (data) setSessions(data);
    setLoading(false);
  };

  const deleteSession = async (id) => {
    await supabase.from('sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      maxWidth: 520, margin: '0 auto', minHeight: '100vh',
      background: '#0A0E17', color: '#E8ECF4',
    }}>
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6B7A99', fontSize: 13, cursor: 'pointer', padding: 0 }}>← Back</button>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#E8ECF4', margin: 0 }}>Session History</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontSize: 13, color: '#4D5E80' }}>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#6B7A99', marginBottom: 8 }}>No sessions yet</p>
            <p style={{ fontSize: 13, color: '#3D4B66' }}>Complete a role-play to see your history here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map((s, i) => (
              <div key={s.id} style={{
                background: '#111827', border: '1px solid #1E2A42',
                borderRadius: 14, overflow: 'hidden',
                animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
              }}>
                <button onClick={() => onViewDebrief(s)} style={{
                  width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', padding: '16px 18px', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#E8ECF4', margin: 0, lineHeight: 1.3, maxWidth: '75%' }}>{s.scenario_title}</p>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `conic-gradient(${sc(s.overall_score)} ${s.overall_score * 10}%, #1E2A42 0)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc(s.overall_score), fontFamily: "'JetBrains Mono', monospace" }}>{s.overall_score}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7A99', margin: '0 0 4px' }}>{s.persona} — {s.persona_title}</p>
                  <p style={{ fontSize: 11, color: '#3D4B66', fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(s.created_at)}</p>
                </button>
                <div style={{ borderTop: '1px solid #1E2A42', display: 'flex' }}>
                  <button onClick={() => onViewDebrief(s)} style={{
                    flex: 1, padding: '10px 0', background: 'none', border: 'none',
                    color: '#1A6BF5', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>View Debrief</button>
                  <div style={{ width: 1, background: '#1E2A42' }} />
                  <button onClick={() => deleteSession(s.id)} style={{
                    flex: 1, padding: '10px 0', background: 'none', border: 'none',
                    color: '#4D5E80', fontSize: 12, cursor: 'pointer',
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
