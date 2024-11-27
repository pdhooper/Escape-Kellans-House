import { rooms } from '../config/rooms.js';
import { gameState } from './state.js';
import { drawStickFigure, createLightingEffect } from '../utils/drawing.js';
import { kellanAI } from './kellan.js';

export function render(ctx, canvas) {
  ctx.save();
  
  applyScreenShake(ctx);
  drawRoom(ctx, canvas);
  drawFurniture(ctx, canvas);
  applyLighting(ctx, canvas);
  drawPlayer(ctx);
  drawKellan(ctx);
  addVignette(ctx, canvas);
  drawHUD(ctx, canvas);
  
  if (gameState.isGameOver) {
    drawGameOver(ctx, canvas);
  }
  
  ctx.restore();
}

function applyScreenShake(ctx) {
  if (gameState.shake > 0) {
    const shakeX = (Math.random() - 0.5) * gameState.shake;
    const shakeY = (Math.random() - 0.5) * gameState.shake;
    ctx.translate(shakeX, shakeY);
    gameState.shake *= 0.9;
  }
}

function drawRoom(ctx, canvas) {
  const room = rooms[gameState.currentRoom];
  ctx.fillStyle = room.ambient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw room name
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(room.name, 20, 40);
}

function drawFurniture(ctx, canvas) {
  const furniture = rooms[gameState.currentRoom].furniture;
  furniture.forEach(item => {
    const x = item.x * canvas.width;
    const y = item.y * canvas.height;
    const w = item.w * canvas.width;
    const h = item.h * canvas.height;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    ctx.fillStyle = gameState.lights ? '#8b4513' : '#444';
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = gameState.lights ? '#654321' : '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    ctx.restore();
  });
}

function applyLighting(ctx, canvas) {
  if (!gameState.lights) {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Flashlight
    const gradient = createLightingEffect(
      ctx,
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
}

function drawPlayer(ctx) {
  drawStickFigure(
    ctx,
    gameState.playerPosition.x,
    gameState.playerPosition.y,
    gameState.lights ? '#000' : '#fff',
    1,
    gameState.flashlightAngle
  );
}

function drawKellan(ctx) {
  if (gameState.currentRoom === gameState.kellanPosition) {
    if (gameState.lights || isInFlashlightBeam(kellanAI.position)) {
      drawStickFigure(
        ctx,
        kellanAI.position.x,
        kellanAI.position.y,
        '#ff0000',
        1.2,
        Math.atan2(
          gameState.playerPosition.y - kellanAI.position.y,
          gameState.playerPosition.x - kellanAI.position.x
        )
      );
      
      const distance = Math.hypot(
        kellanAI.position.x - gameState.playerPosition.x,
        kellanAI.position.y - gameState.playerPosition.y
      );
      
      if (distance < 200) {
        gameState.shake = Math.max(gameState.shake, (200 - distance) / 10);
        gameState.vignette = Math.min(1, (200 - distance) / 200);
      }
    }
  }
}

function isInFlashlightBeam(position) {
  const dx = position.x - gameState.playerPosition.x;
  const dy = position.y - gameState.playerPosition.y;
  const angle = Math.atan2(dy, dx);
  const angleDiff = Math.abs(angle - gameState.flashlightAngle);
  return angleDiff < Math.PI / 4;
}

function addVignette(ctx, canvas) {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.5
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.5, `rgba(0,0,0,${gameState.vignette * 0.3})`);
  gradient.addColorStop(1, `rgba(0,0,0,${0.7 + gameState.vignette * 0.3})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHUD(ctx, canvas) {
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
  ctx.textAlign = 'left';
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

function drawGameOver(ctx, canvas) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);
}