// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configure canvas size
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 40;

// Draw stick figure function
function drawStickFigure(x, y, color, scale = 1, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  // Head
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.stroke();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(0, 15);
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(-12, 5);
  ctx.lineTo(12, 5);
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(-8, 30);
  ctx.moveTo(0, 15);
  ctx.lineTo(8, 30);
  ctx.stroke();
  
  ctx.restore();
}

// Asset loading system
const assets = {
  images: {},
  sounds: {},
  loaded: 0,
  required: 0
};

// Game state
const gameState = {
  power: 100,
  time: 0,
  isGameOver: false,
  currentRoom: 'bedroom',
  kellanPosition: 'kitchen',
  lights: true,
  playerPosition: { x: canvas.width / 2, y: canvas.height / 2 },
  flashlightAngle: 0,
  ambientNoise: 0,
  shake: 0,
  vignette: 0
};

// Room configurations
const rooms = {
  bedroom: {
    name: 'Bedroom',
    connections: ['hallway'],
    ambient: '#232323',
    furniture: [
      { type: 'bed', x: 0.25, y: 0.25, w: 0.25, h: 0.15 },
      { type: 'dresser', x: 0.7, y: 0.2, w: 0.1, h: 0.2 }
    ]
  },
  hallway: {
    name: 'Hallway',
    connections: ['bedroom', 'kitchen', 'bathroom'],
    ambient: '#1a1a1a',
    furniture: [
      { type: 'plant', x: 0.1, y: 0.3, w: 0.05, h: 0.1 },
      { type: 'painting', x: 0.4, y: 0.1, w: 0.15, h: 0.08 }
    ]
  },
  kitchen: {
    name: 'Kitchen',
    connections: ['hallway'],
    ambient: '#202020',
    furniture: [
      { type: 'counter', x: 0.2, y: 0.2, w: 0.4, h: 0.1 },
      { type: 'fridge', x: 0.7, y: 0.15, w: 0.1, h: 0.25 }
    ]
  },
  bathroom: {
    name: 'Bathroom',
    connections: ['hallway'],
    ambient: '#1c1c1c',
    furniture: [
      { type: 'sink', x: 0.3, y: 0.2, w: 0.15, h: 0.1 },
      { type: 'shower', x: 0.6, y: 0.15, w: 0.15, h: 0.2 }
    ]
  }
};

// Visual effects
function createLightingEffect(x, y, radius) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.2)');
  gradient.addColorStop(0.7, 'rgba(255, 200, 150, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  return gradient;
}

function addVignette() {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.5
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function applyScreenShake() {
  if (gameState.shake > 0) {
    const shakeX = (Math.random() - 0.5) * gameState.shake;
    const shakeY = (Math.random() - 0.5) * gameState.shake;
    ctx.translate(shakeX, shakeY);
    gameState.shake *= 0.9;
  }
}

function render() {
  ctx.save();
  
  // Apply screen shake
  applyScreenShake();
  
  // Clear canvas with room ambient color
  ctx.fillStyle = rooms[gameState.currentRoom].ambient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw furniture
  drawFurniture();
  
  // Apply lighting effects
  if (!gameState.lights) {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Flashlight
    const gradient = createLightingEffect(
      gameState.playerPosition.x,
      gameState.playerPosition.y,
      200
    );
    
    ctx.save();
    ctx.beginPath();
    ctx.translate(gameState.playerPosition.x, gameState.playerPosition.y);
    ctx.rotate(gameState.flashlightAngle);
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 200, -Math.PI/4, Math.PI/4);
    ctx.lineTo(0, 0);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  }
  
  // Draw player stick figure
  drawStickFigure(
    gameState.playerPosition.x,
    gameState.playerPosition.y,
    gameState.lights ? '#000' : '#fff',
    1,
    gameState.flashlightAngle
  );
  
  // Draw Kellan if visible
  if (gameState.currentRoom === gameState.kellanPosition) {
    const kellanX = canvas.width / 2 + Math.sin(Date.now() / 1000) * 100;
    const kellanY = canvas.height / 2 + Math.cos(Date.now() / 1000) * 100;
    
    if (gameState.lights || isInFlashlightBeam({x: kellanX, y: kellanY})) {
      drawStickFigure(
        kellanX,
        kellanY,
        '#ff0000',
        1.2,
        Math.atan2(
          gameState.playerPosition.y - kellanY,
          gameState.playerPosition.x - kellanX
        )
      );
      
      // Increase tension when Kellan is close
      const distance = Math.hypot(
        kellanX - gameState.playerPosition.x,
        kellanY - gameState.playerPosition.y
      );
      
      if (distance < 200) {
        gameState.shake = Math.max(gameState.shake, (200 - distance) / 10);
        gameState.vignette = Math.min(1, (200 - distance) / 200);
      }
    }
  }
  
  // Add vignette effect
  addVignette();
  
  // Draw HUD
  drawHUD();
  
  ctx.restore();
}

function drawFurniture() {
  const furniture = rooms[gameState.currentRoom].furniture;
  furniture.forEach(item => {
    // Convert relative positions to actual pixels
    const x = item.x * canvas.width;
    const y = item.y * canvas.height;
    const w = item.w * canvas.width;
    const h = item.h * canvas.height;
    
    // Draw furniture with shadows
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    ctx.fillStyle = gameState.lights ? '#8b4513' : '#444';
    ctx.fillRect(x, y, w, h);
    
    // Add detail lines
    ctx.strokeStyle = gameState.lights ? '#654321' : '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    ctx.restore();
  });
}

function drawHUD() {
  // Power meter
  const powerGradient = ctx.createLinearGradient(20, canvas.height - 40, 220, canvas.height - 40);
  powerGradient.addColorStop(0, '#ff0000');
  powerGradient.addColorStop(0.5, '#ffff00');
  powerGradient.addColorStop(1, '#00ff00');
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, canvas.height - 60, 220, 50);
  
  ctx.fillStyle = powerGradient;
  ctx.fillRect(20, canvas.height - 40, gameState.power * 2, 20);
  
  // Time display
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(canvas.width - 150, 10, 140, 40);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 5;
  const hour = Math.floor(gameState.time / 60) % 6 + 12;
  const minute = gameState.time % 60;
  ctx.fillText(
    `${hour}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'PM' : 'AM'}`,
    canvas.width - 140,
    40
  );
}

function isInFlashlightBeam(position) {
  const dx = position.x - gameState.playerPosition.x;
  const dy = position.y - gameState.playerPosition.y;
  const angle = Math.atan2(dy, dx);
  const angleDiff = Math.abs(angle - gameState.flashlightAngle);
  return angleDiff < Math.PI / 4;
}

// Game loop
function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

// Input handling
document.addEventListener('keydown', (e) => {
  if (gameState.isGameOver) return;
  
  const speed = 5;
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
      gameState.playerPosition.y = Math.max(25, gameState.playerPosition.y - speed);
      break;
    case 'ArrowDown':
    case 's':
      gameState.playerPosition.y = Math.min(canvas.height - 25, gameState.playerPosition.y + speed);
      break;
    case 'ArrowLeft':
    case 'a':
      gameState.playerPosition.x = Math.max(25, gameState.playerPosition.x - speed);
      break;
    case 'ArrowRight':
    case 'd':
      gameState.playerPosition.x = Math.min(canvas.width - 25, gameState.playerPosition.x + speed);
      break;
    case ' ':
      gameState.lights = !gameState.lights;
      break;
  }
});

document.addEventListener('mousemove', (e) => {
  if (gameState.isGameOver || gameState.lights) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  gameState.flashlightAngle = Math.atan2(
    y - gameState.playerPosition.y,
    x - gameState.playerPosition.x
  );
});

// Start game
gameLoop();