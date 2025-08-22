import React from 'react';

const SudokuControls = ({ 
  difficulty, 
  setDifficulty, 
  initializeGame, 
  clearCell, 
  autoFill 
}) => {
  const buttonStyle = {
    padding: '10px 15px',
    border: '2px solid #00d4ff',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    backdropFilter: 'blur(10px)'
  };

  const handleMouseEnter = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
    e.target.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
    e.target.style.transform = 'none';
  };

  return (
    <>
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <label style={{ fontSize: '14px', marginRight: '10px' }}>Dificultad:</label>
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <option value="novato" style={{ background: '#1a1a2e', color: 'white' }}>🎯 Novato</option>
          <option value="experto" style={{ background: '#1a1a2e', color: 'white' }}>💀 Experto</option>
        </select>
      </div>

      <div style={{
        marginTop: '5px',
        marginBottom: '15px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={initializeGame}
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          🎮 Nuevo (N)
        </button>
        
        <button 
          onClick={clearCell}
          style={{
            ...buttonStyle,
            borderColor: '#7b68ee'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          🗑️ Borrar (Del)
        </button>
        
        <button 
          onClick={autoFill}
          style={{
            ...buttonStyle,
            borderColor: '#00ff88'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          ⚡ Auto (H)
        </button>
      </div>
    </>
  );
};

export default SudokuControls;