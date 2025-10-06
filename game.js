// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const visionStateEl = document.getElementById('visionState');

const TILE_SIZE = 50;
const MAP_COLS = 30;
const MAP_ROWS = 20;

// Mapa básico: 0 = calle, 1 = edificio
const mapa = Array.from({ length: MAP_ROWS }, () =>
  Array.from({ length: MAP_COLS }, () => (Math.random() < 0.2 ? 1 : 0))
);

const puntosInteres = [
  { x: 5, y: 3, label: 'Parkour', color: '#00ff00' },
  { x: 22, y: 14, label: 'Sabotaje', color: '#ff0000' },
  { x: 27, y: 2, label: 'Escape', color: '#00ffff' }
];

class Player {
  constructor() {
    this.x = MAP_COLS / 2;
    this.y = MAP_ROWS / 2;
    this.speed = 5;
    this.size = TILE_SIZE * 0.6;
  }

  draw(offsetX, offsetY) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(
      this.x * TILE_SIZE - offsetX - this.size / 2,
      this.y * TILE_SIZE - offsetY - this.size / 2,
      this.size,
      this.size
    );
  }

  update(input) {
    if (input.up) this.y -= this.speed / TILE_SIZE;
    if (input.down) this.y += this.speed / TILE_SIZE;
    if (input.left) this.x -= this.speed / TILE_SIZE;
    if (input.right) this.x += this.speed / TILE_SIZE;
    // Limitar dentro del mapa
    this.x = Math.max(0, Math.min(MAP_COLS, this.x));
    this.y = Math.max(0, Math.min(MAP_ROWS, this.y));
  }
}

class Camera {
  constructor(player) {
    this.player = player;
    this.w = canvas.width;
    this.h = canvas.height;
  }

  get offsetX() {
    return Math.floor(this.player.x * TILE_SIZE - this.w / 2);
  }

  get offsetY() {
    return Math.floor(this.player.y * TILE_SIZE - this.h / 2);
  }
}

const input = { up:0, down:0, left:0, right:0 };
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w') input.up = 1;
  if (e.key === 'ArrowDown' || e.key === 's') input.down = 1;
  if (e.key === 'ArrowLeft' || e.key === 'a') input.left = 1;
  if (e.key === 'ArrowRight' || e.key === 'd') input.right = 1;
  if (e.key === 'v' || e.key === 'V') toggleVision();
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'w') input.up = 0;
  if (e.key === 'ArrowDown' || e.key === 's') input.down = 0;
  if (e.key === 'ArrowLeft' || e.key === 'a') input.left = 0;
  if (e.key === 'ArrowRight' || e.key === 'd') input.right = 0;
});

let visionOn = false;
function toggleVision() {
  visionOn = !visionOn;
  canvas.classList.toggle('vision-filter', visionOn);
  visionStateEl.textContent = visionOn ? 'ON' : 'OFF';
  visionStateEl.classList.toggle('on', visionOn);
}

// Instancias de juego
const player = new Player();
const camera = new Camera(player);

// Dibuja el tile map
function drawMap() {
  const startCol = Math.floor(camera.offsetX / TILE_SIZE);
  const endCol = startCol + Math.ceil(canvas.width / TILE_SIZE);
  const startRow = Math.floor(camera.offsetY / TILE_SIZE);
  const endRow = startRow + Math.ceil(canvas.height / TILE_SIZE);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;
      const tile = mapa[row][col];
      const x = col * TILE_SIZE - camera.offsetX;
      const y = row * TILE_SIZE - camera.offsetY;
      ctx.fillStyle = tile === 1 ? '#444' : '#222';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }
}

// Dibuja puntos de interés
function drawPoints() {
  puntosInteres.forEach(pt => {
    const x = pt.x * TILE_SIZE - camera.offsetX;
    const y = pt.y * TILE_SIZE - camera.offsetY;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = pt.color + 'aa';
    ctx.fill();
    ctx.strokeStyle = pt.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '12px Consolas';
    ctx.fillText(pt.label, x + 16, y + 4);
  });
}

// Loop principal
function loop() {
  player.update(input);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPoints();
  player.draw(camera.offsetX, camera.offsetY);
  requestAnimationFrame(loop);
}

// Iniciar
loop();
