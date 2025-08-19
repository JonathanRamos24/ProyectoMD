import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

const SudokuInteractivo = () => {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [givenCells, setGivenCells] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [gameTime, setGameTime] = useState('00:00');
  const [difficulty, setDifficulty] = useState('novato');
  const [lastMove, setLastMove] = useState('-');
  const [animationStatus, setAnimationStatus] = useState('Grafo se actualiza automáticamente al jugar');
  const [verticesCount, setVerticesCount] = useState(0);
  const [edgesCount, setEdgesCount] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(300);

  const canvasRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const gameTimerRef = useRef(null);
  const graphVisualizerRef = useRef(null);

  // Solo dos dificultades: Novato y Experto
  const puzzles = {
    novato: {
      initial: [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ],
      solution: [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ]
    },
    experto: {
      initial: [
        [0,3,0,0,7,0,0,0,0],
        [6,0,0,1,0,5,0,0,0],
        [0,0,8,0,0,0,0,6,0],
        [8,0,0,0,0,0,0,0,3],
        [0,0,0,8,0,0,0,0,1],
        [7,0,0,0,2,0,0,0,0],
        [0,6,0,0,0,0,0,8,0],
        [0,0,0,4,0,0,0,0,5],
        [0,0,0,0,8,0,0,7,0]
      ],
      solution: [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ]
    }
  };

  // Graph3DVisualizer class adaptada para React
  class Graph3DVisualizer {
    constructor(container, updateStats) {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.vertices = [];
      this.vertexMeshes = [];
      this.edgeMeshes = [];
      this.numberSprites = [];
      this.currentBoard = [];
      this.isAnimating = false;
      this.animationSpeed = 300;
      this.autoRotate = true;
      this.updateStats = updateStats;
      
      // Colores para números 1-9
      this.numberColors = [
        0xff3333, 0x33ff33, 0x3333ff, 0xffff33, 0xff33ff,
        0x33ffff, 0xff9933, 0x9933ff, 0x33ff99
      ];
      
      this.initThreeJS(container);
      this.setupCameraControls();
      this.startRenderLoop();
    }

    initThreeJS(container) {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0a0a0a);
      
      this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 2000);
      this.camera.position.set(0, 0, 120);
      
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(this.renderer.domElement);
      
      // Iluminación
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      this.scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(50, 50, 50);
      this.scene.add(directionalLight);
    }

    setupCameraControls() {
      let mouseX = 0, mouseY = 0;
      let targetX = 0, targetY = 0;
      let distance = 120;
      let mouseDown = false;

      this.renderer.domElement.addEventListener('mousedown', (event) => {
        mouseDown = true;
        this.autoRotate = false;
      });

      this.renderer.domElement.addEventListener('mouseup', () => {
        mouseDown = false;
      });

      this.renderer.domElement.addEventListener('mousemove', (event) => {
        if (mouseDown) {
          const rect = this.renderer.domElement.getBoundingClientRect();
          mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }
      });

      this.renderer.domElement.addEventListener('mouseleave', () => {
        mouseDown = false;
      });

      this.renderer.domElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        distance += event.deltaY * 0.1;
        distance = Math.max(60, Math.min(200, distance));
      });

      this.cameraControls = () => {
        if (this.autoRotate && !mouseDown) {
          targetX += 0.005;
        } else if (mouseDown) {
          targetX += (mouseX * 3 - targetX) * 0.05;
          targetY += (mouseY * 1.5 - targetY) * 0.05;
        }
        
        this.camera.position.x = Math.sin(targetX) * distance;
        this.camera.position.z = Math.cos(targetX) * distance;
        this.camera.position.y = targetY * 40;
        this.camera.lookAt(0, 0, 0);
      };
    }

    calculateVertexPositions(board) {
      this.vertices = [];
      const spacing = 10;
      const offsetX = -40;
      const offsetY = -40;

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const boxRow = Math.floor(row / 3);
          const boxCol = Math.floor(col / 3);
          
          const x = col * spacing + offsetX;
          const y = row * spacing + offsetY;
          const z = (boxRow * 3 + boxCol) * 5 - 20;
          
          this.vertices.push({
            position: new THREE.Vector3(x, y, z),
            row: row,
            col: col,
            value: board[row][col],
            mesh: null,
            numberSprite: null,
            created: false
          });
        }
      }
    }

    async animateGraphUpdate(row, col, oldValue, newValue) {
      const index = row * 9 + col;
      const vertex = this.vertices[index];
      
      if (!vertex) return;

      // Actualizar el tablero actual primero
      this.currentBoard[row][col] = newValue;

      if (newValue === 0 && oldValue !== 0) {
        await this.removeVertex(index);
        setAnimationStatus(`Removido vértice (${row+1},${col+1})`);
      } else if (newValue !== 0) {
        vertex.value = newValue;
        
        if (oldValue === 0) {
          await this.createVertex(index);
          await this.delay(this.animationSpeed / 4);
          await this.createEdgesForVertex(index);
          // También crear aristas desde otros vértices hacia este nuevo vértice
          await this.createEdgesToVertex(index);
          setAnimationStatus(`Creado vértice (${row+1},${col+1}) = ${newValue}`);
        } else {
          await this.updateVertex(index);
          await this.updateEdgesForVertex(index);
          setAnimationStatus(`Actualizado vértice (${row+1},${col+1}) = ${newValue}`);
        }
      }

      this.updateStatsCallback();
    }

    async createVertex(index) {
      const vertex = this.vertices[index];
      
      const geometry = new THREE.SphereGeometry(2, 20, 16);
      const material = new THREE.MeshPhongMaterial({
        color: this.numberColors[vertex.value - 1],
        transparent: true,
        opacity: 0.9,
        emissive: this.numberColors[vertex.value - 1],
        emissiveIntensity: 0.1
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(vertex.position);
      mesh.scale.set(0, 0, 0);
      this.scene.add(mesh);

      const animateScale = () => {
        return new Promise(resolve => {
          let scale = 0;
          const animate = () => {
            scale += 0.15;
            if (scale >= 1.2) {
              mesh.scale.set(1, 1, 1);
              resolve();
              return;
            }
            mesh.scale.set(scale, scale, scale);
            requestAnimationFrame(animate);
          };
          animate();
        });
      };

      await animateScale();

      vertex.mesh = mesh;
      vertex.created = true;
      this.vertexMeshes.push(mesh);

      this.addVertexNumber(vertex);
    }

    async removeVertex(index) {
      const vertex = this.vertices[index];
      if (!vertex.created) return;

      await this.removeEdgesForVertex(index);

      if (vertex.mesh) {
        const animateRemoval = () => {
          return new Promise(resolve => {
            let scale = 1;
            const animate = () => {
              scale -= 0.1;
              if (scale <= 0) {
                this.scene.remove(vertex.mesh);
                this.vertexMeshes = this.vertexMeshes.filter(m => m !== vertex.mesh);
                vertex.mesh = null;
                resolve();
                return;
              }
              vertex.mesh.scale.set(scale, scale, scale);
              requestAnimationFrame(animate);
            };
            animate();
          });
        };

        await animateRemoval();
      }

      if (vertex.numberSprite) {
        this.scene.remove(vertex.numberSprite);
        this.numberSprites = this.numberSprites.filter(s => s !== vertex.numberSprite);
        vertex.numberSprite = null;
      }

      vertex.created = false;
      vertex.value = 0;
    }

    async updateVertex(index) {
      const vertex = this.vertices[index];
      if (!vertex.created || !vertex.mesh) return;

      const newColor = this.numberColors[vertex.value - 1];
      vertex.mesh.material.color.setHex(newColor);
      vertex.mesh.material.emissive.setHex(newColor);

      if (vertex.numberSprite) {
        this.scene.remove(vertex.numberSprite);
        this.numberSprites = this.numberSprites.filter(s => s !== vertex.numberSprite);
      }
      this.addVertexNumber(vertex);

      const originalScale = vertex.mesh.scale.x;
      vertex.mesh.scale.set(1.3, 1.3, 1.3);
      
      const animatePulse = () => {
        return new Promise(resolve => {
          let scale = 1.3;
          const animate = () => {
            scale -= 0.02;
            if (scale <= originalScale) {
              vertex.mesh.scale.set(originalScale, originalScale, originalScale);
              resolve();
              return;
            }
            vertex.mesh.scale.set(scale, scale, scale);
            requestAnimationFrame(animate);
          };
          animate();
        });
      };

      await animatePulse();
    }

    addVertexNumber(vertex) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 128;

      const gradient = context.createRadialGradient(64, 64, 20, 64, 64, 60);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(64, 64, 60, 0, 2 * Math.PI);
      context.fill();

      context.strokeStyle = '#ffffff';
      context.lineWidth = 3;
      context.shadowColor = '#00d4ff';
      context.shadowBlur = 10;
      context.stroke();

      context.shadowColor = 'transparent';
      context.fillStyle = '#ffffff';
      context.font = 'Bold 50px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(vertex.value.toString(), 64, 64);

      context.font = '12px Arial';
      context.fillStyle = '#aaaaaa';
      context.fillText(`(${vertex.row+1},${vertex.col+1})`, 64, 95);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      
      sprite.position.copy(vertex.position);
      sprite.scale.set(6, 6, 1);
      
      this.scene.add(sprite);
      vertex.numberSprite = sprite;
      this.numberSprites.push(sprite);
    }

    async createEdgesForVertex(index) {
      const vertex = this.vertices[index];
      if (!vertex.created) return;

      const connections = this.getConnections(vertex.row, vertex.col);
      
      for (const targetIndex of connections) {
        const targetVertex = this.vertices[targetIndex];
        if (targetVertex.created) {
          // Evitar duplicar aristas
          const edgeExists = this.edgeMeshes.some(edge => 
            (edge.userData.from === index && edge.userData.to === targetIndex) ||
            (edge.userData.from === targetIndex && edge.userData.to === index)
          );
          
          if (!edgeExists) {
            await this.createEdge(index, targetIndex);
            await this.delay(30);
          }
        }
      }
    }

    async createEdgesToVertex(index) {
      const vertex = this.vertices[index];
      if (!vertex.created) return;

      // Buscar todos los vértices existentes que deberían conectarse a este nuevo vértice
      for (let i = 0; i < this.vertices.length; i++) {
        if (i === index || !this.vertices[i].created) continue;
        
        const otherVertex = this.vertices[i];
        const shouldConnect = this.shouldVerticesConnect(vertex.row, vertex.col, otherVertex.row, otherVertex.col);
        
        if (shouldConnect) {
          // Verificar si la arista ya existe
          const edgeExists = this.edgeMeshes.some(edge => 
            (edge.userData.from === index && edge.userData.to === i) ||
            (edge.userData.from === i && edge.userData.to === index)
          );
          
          if (!edgeExists) {
            await this.createEdge(i, index);
            await this.delay(30);
          }
        }
      }
    }

    shouldVerticesConnect(row1, col1, row2, col2) {
      // Misma fila
      if (row1 === row2) return true;
      
      // Misma columna  
      if (col1 === col2) return true;
      
      // Misma caja 3x3
      const box1Row = Math.floor(row1 / 3);
      const box1Col = Math.floor(col1 / 3);
      const box2Row = Math.floor(row2 / 3);
      const box2Col = Math.floor(col2 / 3);
      
      if (box1Row === box2Row && box1Col === box2Col) return true;
      
      return false;
    }

    async removeEdgesForVertex(index) {
      const edgesToRemove = [];
      
      this.edgeMeshes.forEach((edge, edgeIndex) => {
        if (edge.userData && (edge.userData.from === index || edge.userData.to === index)) {
          edgesToRemove.push(edge);
        }
      });

      for (const edge of edgesToRemove) {
        this.scene.remove(edge);
        this.edgeMeshes = this.edgeMeshes.filter(e => e !== edge);
      }
    }

    async updateEdgesForVertex(index) {
      await this.removeEdgesForVertex(index);
      await this.createEdgesForVertex(index);
    }

    async createEdge(fromIndex, toIndex) {
      const fromVertex = this.vertices[fromIndex];
      const toVertex = this.vertices[toIndex];

      if (!fromVertex.created || !toVertex.created) return;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        fromVertex.position.x, fromVertex.position.y, fromVertex.position.z,
        toVertex.position.x, toVertex.position.y, toVertex.position.z
      ]);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      let color = 0xffffff;
      let opacity = 0.3;
      
      if (fromVertex.value === toVertex.value) {
        color = 0xff6b9d;
        opacity = 0.8;
      } else if (fromVertex.row === toVertex.row) {
        color = 0x00d4ff;
        opacity = 0.5;
      } else if (fromVertex.col === toVertex.col) {
        color = 0x7b68ee;
        opacity = 0.5;
      } else {
        color = 0x00ff88;
        opacity = 0.4;
      }

      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0
      });

      const line = new THREE.Line(geometry, material);
      line.userData = { from: fromIndex, to: toIndex };
      this.scene.add(line);
      this.edgeMeshes.push(line);

      const animateOpacity = () => {
        return new Promise(resolve => {
          let currentOpacity = 0;
          const animate = () => {
            currentOpacity += 0.05;
            if (currentOpacity >= opacity) {
              material.opacity = opacity;
              resolve();
              return;
            }
            material.opacity = currentOpacity;
            requestAnimationFrame(animate);
          };
          animate();
        });
      };

      await animateOpacity();
    }

    getConnections(row, col) {
      const connections = [];
      const currentValue = this.currentBoard[row][col];

      if (currentValue === 0) return connections;

      // Conexiones en fila
      for (let c = 0; c < 9; c++) {
        if (c !== col && this.currentBoard[row][c] !== 0) {
          connections.push(row * 9 + c);
        }
      }

      // Conexiones en columna
      for (let r = 0; r < 9; r++) {
        if (r !== row && this.currentBoard[r][col] !== 0) {
          connections.push(r * 9 + col);
        }
      }

      // Conexiones en caja 3x3
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const targetIndex = r * 9 + c;
          if (targetIndex !== row * 9 + col && 
              this.currentBoard[r][c] !== 0 && 
              !connections.includes(targetIndex)) {
            connections.push(targetIndex);
          }
        }
      }

      return connections;
    }

    initializeGraph(board) {
      this.currentBoard = JSON.parse(JSON.stringify(board));
      this.calculateVertexPositions(board);
      this.clearGraph();
      
      // Crear todos los vértices primero
      for (let i = 0; i < this.vertices.length; i++) {
        const vertex = this.vertices[i];
        if (vertex.value !== 0) {
          this.createVertex(i);
        }
      }

      // Después crear todas las aristas
      setTimeout(() => {
        for (let i = 0; i < this.vertices.length; i++) {
          const vertex = this.vertices[i];
          if (vertex.created) {
            // Crear aristas con todos los vértices posteriores para evitar duplicados
            for (let j = i + 1; j < this.vertices.length; j++) {
              const otherVertex = this.vertices[j];
              if (otherVertex.created) {
                const shouldConnect = this.shouldVerticesConnect(
                  vertex.row, vertex.col, 
                  otherVertex.row, otherVertex.col
                );
                
                if (shouldConnect) {
                  this.createEdge(i, j);
                }
              }
            }
          }
        }
        this.updateStatsCallback();
      }, 800);
    }

    clearGraph() {
      [...this.vertexMeshes, ...this.edgeMeshes, ...this.numberSprites].forEach(object => {
        this.scene.remove(object);
      });
      
      this.vertexMeshes = [];
      this.edgeMeshes = [];
      this.numberSprites = [];
      
      this.vertices.forEach(vertex => {
        vertex.mesh = null;
        vertex.numberSprite = null;
        vertex.created = false;
      });
    }

    updateStatsCallback() {
      if (this.updateStats && typeof this.updateStats === 'function') {
        this.updateStats(this.vertexMeshes.length, this.edgeMeshes.length);
      }
    }

    toggleAutoRotation() {
      this.autoRotate = !this.autoRotate;
      setAnimationStatus(this.autoRotate ? 'Auto-rotación activada' : 'Auto-rotación desactivada');
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    startRenderLoop() {
      const animate = () => {
        requestAnimationFrame(animate);
        
        if (this.cameraControls) {
          this.cameraControls();
        }
        
        this.vertexMeshes.forEach(mesh => {
          if (mesh) {
            mesh.rotation.y += 0.01;
            mesh.rotation.x += 0.005;
          }
        });
        
        this.numberSprites.forEach(sprite => {
          if (sprite) {
            sprite.lookAt(this.camera.position);
          }
        });
        
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    }

    onWindowResize() {
      if (this.renderer && this.camera) {
        const container = this.renderer.domElement.parentElement;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
      }
    }
  }

  // Initialize game
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
    setSelectedCell({ row: 0, col: 0 }); // Inicializar con una celda seleccionada
    
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
  }, [difficulty]);

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
  }, []);

  // Initialize game on mount and difficulty change
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Update completion percentage
  useEffect(() => {
    const filledCells = board.flat().filter(cell => cell !== 0).length;
    const newCompletion = Math.round((filledCells / 81) * 100);
    setCompletion(newCompletion);
  }, [board]);

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
    }
  };

  const handleAnimationSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    setAnimationSpeed(speed);
    if (graphVisualizerRef.current) {
      graphVisualizerRef.current.animationSpeed = speed;
    }
  };

  // Keyboard event handler mejorado
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
  }, [selectedCell, board, givenCells, solution]);

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

  const getCellClassName = (row, col) => {
    let className = 'sudoku-cell';
    
    if (givenCells.has(`${row}-${col}`)) {
      className += ' given';
    }
    
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      className += ' selected';
    }
    
    // Check if cell has wrong value
    if (board[row][col] !== 0 && board[row][col] !== solution[row][col]) {
      className += ' conflict';
    }

    // Check if cell has correct value
    if (board[row][col] !== 0 && board[row][col] === solution[row][col] && !givenCells.has(`${row}-${col}`)) {
      className += ' correct';
    }

    // Highlight related cells when a cell is selected
    if (selectedCell) {
      const { row: selRow, col: selCol } = selectedCell;
      const currentValue = board[selRow][selCol];
      
      if (row !== selRow || col !== selCol) {
        if (currentValue && board[row][col] === currentValue) {
          className += ' same-number';
        } else if (row === selRow) {
          className += ' same-row';
        } else if (col === selCol) {
          className += ' same-col';
        } else if (Math.floor(row / 3) === Math.floor(selRow / 3) && 
                Math.floor(col / 3) === Math.floor(selCol / 3)) {
          className += ' same-box';
        }
      }
    }
    
    return className;
  };

  const getCellStyle = (row, col) => {
    const className = getCellClassName(row, col);
    
    let background = '#1a1a2e';
    let color = 'white';
    
    if (className.includes('selected')) {
      background = '#00d4ff';
      color = '#000';
    } else if (className.includes('given')) {
      background = '#333';
      color = '#00d4ff';
    } else if (className.includes('conflict')) {
      background = '#ff4444';
      color = 'white';
    } else if (className.includes('correct')) {
      background = '#79f4a4ff';
      color = '#000';
    } else if (className.includes('same-number')) {
      background = 'rgba(255, 107, 157, 0.4)';
    } else if (className.includes('same-row')) {
      background = 'rgba(0, 212, 255, 0.3)';
    } else if (className.includes('same-col')) {
      background = 'rgba(123, 104, 238, 0.3)';
    } else if (className.includes('same-box')) {
      background = 'rgba(0, 255, 136, 0.3)';
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
      cursor: className.includes('given') ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: '4px',
      userSelect: 'none',
      // Separadores de cajas 3x3
      borderRight: (col + 1) % 3 === 0 && col !== 8 ? '3px solid #00d4ff' : '1px solid #666',
      borderBottom: (row + 1) % 3 === 0 && row !== 8 ? '3px solid #00d4ff' : '1px solid #666'
    };
  };

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
        {/* Panel Izquierdo - Grafo 3D (65% del ancho) */}
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
              🌌 Grafo 3D en Tiempo Real
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
                style={{
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
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'none';
                }}
              >
                🔄 Reset Grafo
              </button>
              
              <button 
                onClick={toggleAutoRotation}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #7b68ee',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'none';
                }}
              >
                🌀 Auto Rotar
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
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
                <h2 style={{
                  fontSize: '1em',
                  background: 'linear-gradient(45deg, #00d4ff, #7b68ee, #ff6b9d)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '5px'
                }}>
                </h2>
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

        {/* Panel Derecho - Sudoku (35% del ancho) */}
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
                    onClick={() => selectCell(rowIndex, colIndex)}
                    style={getCellStyle(rowIndex, colIndex)}
                    onMouseEnter={(e) => {
                      if (!givenCells.has(`${rowIndex}-${colIndex}`)) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!givenCells.has(`${rowIndex}-${colIndex}`)) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {cell || ''}
                  </div>
                ))
              )}
            </div>

            <div style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={initializeGame}
                style={{
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
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'none';
                }}
              >
                🎮 Nuevo (N)
              </button>
              
              <button 
                onClick={clearCell}
                style={{
                  padding: '10px 15px',
                  border: '2px solid #7b68ee',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'none';
                }}
              >
                🗑️ Borrar (Del)
              </button>
              
              <button 
                onClick={autoFill}
                style={{
                  padding: '10px 15px',
                  border: '2px solid #00ff88',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'none';
                }}
              >
                ⚡ Auto (H)
              </button>
            </div>

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


          </div>
        </div>
      </div>
    </div>
  );
};

export default SudokuInteractivo;