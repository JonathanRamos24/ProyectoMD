import React, { useEffect, useRef } from 'react';
import { Graph3DVisualizer } from './Grafo3D/Graph3DVisualizer';
import GraphPanel from './Grafo3D/GraphPanel';
import SudokuPanel from './ComponentesSudoku/SudokuPanel';
import { useGameLogic } from './SusokuData/useGameLogic';

const SudokuInteractivo = () => {
  const canvasRef = useRef(null);
  const graphVisualizerRef = useRef(null);
  
  // Estados adicionales para el grafo
  const [animationStatus, setAnimationStatus] = React.useState('Grafo se actualiza automáticamente al jugar');
  const [verticesCount, setVerticesCount] = React.useState(0);
  const [edgesCount, setEdgesCount] = React.useState(0);
  const [animationSpeed, setAnimationSpeed] = React.useState(300);
  const [lastMove, setLastMove] = React.useState('-');

  // Hook personalizado para la lógica del juego
  const {
    board,
    solution,
    givenCells,
    selectedCell,
    errorCount,
    completion,
    gameTime,
    difficulty,
    gameTimerRef,
    setDifficulty,
    initializeGame,
    selectCell,
    moveSelection,
    placeNumber,
    clearCell,
    autoFill,
    updateCompletion
  } = useGameLogic(graphVisualizerRef, setAnimationStatus, setLastMove);

  // Initialize Three.js
  useEffect(() => {
    if (canvasRef.current && !graphVisualizerRef.current) {
      const updateStatsCallback = (vertices, edges) => {
        setVerticesCount(vertices);
        setEdgesCount(edges);
      };

      graphVisualizerRef.current = new Graph3DVisualizer(canvasRef.current, updateStatsCallback);
      graphVisualizerRef.current.updateStats = updateStatsCallback;
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameTimerRef]);

  // Initialize game on mount and difficulty change
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Update completion percentage
  useEffect(() => {
    updateCompletion();
  }, [board, updateCompletion]);

  const resetGraph = () => {
    if (graphVisualizerRef.current) {
      graphVisualizerRef.current.clearGraph();
      setTimeout(() => {
        graphVisualizerRef.current.currentBoard = JSON.parse(JSON.stringify(board));
        graphVisualizerRef.current.initializeGraph(board);
      }, 100);
    }
  };

  const toggleAutoRotation = () => {
    if (graphVisualizerRef.current) {
      graphVisualizerRef.current.toggleAutoRotation();
      setAnimationStatus(
        graphVisualizerRef.current.autoRotate ? 
        'Auto-rotación activada' : 
        'Auto-rotación desactivada'
      );
    }
  };

  const handleAnimationSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    setAnimationSpeed(speed);
    if (graphVisualizerRef.current) {
      graphVisualizerRef.current.animationSpeed = speed;
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      
      // Prevenir el comportamiento por defecto de las teclas de navegación
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
        event.preventDefault();
      }
      
      // Números del 1 al 9
      if (key >= '1' && key <= '9') {
        const number = parseInt(key);
        placeNumber(number);
      } 
      // Borrar celda
      else if (key === 'Delete' || key === 'Backspace' || key === '0') {
        clearCell();
      }
      // Navegación con flechas
      else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        moveSelection('up');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        moveSelection('down');
      } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        moveSelection('left');
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        moveSelection('right');
      }
      // Funciones especiales
      else if (key === 'n' || key === 'N') {
        initializeGame(); // Nuevo juego
      } else if (key === 'h' || key === 'H') {
        autoFill(); // Ayuda/Auto-fill
      } else if (key === 'r' || key === 'R') {
        resetGraph(); // Reset grafo
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, givenCells, solution, initializeGame, autoFill, placeNumber, clearCell, moveSelection]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (graphVisualizerRef.current) {
        graphVisualizerRef.current.onWindowResize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        width: '100%',
        height: '100%'
      }}>
        {/* Panel Izquierdo - Grafo 3D */}
        <GraphPanel 
          canvasRef={canvasRef}
          animationStatus={animationStatus}
          resetGraph={resetGraph}
          toggleAutoRotation={toggleAutoRotation}
          animationSpeed={animationSpeed}
          handleAnimationSpeedChange={handleAnimationSpeedChange}
          verticesCount={verticesCount}
          edgesCount={edgesCount}
          lastMove={lastMove}
        />

        {/* Panel Derecho - Sudoku */}
        <SudokuPanel 
          board={board}
          solution={solution}
          givenCells={givenCells}
          selectedCell={selectedCell}
          selectCell={selectCell}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          initializeGame={initializeGame}
          clearCell={clearCell}
          autoFill={autoFill}
          completion={completion}
          errorCount={errorCount}
          gameTime={gameTime}
        />
      </div>
    </div>
  );
};

export default SudokuInteractivo;