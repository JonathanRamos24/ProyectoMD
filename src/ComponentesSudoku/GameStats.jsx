import React from 'react';

const GameStats = ({ completion, errorCount, gameTime }) => {
  return (
    <div style={{
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      flexWrap: 'wrap'
    }}>
      <div style={{
        background: 'rgba(0, 212, 255, 0.2)',
        padding: '8px 12px',
        borderRadius: '10px',
        fontSize: '14px',
        textAlign: 'center',
        minWidth: '70px',
        border: '1px solid rgba(0, 212, 255, 0.3)'
      }}>
        <div style={{ fontWeight: 'bold' }}>Completado</div>
        <div style={{ fontSize: '16px', color: '#00d4ff' }}>{completion}%</div>
      </div>
      <div style={{
        background: 'rgba(255, 107, 157, 0.2)',
        padding: '8px 12px',
        borderRadius: '10px',
        fontSize: '14px',
        textAlign: 'center',
        minWidth: '70px',
        border: '1px solid rgba(255, 107, 157, 0.3)'
      }}>
        <div style={{ fontWeight: 'bold' }}>Errores</div>
        <div style={{ fontSize: '16px', color: '#ff6b9d' }}>{errorCount}</div>
      </div>
      <div style={{
        background: 'rgba(0, 255, 136, 0.2)',
        padding: '8px 12px',
        borderRadius: '10px',
        fontSize: '14px',
        textAlign: 'center',
        minWidth: '70px',
        border: '1px solid rgba(0, 255, 136, 0.3)'
      }}>
        <div style={{ fontWeight: 'bold' }}>Tiempo</div>
        <div style={{ fontSize: '16px', color: '#00ff88' }}>{gameTime}</div>
      </div>
    </div>
  );
};

export default GameStats;