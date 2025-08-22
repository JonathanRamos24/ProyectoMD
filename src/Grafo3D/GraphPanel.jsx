import React from 'react';

const GraphPanel = ({
  canvasRef,
  animationStatus,
  resetGraph,
  toggleAutoRotation,
  animationSpeed,
  handleAnimationSpeedChange,
  verticesCount,
  edgesCount,
  lastMove
}) => {
  const buttonStyle = {
    padding: '8px 12px',
    border: '2px solid #00d4ff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    backdropFilter: 'blur(10px)'
  };

  const handleMouseEnter = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
    e.target.style.transform = 'translateY(-1px)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
    e.target.style.transform = 'none';
  };

  return (
    <div style={{
      flex: '0 0 65%',
      height: '100%',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '2px solid rgba(255, 255, 255, 0.1)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '15px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '1.5em',
          background: 'linear-gradient(45deg, #00d4ff, #7b68ee, #ff6b9d)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Grafo 3D en Tiempo Real
        </h1>

        <div style={{
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '8px',
          borderRadius: '8px',
          marginBottom: '10px',
          fontSize: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {animationStatus}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}>
          <button
            onClick={resetGraph}
            style={buttonStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            🔄 Reset Grafo
          </button>

          <button
            onClick={toggleAutoRotation}
            style={{
              ...buttonStyle,
              borderColor: '#7b68ee'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            🌀 Auto Rotar
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '3px 8px',
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <label>Animación:</label>
            <input
              type="range"
              min="100"
              max="1000"
              value={animationSpeed}
              onChange={handleAnimationSpeedChange}
              style={{
                width: '60px',
                accentColor: '#00d4ff'
              }}
            />
            <span>{animationSpeed}ms</span>
          </div>
        </div>

        <div style={{
          position: 'relative',
          width: '100%',
          flex: '1',
          minHeight: '400px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '15px'
        }}>
          <div
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />

          <div style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            right: '5px',
            zIndex: 100,
            textAlign: 'center',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(0, 212, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <span>Vértices: </span>
                <span>{verticesCount}</span>
              </div>
              <div style={{
                background: 'rgba(0, 212, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <span>Aristas: </span>
                <span>{edgesCount}</span>
              </div>
              <div style={{
                background: 'rgba(0, 212, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <span>Último: </span>
                <span>{lastMove}</span>
              </div>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '6px',
            padding: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#00d4ff', fontWeight: '600', marginBottom: '4px' }}>
              Proyecto De Matemáticas Discretas
            </div>
            <div style={{ color: '#ffffff', fontSize: '13px' }}>
              Profesor: Cristhian Hernández
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '6px',
            padding: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '14px'
          }}>

            <h4 style={{ color: '#00d4ff', marginBottom: '8px' }}>Conexiones</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b9d' }}></div>
              <span>Mismo número</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff' }}></div>
              <span>Misma fila</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7b68ee' }}></div>
              <span>Misma columna</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' }}></div>
              <span>Misma caja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphPanel;