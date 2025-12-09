// Player class
import { CONFIG } from './config.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        this.baseSpeed = CONFIG.PLAYER.SPEED;
        this.speed = this.baseSpeed;
        this.direction = 'down';
        this.moving = false;
        this.attacking = false;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.attackTimer = 0;
        this.animationFrame = 0;
        this.animationCounter = 0;
    }

    update(keys, walls) {
        // Handle invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Handle attack cooldown
        if (this.attackTimer > 0) {
            this.attackTimer--;
            if (this.attackTimer === 0) {
                this.attacking = false;
            }
        }

        // Handle attack input
        if (keys[' '] && !this.attacking && this.attackTimer === 0) {
            this.attacking = true;
            this.attackTimer = CONFIG.PLAYER.ATTACK_COOLDOWN;
        }

        // Store old position
        const oldX = this.x;
        const oldY = this.y;
        this.moving = false;

        // Handle movement
        if (keys['ArrowUp']) {
            this.y -= this.speed;
            this.direction = 'up';
            this.moving = true;
        }
        if (keys['ArrowDown']) {
            this.y += this.speed;
            this.direction = 'down';
            this.moving = true;
        }
        if (keys['ArrowLeft']) {
            this.x -= this.speed;
            this.direction = 'left';
            this.moving = true;
        }
        if (keys['ArrowRight']) {
            this.x += this.speed;
            this.direction = 'right';
            this.moving = true;
        }

        // Update animation
        if (this.moving) {
            this.animationCounter++;
            if (this.animationCounter >= 8) {
                this.animationFrame = (this.animationFrame + 1) % 2;
                this.animationCounter = 0;
            }
        }

        // Check wall collisions
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                this.x = oldX;
                this.y = oldY;
                break;
            }
        }

        // Keep player in bounds
        this.x = Math.max(CONFIG.BORDER.THICKNESS, Math.min(this.x, CONFIG.CANVAS.WIDTH - CONFIG.BORDER.THICKNESS - this.width));
        this.y = Math.max(CONFIG.BORDER.THICKNESS, Math.min(this.y, CONFIG.CANVAS.HEIGHT - CONFIG.BORDER.THICKNESS - this.height));
    }

    checkCollision(rect) {
        return (
            this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y
        );
    }

    takeDamage() {
        if (!this.invulnerable) {
            this.invulnerable = true;
            this.invulnerableTimer = CONFIG.PLAYER.INVULNERABLE_TIME;
            return true;
        }
        return false;
    }

    getAttackBox() {
        if (!this.attacking) return null;

        const range = CONFIG.PLAYER.ATTACK_RANGE;
        let attackBox = { x: this.x, y: this.y, width: this.width, height: this.height };

        switch (this.direction) {
            case 'up':
                attackBox.y -= range;
                attackBox.height += range;
                break;
            case 'down':
                attackBox.height += range;
                break;
            case 'left':
                attackBox.x -= range;
                attackBox.width += range;
                break;
            case 'right':
                attackBox.width += range;
                break;
        }

        return attackBox;
    }

    levelUp() {
        this.speed = Math.min(
            this.baseSpeed + CONFIG.PLAYER.SPEED_INCREMENT_PER_LEVEL,
            CONFIG.PLAYER.MAX_SPEED
        );
        this.baseSpeed = this.speed;
    }

    draw(ctx) {
        ctx.save();

        // Flicker effect when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Draw player body
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw tunic details
        ctx.fillStyle = '#008800';
        ctx.fillRect(this.x + 4, this.y + 10, this.width - 8, this.height - 12);

        // Draw face/head
        ctx.fillStyle = '#ffcc99';
        const headY = this.y + 6;
        ctx.fillRect(this.x + 8, headY, this.width - 16, 12);

        // Draw eyes based on direction
        ctx.fillStyle = '#000';
        if (this.direction === 'left') {
            ctx.fillRect(this.x + 10, headY + 4, 3, 3);
        } else if (this.direction === 'right') {
            ctx.fillRect(this.x + this.width - 13, headY + 4, 3, 3);
        } else if (this.direction === 'up') {
            ctx.fillRect(this.x + 10, headY + 2, 3, 3);
            ctx.fillRect(this.x + this.width - 13, headY + 2, 3, 3);
        } else {
            ctx.fillRect(this.x + 10, headY + 5, 3, 3);
            ctx.fillRect(this.x + this.width - 13, headY + 5, 3, 3);
        }

        // Draw sword when attacking
        if (this.attacking) {
            ctx.fillStyle = '#c0c0c0';
            const swordLength = 20;
            const swordWidth = 6;

            switch (this.direction) {
                case 'up':
                    ctx.fillRect(this.x + this.width / 2 - swordWidth / 2, this.y - swordLength, swordWidth, swordLength);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(this.x + this.width / 2 - 3, this.y - swordLength - 3, 6, 3);
                    break;
                case 'down':
                    ctx.fillRect(this.x + this.width / 2 - swordWidth / 2, this.y + this.height, swordWidth, swordLength);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height + swordLength, 6, 3);
                    break;
                case 'left':
                    ctx.fillRect(this.x - swordLength, this.y + this.height / 2 - swordWidth / 2, swordLength, swordWidth);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(this.x - swordLength - 3, this.y + this.height / 2 - 3, 3, 6);
                    break;
                case 'right':
                    ctx.fillRect(this.x + this.width, this.y + this.height / 2 - swordWidth / 2, swordLength, swordWidth);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(this.x + this.width + swordLength, this.y + this.height / 2 - 3, 3, 6);
                    break;
            }
        }

        ctx.restore();
    }
}
