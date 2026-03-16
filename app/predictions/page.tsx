"use client";
import { useState } from 'react';

export default function Predictions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLiveData = async () => {
    setLoading(true);
    setMessage('🔄 Quant-Modell analysiert Spiele (API-Football + Sportradar)...');
    
    try {
      const response = await fetch('/api/fetch-matches', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setMessage('✅ ' + data.message);
      } else {
        setMessage('❌ Fehler: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Server-Timeout oder Verbindungsfehler.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', margin: '0 0 8px 0' }}>Algorithmus & Sync</h1>
        <p style={{ color: '#A1A1A6', margin: 0, fontSize: '15px' }}>Starte den manuellen Daten-Abgleich für die nächsten 3 Tage.</p>
      </header>

      <div style={{ backgroundColor: '#151516', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px', maxWidth: '600px' }}>
        <button 
          onClick={fetchLiveData}
          disabled={loading}
          style={{ 
            backgroundColor: loading ? '#333' : '#32D74B', color: loading ? '#A1A1A6' : '#000', 
            padding: '16px 32px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', 
            cursor: loading ? 'wait' : 'pointer', width: '100%', transition: 'all 0.2s'
          }}
        >
          {loading ? 'Berechne Wahrscheinlichkeiten...' : '⬇️ System-Sync jetzt starten'}
        </button>

        {message && (
          <div style={{ 
            marginTop: '24px', padding: '16px', borderRadius: '12px',
            backgroundColor: message.includes('✅') ? 'rgba(50, 215, 75, 0.1)' : 'rgba(255, 69, 58, 0.1)', 
            border: message.includes('✅') ? '1px solid rgba(50, 215, 75, 0.2)' : '1px solid rgba(255, 69, 58, 0.2)',
            color: message.includes('✅') ? '#32D74B' : '#FF453A', fontSize: '14px', fontWeight: '500'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}