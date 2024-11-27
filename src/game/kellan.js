import { gameState } from './state.js';
import { rooms } from '../config/rooms.js';
import { audioManager } from './audio.js';

class KellanAI {
  constructor() {
    this.lastMove = Date.now();
    this.moveInterval = 5000;
    this.huntMode = false;
    this.lastKnownPlayerRoom = null;
    this.speed = 2;
    this.position = { x: 0, y: 0 };
    this.chaseTimeout = null;
  }

  update() {
    const now = Date.now();
    
    // Update hunt mode based on time (more aggressive after 3 AM)
    this.huntMode = gameState.time >= 180;
    if (this.huntMode) {
      this.speed = 3; // Faster at night
      this.moveInterval = 3000; // More frequent room changes
    }
    
    // Track player's room
    if (this.lastKnownPlayerRoom !== gameState.currentRoom && !gameState.lights) {
      this.lastKnownPlayerRoom = gameState.currentRoom;
    }
    
    // Chase player if in same room
    if (gameState.currentRoom === gameState.kellanPosition) {
      this.chasePlayer();
    } else if (now - this.lastMove >= this.moveInterval) {
      this.moveToNewRoom();
      this.lastMove = now;
    }
    
    this.updateAudioEffects();
  }
  
  chasePlayer() {
    // Calculate direction to player
    const dx = gameState.playerPosition.x - this.position.x;
    const dy = gameState.playerPosition.y - this.position.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > 10) { // Don't move if very close to prevent jittering
      // Normalize direction and apply speed
      this.position.x += (dx / distance) * this.speed;
      this.position.y += (dy / distance) * this.speed;
      
      // Check for player catch
      if (distance < 50) {
        this.catchPlayer();
      }
    }
    
    // Increase chase speed if player is visible
    if (gameState.lights || this.isPlayerInFlashlightBeam()) {
      this.speed = this.huntMode ? 4 : 3;
    } else {
      this.speed = this.huntMode ? 3 : 2;
    }
  }
  
  isPlayerInFlashlightBeam() {
    const dx = gameState.playerPosition.x - this.position.x;
    const dy = gameState.playerPosition.y - this.position.y;
    const angle = Math.atan2(dy, dx);
    const angleDiff = Math.abs(angle - gameState.flashlightAngle);
    return angleDiff < Math.PI / 4;
  }
  
  catchPlayer() {
    if (!gameState.isGameOver) {
      gameState.isGameOver = true;
      audioManager.play('kellanScream');
      gameState.shake = 20;
      
      // Show game over screen after a brief delay
      setTimeout(() => {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);
      }, 500);
    }
  }
  
  moveToNewRoom() {
    const currentRoom = rooms[gameState.kellanPosition];
    let possibleRooms = currentRoom.connections;
    
    if (this.huntMode && this.lastKnownPlayerRoom) {
      // In hunt mode, prefer moving towards player's last known location
      const pathToPlayer = this.findPathToRoom(gameState.kellanPosition, this.lastKnownPlayerRoom);
      if (pathToPlayer.length > 1) {
        gameState.kellanPosition = pathToPlayer[1];
        // Reset position when entering new room
        this.position.x = Math.random() * window.innerWidth;
        this.position.y = Math.random() * window.innerHeight;
        audioManager.play('doorCreak');
        return;
      }
    }
    
    // Random movement if not hunting or can't find path to player
    const newRoom = possibleRooms[Math.floor(Math.random() * possibleRooms.length)];
    gameState.kellanPosition = newRoom;
    this.position.x = Math.random() * window.innerWidth;
    this.position.y = Math.random() * window.innerHeight;
    audioManager.play('doorCreak');
  }
  
  findPathToRoom(start, end) {
    const visited = new Set();
    const queue = [[start]];
    
    while (queue.length > 0) {
      const path = queue.shift();
      const room = path[path.length - 1];
      
      if (room === end) {
        return path;
      }
      
      if (!visited.has(room)) {
        visited.add(room);
        const connections = rooms[room].connections;
        
        for (const nextRoom of connections) {
          if (!visited.has(nextRoom)) {
            queue.push([...path, nextRoom]);
          }
        }
      }
    }
    
    return [start];
  }
  
  updateAudioEffects() {
    if (gameState.currentRoom === gameState.kellanPosition) {
      const distance = Math.hypot(
        this.position.x - gameState.playerPosition.x,
        this.position.y - gameState.playerPosition.y
      );
      
      // Update heartbeat volume based on proximity
      const heartbeatVolume = Math.min(0.8, (400 - distance) / 400);
      audioManager.setVolume('heartbeat', heartbeatVolume);
      
      // Play scream when very close
      if (distance < 100) {
        audioManager.play('kellanScream');
      }
    } else {
      audioManager.setVolume('heartbeat', 0);
    }
  }
}

export const kellanAI = new KellanAI();