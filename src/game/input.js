import { gameState } from './state.js';
import { audioManager } from './audio.js';
import { kellanAI } from './kellan.js';

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundInitializeAudio = this.initializeAudio.bind(this);
  }

  init() {
    document.addEventListener('keydown', this.boundHandleKeyDown);
    document.addEventListener('mousemove', this.boundHandleMouseMove);
    document.addEventListener('click', this.boundInitializeAudio, { once: true });
  }

  cleanup() {
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    document.removeEventListener('mousemove', this.boundHandleMouseMove);
    document.removeEventListener('click', this.boundInitializeAudio);
  }

  initializeAudio() {
    audioManager.init();
    audioManager.play('bgMusic');
    audioManager.play('heartbeat');
  }

  handleKeyDown(e) {
    if (gameState.isGameOver) {
      if (e.key.toLowerCase() === 'r') {
        this.restartGame();
      }
      return;
    }
    
    const speed = 5;
    let moved = false;
    
    switch(e.key) {
      case 'ArrowUp':
      case 'w':
        gameState.playerPosition.y = Math.max(25, gameState.playerPosition.y - speed);
        moved = true;
        break;
      case 'ArrowDown':
      case 's':
        gameState.playerPosition.y = Math.min(this.canvas.height - 25, gameState.playerPosition.y + speed);
        moved = true;
        break;
      case 'ArrowLeft':
      case 'a':
        gameState.playerPosition.x = Math.max(25, gameState.playerPosition.x - speed);
        moved = true;
        break;
      case 'ArrowRight':
      case 'd':
        gameState.playerPosition.x = Math.min(this.canvas.width - 25, gameState.playerPosition.x + speed);
        moved = true;
        break;
      case ' ':
        gameState.lights = !gameState.lights;
        break;
    }
    
    if (moved) {
      audioManager.play('footsteps');
    }
  }

  restartGame() {
    gameState.isGameOver = false;
    gameState.power = 100;
    gameState.time = 0;
    gameState.currentRoom = 'bedroom';
    gameState.kellanPosition = 'kitchen';
    gameState.lights = true;
    gameState.playerPosition = { 
      x: this.canvas.width / 2, 
      y: this.canvas.height / 2 
    };
    gameState.flashlightAngle = 0;
    gameState.shake = 0;
    gameState.vignette = 0;
    
    // Reset Kellan's position
    kellanAI.position = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height
    };
  }

  handleMouseMove(e) {
    if (gameState.isGameOver || gameState.lights) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    gameState.flashlightAngle = Math.atan2(
      y - gameState.playerPosition.y,
      x - gameState.playerPosition.x
    );
  }
}