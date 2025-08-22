import { useState, useCallback, useRef } from 'react';
import { puzzles } from './SudokuData1';

export const useGameLogic = (graphVisualizerRef, setAnimationStatus, setLastMove) => {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [givenCells, setGivenCells] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [gameTime, setGameTime] = useState('00:00');
  const [difficulty, setDifficulty] = useState('novato');

  const gameStartTimeRef = useRef(null);
  const gameTimerRef = useRef(null);

  const initializeGame = useCallback(() => {
    const puzzle = puzzles[difficulty];
    const newBoard = JSON.parse(JSON.stringify(puzzle.initial));
    const newSolution = JSON.parse(JSON.stringify(puzzle.solution));
    const newGivenCells = new Set();
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col] !== 0) {
          newGivenCells.add(`${row}-${col}`);
        }
      }
    }
    
    setBoard(newBoard);
    setSolution(newSolution);
    setGivenCells(newGivenCells);
    setErrorCount(0);
    setSelectedCell({ row: 0, col: 0 });
    
    // Start timer
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameStartTimeRef.current = Date.now();
    
    gameTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setGameTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    // Initialize graph
    setTimeout(() => {
      if (graphVisualizerRef.current) {
        graphVisualizerRef.current.currentBoard = JSON.parse(JSON.stringify(newBoard));
        graphVisualizerRef.current.initializeGraph(newBoard);
      }
    }, 100);
  }, [difficulty, graphVisualizerRef]);

  const selectCell = (row, col) => {
    if (givenCells.has(`${row}-${col}`)) return;
    setSelectedCell({ row, col });
  };

  const moveSelection = (direction) => {
    if (!selectedCell) {
      setSelectedCell({ row: 0, col: 0 });
      return;
    }

    let { row, col } = selectedCell;
    
    switch (direction) {
      case 'up':
        row = Math.max(0, row - 1);
        break;
      case 'down':
        row = Math.min(8, row + 1);
        break;
      case 'left':
        col = Math.max(0, col - 1);
        break;
      case 'right':
        col = Math.min(8, col + 1);
        break;
    }
    
    setSelectedCell({ row, col });
  };

  const placeNumber = (number) => {
    if (!selectedCell || !number) return;
    
    const { row, col } = selectedCell;
    if (givenCells.has(`${row}-${col}`)) return;

    const oldValue = board[row][col];
    const newBoard = [...board];
    newBoard[row][col] = number;

    const isCorrect = number === solution[row][col];
    
    if (!isCorrect) {
      setErrorCount(prev => prev + 1);
    }

    setBoard(newBoard);

    // Update graph
    if (graphVisualizerRef.current) {
      graphVisualizerRef.current.animateGraphUpdate(row, col, oldValue, number);
      setLastMove(`(${row+1},${col+1})=${number}`);
    }

    // Check win
    const isComplete = newBoard.every((row, rowIndex) =>
      row.every((cell, colIndex) => cell === solution[rowIndex][colIndex])
    );

    if (isComplete) {
      setTimeout(() => {
        alert('¡Felicidades! Has completado el Sudoku!');
      }, 300);
    }
  };

  const clearCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    if (givenCells.has(`${row}-${col}`)) return;

    const oldValue = board[row][col];
    const newBoard = [...board];
    newBoard[row][col] = 0;

    setBoard(newBoard);

    // Update graph
    if (graphVisualizerRef.current) {
      graphVisualizerRef.current.animateGraphUpdate(row, col, oldValue, 0);
      setLastMove('Borrar');
    }
  };

  const autoFill = () => {
    // Buscar celdas vacías
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      // Elegir una celda vacía aleatoria
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const correctValue = solution[randomCell.row][randomCell.col];
      
      // Actualizar el tablero
      const newBoard = [...board];
      newBoard[randomCell.row][randomCell.col] = correctValue;
      setBoard(newBoard);

      // Seleccionar la celda
      setSelectedCell(randomCell);

      // Actualizar el grafo
      if (graphVisualizerRef.current) {
        graphVisualizerRef.current.animateGraphUpdate(
          randomCell.row, 
          randomCell.col, 
          0, 
          correctValue
        );
        setLastMove(`Auto (${randomCell.row+1},${randomCell.col+1})=${correctValue}`);
      }
    }
  };

  // Update completion percentage
  const updateCompletion = () => {
    const filledCells = board.flat().filter(cell => cell !== 0).length;
    const newCompletion = Math.round((filledCells / 81) * 100);
    setCompletion(newCompletion);
  };

  return {
    board,
    solution,
    givenCells,
    selectedCell,
    errorCount,
    completion,
    gameTime,
    difficulty,
    gameTimerRef,
    setBoard,
    setSolution,
    setGivenCells,
    setSelectedCell,
    setErrorCount,
    setCompletion,
    setGameTime,
    setDifficulty,
    initializeGame,
    selectCell,
    moveSelection,
    placeNumber,
    clearCell,
    autoFill,
    updateCompletion
  };
};