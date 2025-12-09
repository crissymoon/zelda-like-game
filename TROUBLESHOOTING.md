// Collectible class
export class Collectible {
    constructor(x, y, type = 'rupee') {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.collected = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.pulsePhase = (this.pulsePhase + 0.1) % (Math.PI * 2);
        this.bobPhase = (this.bobPhase + 0.05) % (Math.PI * 2);
    }

    checkCollision(player) {
        return (
            !this.collected &&
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }

    collect() {
        this.collected = true;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();

        const bobOffset = Math.sin(this.bobPhase) * 3;
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + bobOffset;

        ctx.translate(centerX, centerY);
        ctx.scale(pulseScale, pulseScale);

        if (this.type === 'rupee') {
            // Draw rupee (green gem)
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(8, -3);
            ctx.lineTo(8, 3);
            ctx.lineTo(0, 10);
            ctx.lineTo(-8, 3);
            ctx.lineTo(-8, -3);
            ctx.closePath();
            ctx.fill();

            // Inner highlight
            ctx.fillStyle = '#88ff88';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(4, -2);
            ctx.lineTo(4, 2);
            ctx.lineTo(0, 6);
            ctx.lineTo(-4, 2);
            ctx.lineTo(-4, -2);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'key') {
            // Draw key (golden)
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;

            // Key shaft
            ctx.fillRect(-2, -8, 4, 12);
            
            // Key head
            ctx.beginPath();
            ctx.arc(0, -8, 5, 0, Math.PI * 2);
            ctx.fill();

            // Key teeth
            ctx.fillRect(2, 2, 3, 3);
            ctx.fillRect(2, 6, 3, 3);

            // Inner circle of key head
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(0, -8, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
