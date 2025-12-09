// Door class
export class Door {
    constructor(x, y, width = 50, height = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = false;
        this.pulsePhase = 0;
    }

    update() {
        this.pulsePhase = (this.pulsePhase + 0.1) % (Math.PI * 2);
    }

    checkCollision(player) {
        return (
            this.active &&
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }

    open() {
        this.active = true;
    }

    draw(ctx, particles) {
        ctx.save();
        
        if (this.active) {
            // Glow animation
            const glowIntensity = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 20 * glowIntensity;
            
            // Active door (green/glowing)
            const gradient = ctx.createRadialGradient(
                this.x + this.width / 2, 
                this.y + this.height / 2, 
                5,
                this.x + this.width / 2, 
                this.y + this.height / 2, 
                this.width / 2
            );
            gradient.addColorStop(0, '#88ff88');
            gradient.addColorStop(0.5, '#00ff00');
            gradient.addColorStop(1, '#00aa00');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Inner pattern
            ctx.fillStyle = '#00cc00';
            ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);
            
            // Triforce symbol
            ctx.fillStyle = '#FFD700';
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const size = 6;
            
            // Top triangle
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx - size, cy + size);
            ctx.lineTo(cx + size, cy + size);
            ctx.closePath();
            ctx.fill();
            
            // Sparkle particles
            if (Math.random() < 0.3 && particles) {
                particles.push({
                    x: this.x + Math.random() * this.width,
                    y: this.y + Math.random() * this.height,
                    color: 'rgb(255, 255, 200)',
                    size: 3,
                    velocityX: 0,
                    velocityY: -2,
                    life: 30,
                    maxLife: 30,
                    update() {
                        this.x += this.velocityX;
                        this.y += this.velocityY;
                        this.velocityY += 0.2;
                        this.life--;
                    },
                    draw(ctx) {
                        const alpha = this.life / this.maxLife;
                        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                        ctx.fillRect(this.x, this.y, this.size, this.size);
                    }
                });
            }
        } else {
            // Inactive door (locked)
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#333');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Door frame
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Lock symbol
            ctx.fillStyle = '#888';
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            
            // Lock body
            ctx.fillRect(cx - 8, cy, 16, 12);
            
            // Lock shackle
            ctx.beginPath();
            ctx.arc(cx, cy - 2, 6, Math.PI, 0, true);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#888';
            ctx.stroke();
            
            // Keyhole
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx, cy + 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(cx - 1, cy + 5, 2, 4);
        }
        
        // Door border
        ctx.strokeStyle = this.active ? '#00ff00' : '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}
