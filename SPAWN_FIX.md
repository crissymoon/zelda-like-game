// Main Game Module
import { CONFIG } from './config.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Collectible } from './Collectible.js';
import { Door } from './Door.js';
import { LevelGenerator } from './LevelGenerator.js';

class Game {
    constructor() {
        console.log('Game constructor called');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('ERROR: Canvas element not found!');
            return;
        }
        console.log('Canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;
        console.log('Canvas initialized:', CONFIG.CANVAS.WIDTH, 'x', CONFIG.CANVAS.HEIGHT);

        // Game state
        this.level = 1;
        this.score = 0;
        this.hearts = CONFIG.GAME.STARTING_HEARTS;
        this.walls = [];
        this.enemies = [];
        this.collectibles = [];
        this.particles = [];
        this.door = null;
        this.player = null;
        this.levelGenerator = new LevelGenerator();
        this.levelStartTime = Date.now();

        // Input handling
        this.keysPressed = {};
        this.setupInput();

        // UI elements
        this.levelCompleteModal = document.getElementById('levelComplete');
        this.gameOverModal = document.getElementById('gameOver');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');

        if (!this.levelCompleteModal || !this.gameOverModal || !this.nextLevelBtn) {
            console.error('ERROR: UI elements not found!');
            console.error('levelComplete:', this.levelCompleteModal);
            console.error('gameOver:', this.gameOverModal);
            console.error('nextLevelBtn:', this.nextLevelBtn);
            return;
        }

        // Bind event
        this.nextLevelBtn.addEventListener('click', () => this.nextLevel());

        console.log('All elements found, starting game initialization...');

        // Start game
        try {
            this.initLevel();
            console.log('Level initialized, starting game loop...');
            // Log game state before starting loop
            this.logFirstFrame();
            this.gameLoop();
        } catch (error) {
            console.error('ERROR during initialization:', error);
            console.error('Stack:', error.stack);
        }
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.key] = false;
        });
    }

    initLevel() {
        console.log(`Initializing level ${this.level}`);
        
        this.levelStartTime = Date.now();
        this.particles = [];

        // Generate walls
        this.walls = this.levelGenerator.generateWalls(this.level);
        console.log(`Generated ${this.walls.length} walls`);

        // Create player at start position
        this.player = new Player(60, 60);

        // Get door position
        const doorPos = this.levelGenerator.getDoorPosition(this.level);
        this.door = new Door(doorPos.x, doorPos.y);
        console.log(`Door created at`, doorPos);

        // Generate enemies
        this.enemies = [];
        const enemyCount = 2 + this.level;
        const avoidPositions = [
            { x: this.player.x, y: this.player.y },
            { x: this.door.x, y: this.door.y }
        ];

        for (let i = 0; i < enemyCount; i++) {
            const pos = this.levelGenerator.getRandomSafePosition(this.walls, avoidPositions, 40, 28);
            let type = 'basic';
            if (this.level > 2 && Math.random() < 0.3) type = 'fast';
            if (this.level > 4 && Math.random() < 0.2) type = 'tank';
            
            this.enemies.push(new Enemy(pos.x, pos.y, type));
            avoidPositions.push(pos);
        }
        console.log(`Created ${this.enemies.length} enemies`);

        // Generate collectibles
        this.collectibles = [];
        const rupeeCount = 3 + Math.floor(this.level / 2);
        const keyCount = 1 + Math.floor(this.level / 3);

        for (let i = 0; i < rupeeCount; i++) {
            const pos = this.levelGenerator.getRandomSafePosition(this.walls, avoidPositions, 30);
            this.collectibles.push(new Collectible(pos.x, pos.y, 'rupee'));
            avoidPositions.push(pos);
        }

        for (let i = 0; i < keyCount; i++) {
            const pos = this.levelGenerator.getRandomSafePosition(this.walls, avoidPositions, 30);
            this.collectibles.push(new Collectible(pos.x, pos.y, 'key'));
            avoidPositions.push(pos);
        }
        console.log(`Created ${this.collectibles.length} collectibles`);

        this.updateUI();
    }

    update() {
        // Update player
        this.player.update(this.keysPressed, this.walls);

        // Update enemies
        for (let enemy of this.enemies) {
            if (enemy.alive) {
                enemy.update(this.player, this.walls);

                // Check player collision with enemy
                if (enemy.checkPlayerCollision(this.player)) {
                    if (this.player.takeDamage()) {
                        this.hearts--;
                        this.createHitParticles(this.player.x, this.player.y, '#ff0000');
                        
                        if (this.hearts <= 0) {
                            this.gameOver();
                            return;
                        }
                        this.updateUI();
                    }
                }

                // Check attack collision with enemy
                const attackBox = this.player.getAttackBox();
                if (attackBox && enemy.checkCollision(attackBox)) {
                    const enemyDied = enemy.takeDamage();
                    if (enemyDied) {
                        this.score += CONFIG.SCORING.ENEMY_KILL;
                        this.createHitParticles(enemy.x, enemy.y, enemy.color);
                        this.updateUI();
                    }
                }
            }
        }

        // Update collectibles
        for (let collectible of this.collectibles) {
            if (!collectible.collected) {
                collectible.update();

                if (collectible.checkCollision(this.player)) {
                    collectible.collect();
                    this.createCollectParticles(collectible.x, collectible.y, collectible.type);
                    
                    if (collectible.type === 'rupee') {
                        this.score += CONFIG.SCORING.RUPEE;
                    } else if (collectible.type === 'key') {
                        this.score += CONFIG.SCORING.KEY;
                    }
                    this.updateUI();
                }
            }
        }

        // Check if all collectibles are collected
        const allCollected = this.collectibles.every(c => c.collected);
        if (allCollected && !this.door.active) {
            this.door.open();
        }

        // Update door
        this.door.update();

        // Check door collision
        if (this.door.checkCollision(this.player)) {
            this.levelComplete();
            return;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw floor pattern
        this.drawFloor();

        // Draw walls
        this.drawWalls();

        // Draw door
        this.door.draw(this.ctx, this.particles);

        // Draw collectibles
        for (let collectible of this.collectibles) {
            collectible.draw(this.ctx);
        }

        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        // Draw player
        this.player.draw(this.ctx);

        // Draw particles
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
    }

    drawFloor() {
        const tileSize = 40;
        this.ctx.fillStyle = '#1a1a1a';
        
        for (let x = 0; x < this.canvas.width; x += tileSize) {
            for (let y = 0; y < this.canvas.height; y += tileSize) {
                if ((x / tileSize + y / tileSize) % 2 === 0) {
                    this.ctx.fillRect(x, y, tileSize, tileSize);
                }
            }
        }
    }

    drawWalls() {
        for (let wall of this.walls) {
            this.ctx.save();

            if (wall.type === 'border') {
                // Border walls - darker
                const gradient = this.ctx.createLinearGradient(
                    wall.x, wall.y,
                    wall.x + wall.width, wall.y + wall.height
                );
                gradient.addColorStop(0, '#2a2a2a');
                gradient.addColorStop(0.5, '#1a1a1a');
                gradient.addColorStop(1, '#0a0a0a');
                this.ctx.fillStyle = gradient;
            } else {
                // Interior walls - stone texture
                const gradient = this.ctx.createLinearGradient(
                    wall.x, wall.y,
                    wall.x + wall.width, wall.y + wall.height
                );
                gradient.addColorStop(0, '#4a4a4a');
                gradient.addColorStop(0.5, '#3a3a3a');
                gradient.addColorStop(1, '#2a2a2a');
                this.ctx.fillStyle = gradient;
            }

            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

            // Add stone texture
            if (wall.type !== 'border') {
                this.ctx.strokeStyle = '#555';
                this.ctx.lineWidth = 1;
                
                // Horizontal lines
                for (let i = 10; i < wall.height; i += 20) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(wall.x, wall.y + i);
                    this.ctx.lineTo(wall.x + wall.width, wall.y + i);
                    this.ctx.stroke();
                }

                // Vertical lines
                for (let i = 15; i < wall.width; i += 30) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(wall.x + i, wall.y);
                    this.ctx.lineTo(wall.x + i, wall.y + wall.height);
                    this.ctx.stroke();
                }
            }

            // Border
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

            this.ctx.restore();
        }
    }

    createHitParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: x + 16,
                y: y + 16,
                color: color,
                size: 4,
                velocityX: Math.cos(angle) * 3,
                velocityY: Math.sin(angle) * 3,
                life: CONFIG.EFFECTS.PARTICLE_LIFE,
                maxLife: CONFIG.EFFECTS.PARTICLE_LIFE,
                update() {
                    this.x += this.velocityX;
                    this.y += this.velocityY;
                    this.velocityX *= 0.95;
                    this.velocityY *= 0.95;
                    this.life--;
                },
                draw(ctx) {
                    const alpha = this.life / this.maxLife;
                    ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                    ctx.fillRect(this.x, this.y, this.size, this.size);
                }
            });
        }
    }

    createCollectParticles(x, y, type) {
        const color = type === 'rupee' ? '#00ff00' : '#ffd700';
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            this.particles.push({
                x: x + 10,
                y: y + 10,
                color: color,
                size: 3,
                velocityX: Math.cos(angle) * 2,
                velocityY: Math.sin(angle) * 2,
                life: 25,
                maxLife: 25,
                update() {
                    this.x += this.velocityX;
                    this.y += this.velocityY;
                    this.velocityY += 0.1;
                    this.life--;
                },
                draw(ctx) {
                    const alpha = this.life / this.maxLife;
                    ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                    ctx.fillRect(this.x, this.y, this.size, this.size);
                }
            });
        }
    }

    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('hearts').textContent = '❤️'.repeat(this.hearts);
        
        const totalCollectibles = this.collectibles.length;
        const collectedCount = this.collectibles.filter(c => c.collected).length;
        document.getElementById('items').textContent = `${collectedCount}/${totalCollectibles}`;
    }

    levelComplete() {
        // Calculate time bonus
        const timeElapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
        const timeBonus = Math.max(0, CONFIG.SCORING.BASE_TIME_BONUS - (timeElapsed * CONFIG.SCORING.TIME_PENALTY));
        this.score += timeBonus;

        // Restore hearts
        this.hearts = Math.min(this.hearts + CONFIG.GAME.HEARTS_RESTORE_ON_LEVEL, CONFIG.GAME.MAX_HEARTS);

        // Show level complete modal
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('timeBonus').textContent = timeBonus;
        this.levelCompleteModal.classList.remove('hidden');
    }

    nextLevel() {
        this.levelCompleteModal.classList.add('hidden');
        this.level++;
        this.player.levelUp();
        this.initLevel();
    }

    gameOver() {
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalScore').textContent = this.score;
        this.gameOverModal.classList.remove('hidden');
    }

    gameLoop() {
        try {
            this.update();
            this.draw();
        } catch (error) {
            console.error('ERROR in game loop:', error);
            console.error('Stack:', error.stack);
            return; // Stop the loop on error
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // For debugging - call once to log first draw
    logFirstFrame() {
        console.log('First frame rendered');
        console.log('Player:', this.player);
        console.log('Enemies:', this.enemies.length);
        console.log('Collectibles:', this.collectibles.length);
        console.log('Walls:', this.walls.length);
    }
}

// Global game instance
let gameInstance = null;

// Start the game when page loads
function startGame() {
    console.log('Starting Zelda Adventure Game...');
    try {
        gameInstance = new Game();
        console.log('Game instance created successfully:', gameInstance);
        window.game = gameInstance; // Expose for debugging
    } catch (error) {
        console.error('ERROR creating game:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    // DOM is already ready
    startGame();
}
