import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AISalesCoach from './components/AISalesCoachPrototype';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0E17',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #1A6BF5, #0D4CD4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#fff',
          fontFamily: 'monospace',
        }}>SC</div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  return <AISalesCoach session={session} />;
}
