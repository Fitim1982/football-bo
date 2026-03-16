"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Verbindung zum Lagerhaus aufbauen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Settings() {
  const [sportradarKey, setSportradarKey] = useState('');
  const [apiFootballKey, setApiFootballKey] = useState('');
  const [meldung, setMeldung] = useState('');

  // 2. Beim Öffnen der Seite: Gucken, ob schon was im Schließfach liegt
  useEffect(() => {
    async function ladeSchluessel() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        data.forEach(zeile => {
          if (zeile.key === 'sportradar_api_key') setSportradarKey(zeile.value);
          if (zeile.key === 'api_football_key') setApiFootballKey(zeile.value);
        });
      }
    }
    ladeSchluessel();
  }, []);

  // 3. Wenn der Knopf gedrückt wird: Ab ins Schließfach damit!
  async function speichern() {
    setMeldung('⏳ Speichere...');
    await supabase.from('settings').upsert({ key: 'sportradar_api_key', value: sportradarKey });
    await supabase.from('settings').upsert({ key: 'api_football_key', value: apiFootballKey });
    setMeldung('✅ Erfolgreich gespeichert!');
    
    // Meldung nach 3 Sekunden wieder verstecken
    setTimeout(() => setMeldung(''), 3000); 
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <h1 style={{ color: '#00ff88' }}>⚙️ Steuerzentrale (Einstellungen)</h1>
      <p style={{ color: '#ccc' }}>Hier bereiten wir die Anschlüsse für die echten Live-Fußballdaten vor.</p>
      
      <div style={{ backgroundColor: '#222', padding: '25px', borderRadius: '10px', marginTop: '30px' }}>
        
        <label style={{ display: 'block', marginBottom: '10px', color: '#00ff88', fontWeight: 'bold' }}>
          Sportradar API-Schlüssel:
        </label>
        <input 
          type="text" 
          value={sportradarKey}
          onChange={(e) => setSportradarKey(e.target.value)}
          placeholder="Schlüssel hier einfügen..." 
          style={{ width: '95%', padding: '12px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#111', color: '#fff', marginBottom: '25px' }}
        />

        <label style={{ display: 'block', marginBottom: '10px', color: '#00ff88', fontWeight: 'bold' }}>
          API-Football Schlüssel:
        </label>
        <input 
          type="text" 
          value={apiFootballKey}
          onChange={(e) => setApiFootballKey(e.target.value)}
          placeholder="Schlüssel hier einfügen..." 
          style={{ width: '95%', padding: '12px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#111', color: '#fff', marginBottom: '25px' }}
        />

        <button 
          onClick={speichern}
          style={{ backgroundColor: '#00ff88', color: '#000', padding: '12px 24px', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          💾 Einstellungen speichern
        </button>

        {/* Hier taucht die Erfolgsmeldung auf */}
        {meldung && <p style={{ color: '#00ff88', marginTop: '15px', fontWeight: 'bold' }}>{meldung}</p>}
        
      </div>
    </div>
  );
}