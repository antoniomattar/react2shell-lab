"use client";

import { useState } from 'react';

export default function FlagForm() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const correctFlag = "ENSIMAG{R34CT_S3RV3R_C0MP0N3NTS_RCE}";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === correctFlag) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Entrez le flag ici"
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#1a1a2e',
            color: '#fff'
          }}
        />
        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#e94560',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Valider
        </button>
      </form>

      {status === 'success' && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          border: '1px solid #00ff00',
          borderRadius: '4px',
          color: '#00ff00',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ✅ Bravo ! Vous avez trouvé le bon flag !
        </div>
      )}

      {status === 'error' && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          border: '1px solid #ff0000',
          borderRadius: '4px',
          color: '#ff0000',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ❌ Flag incorrect. Continuez à chercher !
        </div>
      )}
    </div>
  );
}
