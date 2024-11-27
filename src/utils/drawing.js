export function drawStickFigure(ctx, x, y, color, scale = 1, angle = 0) {
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

export function createLightingEffect(ctx, x, y, radius) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.2)');
  gradient.addColorStop(0.7, 'rgba(255, 200, 150, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  return gradient;
}