// Enemy class
import { CONFIG } from './config.js';

export class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.type = type;
        this.speed = type === 'fast' ? 2 : 1;
        this.health = type === 'tank' ? 2 : 1;
        this.direction = Math.random() * Math.PI * 2;
        this.changeDirectionTimer = 0;
        this.alive = true;
        this.color = this.getColor();
        this.hitFlash = 0;
    }

    getColor() {
        switch (this.type) {
            case 'fast':
                return '#ff4444';
            case 'tank':
                return '#4444ff';
            default:
                return '#ff8800';
        }
    }

    update(player, walls) {
        if (!this.alive) return;

        // Change direction periodically
        this.changeDirectionTimer--;
        if (this.changeDirectionTimer <= 0) {
            // Move toward player sometimes
            if (Math.random() < 0.4) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                this.direction = Math.atan2(dy, dx);
            } else {
                this.direction = Math.random() * Math.PI * 2;
            }
            this.changeDirectionTimer = 60 + Math.random() * 60;
        }

        // Store old position
        const oldX = this.x;
        const oldY = this.y;

        // Move in current direction
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Check wall collisions
        for (let wall of walls) {
            if (this.checkCollision(wall)) {
                this.x = oldX;
                this.y = oldY;
                this.direction = Math.random() * Math.PI * 2;
                this.changeDirectionTimer = 30;
                break;
            }
        }

        // Keep enemy in bounds
        if (this.x < CONFIG.BORDER.THICKNESS || this.x > CONFIG.CANVAS.WIDTH - CONFIG.BORDER.THICKNESS - this.width) {
            this.x = oldX;
            this.direction = Math.PI - this.direction;
        }
        if (this.y < CONFIG.BORDER.THICKNESS || this.y > CONFIG.CANVAS.HEIGHT - CONFIG.BORDER.THICKNESS - this.height) {
            this.y = oldY;
            this.direction = -this.direction;
        }

        // Decrease hit flash
        if (this.hitFlash > 0) {
            this.hitFlash--;
        }
    }

    checkCollision(rect) {
        return (
            this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y
        );
    }

    checkPlayerCollision(player) {
        return this.alive && this.checkCollision(player);
    }

    takeDamage() {
        this.health--;
        this.hitFlash = 10;
        if (this.health <= 0) {
            this.alive = false;
            return true; // Enemy died
        }
        return false; // Enemy still alive
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.save();

        // Flash white when hit
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // Draw enemy body
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw enemy details based on type
        ctx.fillStyle = '#000';
        if (this.type === 'tank') {
            // Tank - armored look
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
            ctx.fillStyle = '#888';
            ctx.fillRect(this.x + 6, this.y + 6, this.width - 12, this.height - 12);
        } else if (this.type === 'fast') {
            // Fast - spiky look
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            // Basic - simple eyes
            ctx.fillRect(this.x + 8, this.y + 10, 4, 4);
            ctx.fillRect(this.x + this.width - 12, this.y + 10, 4, 4);
        }

        // Draw health indicator for tanks
        if (this.type === 'tank' && this.health > 0) {
            ctx.fillStyle = '#ff0000';
            for (let i = 0; i < this.health; i++) {
                ctx.fillRect(this.x + 2 + i * 6, this.y - 6, 4, 4);
            }
        }

        ctx.restore();
    }
}
