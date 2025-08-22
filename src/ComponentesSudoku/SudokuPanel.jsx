import React from 'react';
import SudokuBoard from './SudokuBoard';
import SudokuControls from './SudokuControls';
import GameStats from './GameStats';

const SudokuPanel = ({ 
  board,
  solution,
  givenCells,
  selectedCell,
  selectCell,
  difficulty,
  setDifficulty,
  initializeGame,
  clearCell,
  autoFill,
  completion,
  errorCount,
  gameTime
}) => {
  return (
    <div style={{ 
      flex: '0 0 35%',
      height: '100%',
      padding: '15px', 
      display: 'flex', 
      flexDirection: 'column',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '1.4em',
          background: 'linear-gradient(45deg, #00d4ff, #7b68ee, #ff6b9d)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🧩 Sudoku Interactivo
        </h1>
        
        <SudokuControls 
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          initializeGame={initializeGame}
          clearCell={clearCell}
          autoFill={autoFill}
        />
        
        <SudokuBoard 
          board={board}
          solution={solution}
          givenCells={givenCells}
          selectedCell={selectedCell}
          selectCell={selectCell}
        />

        <GameStats 
          completion={completion}
          errorCount={errorCount}
          gameTime={gameTime}
        />
      </div>
    </div>
  );
};

export default SudokuPanel;