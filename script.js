// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configure canvas size
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 40;

// Audio setup
const audio = {
  bgMusic: new Audio(),
  footsteps: new Audio(),
  doorCreak: new Audio(),
  kellanScream: new Audio(),
  heartbeat: new Audio()
};

// Initialize audio
audio.bgMusic.src = 'https://assets.codepen.io/horror-ambience.mp3';
audio.bgMusic.loop = true;
audio.bgMusic.volume = 0.3;

audio.footsteps.src = 'https://assets.codepen.io/footsteps.mp3';
audio.footsteps.volume = 0.2;

audio.doorCreak.src = 'https://assets.codepen.io/door-creak.mp3';
audio.doorCreak.volume = 0.4;

audio.kellanScream.src = 'https://assets.codepen.io/monster-scream.mp3';
audio.kellanScream.volume = 0.5;

audio.heartbeat.src = 'https://assets.codepen.io/heartbeat.mp3';
audio.heartbeat.volume = 0.0;
audio.heartbeat.loop = true;

// Start audio on first interaction
document.addEventListener('click', () => {
  if (!audio.bgMusic.playing) {
    audio.bgMusic.play();
    audio.heartbeat.play();
  }
}, { once: true });

// Rest of the existing code...
${previousContent}

// Update audio based on game state
function updateAudio() {
  // Adjust heartbeat volume based on proximity to Kellan
  if (gameState.currentRoom === gameState.kellanPosition) {
    const kellanX = canvas.width / 2 + Math.sin(Date.now() / 1000) * 100;
    const kellanY = canvas.height / 2 + Math.cos(Date.now() / 1000) * 100;
    const distance = Math.hypot(
      kellanX - gameState.playerPosition.x,
      kellanY - gameState.playerPosition.y
    );
    
    audio.heartbeat.volume = Math.min(0.8, (400 - distance) / 400);
  } else {
    audio.heartbeat.volume = Math.max(0, audio.heartbeat.volume - 0.02);
  }
  
  // Play Kellan's scream when very close
  if (distance < 100 && !audio.kellanScream.playing) {
    audio.kellanScream.play();
  }
}

// Update game loop to include audio
function gameLoop() {
  render();
  updateAudio();
  requestAnimationFrame(gameLoop);
}

// Update movement to include footstep sounds
document.addEventListener('keydown', (e) => {
  if (gameState.isGameOver) return;
  
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
      gameState.playerPosition.y = Math.min(canvas.height - 25, gameState.playerPosition.y + speed);
      moved = true;
      break;
    case 'ArrowLeft':
    case 'a':
      gameState.playerPosition.x = Math.max(25, gameState.playerPosition.x - speed);
      moved = true;
      break;
    case 'ArrowRight':
    case 'd':
      gameState.playerPosition.x = Math.min(canvas.width - 25, gameState.playerPosition.x + speed);
      moved = true;
      break;
    case ' ':
      gameState.lights = !gameState.lights;
      break;
  }
  
  if (moved && !audio.footsteps.playing) {
    audio.footsteps.play();
  }
});