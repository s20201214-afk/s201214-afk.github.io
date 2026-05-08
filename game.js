const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// Game variables
let score = 0;
let gameRunning = true;
let targets = [];
let projectiles = [];
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    angle: 0
};

// Mouse tracking
let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', shoot);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        resetGame();
    }
});

// Target class
class Target {
    constructor() {
        this.x = Math.random() * (canvas.width - 40);
        this.y = Math.random() * (canvas.height / 2 - 40);
        this.width = 30;
        this.height = 30;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = Math.random() * 2 + 1;
        this.type = Math.random() > 0.7 ? 'bonus' : 'normal';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.vx *= -1;
        }
        if (this.y < 0) {
            this.vy *= -1;
        }

        // Remove if fallen off screen
        if (this.y > canvas.height) {
            return false;
        }
        return true;
    }

    draw() {
        if (this.type === 'bonus') {
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = '#FF6B6B';
            ctx.shadowColor = '#CC0000';
            ctx.shadowBlur = 5;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    isHit(x, y) {
        return x > this.x && x < this.x + this.width &&
               y > this.y && y < this.y + this.height;
    }
}

// Projectile class
class Projectile {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.vx = Math.cos(angle) * 7;
        this.vy = Math.sin(angle) * 7;
        this.life = 255;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 8;
        return this.life > 0 && this.x > 0 && this.x < canvas.width &&
               this.y > 0 && this.y < canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 0, ${this.life / 255})`;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Player drawing
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Gun barrel
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    // Gun body
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(-15, -12, 30, 24);

    // Gun sight
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(5, -3, 10, 6);

    ctx.restore();
}

// Shoot function
function shoot() {
    if (!gameRunning) return;
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    projectiles.push(new Projectile(player.x, player.y, angle));
}

// Update game state
function update() {
    // Update projectiles
    projectiles = projectiles.filter(p => p.update());

    // Check collisions
    for (let i = targets.length - 1; i >= 0; i--) {
        for (let j = projectiles.length - 1; j >= 0; j--) {
            if (targets[i].isHit(projectiles[j].x, projectiles[j].y)) {
                score += targets[i].type === 'bonus' ? 10 : 1;
                targets.splice(i, 1);
                projectiles.splice(j, 1);
                break;
            }
        }
    }

    // Update targets
    targets = targets.filter(t => t.update());

    // Spawn new targets
    if (targets.length < 3 + Math.floor(score / 50)) {
        targets.push(new Target());
    }

    // Update player angle
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    // Update score display
    scoreDisplay.textContent = score;
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw targets
    targets.forEach(target => target.draw());

    // Draw projectiles
    projectiles.forEach(projectile => projectile.draw());

    // Draw player
    drawPlayer();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Reset game
function resetGame() {
    score = 0;
    targets = [];
    projectiles = [];
    gameRunning = true;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    scoreDisplay.textContent = '0';
}

// Start game
gameLoop();
