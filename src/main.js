import { gameState } from './game/state.js';
import { audioManager } from './game/audio.js';
import { render } from './game/renderer.js';
import { InputManager } from './game/input.js';
import { kellanAI } from './game/kellan.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.inputManager = new InputManager(this.canvas);
    this.boundGameLoop = this.gameLoop.bind(this);
    this.boundResizeCanvas = this.resizeCanvas.bind(this);
    this.lastTimeUpdate = Date.now();
  }

  init() {
    this.resizeCanvas();
    this.inputManager.init();
    window.addEventListener('resize', this.boundResizeCanvas);
    
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    this.gameLoop();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth - 40;
    this.canvas.height = window.innerHeight - 40;
    gameState.playerPosition.x = this.canvas.width / 2;
    gameState.playerPosition.y = this.canvas.height / 2;
  }

  updateTime() {
    const now = Date.now();
    if (now - this.lastTimeUpdate >= 1000) { // Update every second
      gameState.time = (gameState.time + 1) % 360; // 6 hours cycle (12 AM to 6 AM)
      this.lastTimeUpdate = now;
    }
  }

  gameLoop() {
    this.updateTime();
    kellanAI.update();
    render(this.ctx, this.canvas);
    requestAnimationFrame(this.boundGameLoop);
  }

  cleanup() {
    this.inputManager.cleanup();
    window.removeEventListener('resize', this.boundResizeCanvas);
    audioManager.stopAll();
  }
}

// Start the game
const game = new Game();
game.init();