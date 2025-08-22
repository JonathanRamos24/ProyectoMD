import * as THREE from 'three';

export class Graph3DVisualizer {
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
    } else if (newValue !== 0) {
      vertex.value = newValue;
      
      if (oldValue === 0) {
        await this.createVertex(index);
        await this.delay(this.animationSpeed / 4);
        await this.createEdgesForVertex(index);
        // También crear aristas desde otros vértices hacia este nuevo vértice
        await this.createEdgesToVertex(index);
      } else {
        await this.updateVertex(index);
        await this.updateEdgesForVertex(index);
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