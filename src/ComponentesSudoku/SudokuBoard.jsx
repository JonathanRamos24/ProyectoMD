import React from 'react';

const SudokuBoard = ({ 
  board, 
  solution, 
  givenCells, 
  selectedCell, 
  selectCell 
}) => {
  const getCellStyle = (row, col) => {
    let background = '#1a1a2e';
    let color = 'white';
    
    const isGiven = givenCells.has(`${row}-${col}`);
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
    const hasWrongValue = board[row][col] !== 0 && board[row][col] !== solution[row][col];
    const hasCorrectValue = board[row][col] !== 0 && board[row][col] === solution[row][col] && !isGiven;
    
    if (isSelected) {
      background = '#00d4ff';
      color = '#000';
    } else if (isGiven) {
      background = '#333';
      color = '#00d4ff';
    } else if (hasWrongValue) {
      background = '#ff4444';
      color = 'white';
    } else if (hasCorrectValue) {
      background = '#79f4a4ff';
      color = '#000';
    } else if (selectedCell) {
      const { row: selRow, col: selCol } = selectedCell;
      const currentValue = board[selRow][selCol];
      
      if (row !== selRow || col !== selCol) {
        if (currentValue && board[row][col] === currentValue) {
          background = 'rgba(255, 107, 157, 0.4)';
        } else if (row === selRow) {
          background = 'rgba(0, 212, 255, 0.3)';
        } else if (col === selCol) {
          background = 'rgba(123, 104, 238, 0.3)';
        } else if (Math.floor(row / 3) === Math.floor(selRow / 3) && 
                Math.floor(col / 3) === Math.floor(selCol / 3)) {
          background = 'rgba(0, 255, 136, 0.3)';
        }
      }
    }
    
    return {
      background,
      border: '1px solid #666',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color,
      cursor: isGiven ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: '4px',
      userSelect: 'none',
      // Separadores de cajas 3x3
      borderRight: (col + 1) % 3 === 0 && col !== 8 ? '3px solid #00d4ff' : '1px solid #666',
      borderBottom: (row + 1) % 3 === 0 && row !== 8 ? '3px solid #00d4ff' : '1px solid #666'
    };
  };

  const handleCellClick = (row, col) => {
    if (givenCells.has(`${row}-${col}`)) return;
    selectCell(row, col);
  };

  const handleCellMouseEnter = (e, row, col) => {
    if (!givenCells.has(`${row}-${col}`)) {
      e.target.style.transform = 'scale(1.05)';
      e.target.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.5)';
    }
  };

  const handleCellMouseLeave = (e, row, col) => {
    if (!givenCells.has(`${row}-${col}`)) {
      e.target.style.transform = 'scale(1)';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(9, 1fr)',
      gridTemplateRows: 'repeat(9, 1fr)',
      gap: '2px',
      background: '#444',
      padding: '15px',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '400px',
      aspectRatio: '1',
      margin: '0 auto 20px auto',
      border: '2px solid rgba(255, 255, 255, 0.2)'
    }}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            style={getCellStyle(rowIndex, colIndex)}
            onMouseEnter={(e) => handleCellMouseEnter(e, rowIndex, colIndex)}
            onMouseLeave={(e) => handleCellMouseLeave(e, rowIndex, colIndex)}
          >
            {cell || ''}
          </div>
        ))
      )}
    </div>
  );
};

export default SudokuBoard;