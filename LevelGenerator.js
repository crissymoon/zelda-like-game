// Level Generator
import { CONFIG } from './config.js';

export class LevelGenerator {
    constructor() {
        this.borderThickness = CONFIG.BORDER.THICKNESS;
    }

    generateWalls(levelNum) {
        const walls = [];
        
        // Border walls
        walls.push(
            { x: 0, y: 0, width: 800, height: this.borderThickness, type: 'border' },
            { x: 0, y: 600 - this.borderThickness, width: 800, height: this.borderThickness, type: 'border' },
            { x: 0, y: 0, width: this.borderThickness, height: 600, type: 'border' },
            { x: 800 - this.borderThickness, y: 0, width: this.borderThickness, height: 600, type: 'border' }
        );
        
        // Generate interior walls
        const interiorWalls = this.generateInteriorWalls(levelNum);
        walls.push(...interiorWalls);
        
        return walls;
    }

    generateInteriorWalls(level) {
        const patterns = [];
        const complexity = Math.min(level, 8);
        const playableWidth = 800 - 60;
        const playableHeight = 600 - 60;
        const startX = 30;
        const startY = 30;
        
        // Create a grid system to avoid overlaps
        const gridSize = 80;
        const gridWidth = Math.floor(playableWidth / gridSize);
        const gridHeight = Math.floor(playableHeight / gridSize);
        const occupied = new Set();
        
        // Helper functions
        const isOccupied = (gx, gy, width = 1, height = 1) => {
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    if (occupied.has(`${gx + i},${gy + j}`)) return true;
                }
            }
            return false;
        };
        
        const markOccupied = (gx, gy, width = 1, height = 1) => {
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    occupied.add(`${gx + i},${gy + j}`);
                }
            }
        };
        
        // Keep spawn area clear (first 2x2 cells)
        markOccupied(0, 0, 2, 2);
        
        // Keep center area clear for failsafe spawning (middle 2x2 cells)
        const centerGx = Math.floor(gridWidth / 2) - 1;
        const centerGy = Math.floor(gridHeight / 2) - 1;
        markOccupied(centerGx, centerGy, 2, 2);
        
        // Keep door areas clear (corners)
        markOccupied(gridWidth - 2, gridHeight - 2, 2, 2); // bottom-right
        markOccupied(gridWidth - 2, 0, 2, 2); // top-right
        markOccupied(0, gridHeight - 2, 2, 2); // bottom-left
        
        // Create structured walls with reduced thickness
        for (let i = 0; i < complexity + 3; i++) {
            const horizontal = Math.random() > 0.5;
            const attempts = 30;
            
            for (let attempt = 0; attempt < attempts; attempt++) {
                let gx = Math.floor(Math.random() * (gridWidth - 3)) + 1;
                let gy = Math.floor(Math.random() * (gridHeight - 3)) + 1;
                let gw = horizontal ? Math.floor(Math.random() * 2) + 2 : 1;
                let gh = horizontal ? 1 : Math.floor(Math.random() * 2) + 2;
                
                // Check if space is available
                if (!isOccupied(gx, gy, gw, gh)) {
                    markOccupied(gx, gy, gw, gh);
                    
                    const x = startX + gx * gridSize + Math.random() * 20;
                    const y = startY + gy * gridSize + Math.random() * 20;
                    const width = gw * gridSize - 30;
                    const height = gh * gridSize - 30;
                    
                    patterns.push({ 
                        x, y, width, height, 
                        type: 'interior',
                        textureOffset: Math.random() * 100
                    });
                    break;
                }
            }
        }
        
        // REMOVED: Room structures that block center
        // This was causing the failsafe spawn to be inside walls
        
        return patterns;
    }

    // Helper method to check if a rectangle collides with a wall
    isColliding(x, y, width, height, wall) {
        return (
            x < wall.x + wall.width &&
            x + width > wall.x &&
            y < wall.y + wall.height &&
            y + height > wall.y
        );
    }

    // Helper method to check if a point is inside a wall
    isPointInWall(px, py, wall) {
        return (
            px >= wall.x &&
            px <= wall.x + wall.width &&
            py >= wall.y &&
            py <= wall.y + wall.height
        );
    }

    getRandomSafePosition(walls, avoidPositions = [], minDistance = 50, entitySize = 20) {
        let x, y, safe;
        let attempts = 0;
        const maxAttempts = 300; // INCREASED even more for level 3+
        const buffer = minDistance;
        
        do {
            // Generate position with substantial margin from edges
            x = 100 + Math.random() * (600);  // 100-700
            y = 100 + Math.random() * (400);  // 100-500
            safe = true;
            
            // Check if too close to avoid positions (player start, door, other items)
            for (let pos of avoidPositions) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {  // REDUCED from 150 to allow more spawn space
                    safe = false;
                    break;
                }
            }
            
            if (!safe) {
                attempts++;
                continue;
            }
            
            // Define entity bounding box
            const entityBox = {
                left: x,
                right: x + entitySize,
                top: y,
                bottom: y + entitySize
            };
            
            // Define buffered entity box (for distance check)
            const bufferedBox = {
                left: x - buffer,
                right: x + entitySize + buffer,
                top: y - buffer,
                bottom: y + entitySize + buffer
            };
            
            // Check against all walls
            for (let wall of walls) {
                // Define wall bounding box
                const wallBox = {
                    left: wall.x,
                    right: wall.x + wall.width,
                    top: wall.y,
                    bottom: wall.y + wall.height
                };
                
                // CHECK 1: Is ANY part of the entity inside the wall?
                // This uses AABB collision detection
                if (entityBox.right > wallBox.left &&
                    entityBox.left < wallBox.right &&
                    entityBox.bottom > wallBox.top &&
                    entityBox.top < wallBox.bottom) {
                    safe = false;
                    break;
                }
                
                // CHECK 2: Is the entity too close to the wall?
                // Check if buffered box overlaps with wall
                if (bufferedBox.right > wallBox.left &&
                    bufferedBox.left < wallBox.right &&
                    bufferedBox.bottom > wallBox.top &&
                    bufferedBox.top < wallBox.bottom) {
                    safe = false;
                    break;
                }
                
                // CHECK 3: Verify all corner points are NOT in any wall
                const corners = [
                    { x: entityBox.left, y: entityBox.top },       // Top-left
                    { x: entityBox.right, y: entityBox.top },      // Top-right
                    { x: entityBox.left, y: entityBox.bottom },    // Bottom-left
                    { x: entityBox.right, y: entityBox.bottom }    // Bottom-right
                ];
                
                for (let corner of corners) {
                    if (this.isPointInWall(corner.x, corner.y, wall)) {
                        safe = false;
                        break;
                    }
                }
                
                if (!safe) break;
            }
            
            attempts++;
        } while (!safe && attempts < maxAttempts);
        
        // If we couldn't find a safe position, find multiple failsafe options
        if (!safe) {
            console.warn(`[V4] Could not find safe position after ${maxAttempts} attempts`);
            console.warn(`Entity size: ${entitySize}, Min distance: ${minDistance}`);
            
            // Try multiple failsafe positions
            const failsafePositions = [
                { x: 400 - entitySize / 2, y: 300 - entitySize / 2 },  // Center
                { x: 150, y: 150 },                                      // Top-left safe zone
                { x: 650, y: 150 },                                      // Top-right safe zone
                { x: 150, y: 450 },                                      // Bottom-left safe zone
                { x: 650, y: 450 },                                      // Bottom-right safe zone
            ];
            
            // Find first failsafe position that doesn't collide
            for (let failsafe of failsafePositions) {
                let failsafeSafe = true;
                
                for (let wall of walls) {
                    if (this.isColliding(failsafe.x, failsafe.y, entitySize, entitySize, wall)) {
                        failsafeSafe = false;
                        break;
                    }
                }
                
                if (failsafeSafe) {
                    console.warn(`Using failsafe position: (${Math.round(failsafe.x)}, ${Math.round(failsafe.y)})`);
                    return failsafe;
                }
            }
            
            // Last resort: return top-left corner (almost always safe)
            console.error('All failsafe positions blocked! Using emergency position.');
            return { x: 150, y: 150 };
        }
        
        return { x, y };
    }

    getDoorPosition(levelNum) {
        const doorPositions = [
            {x: 720, y: 520}, 
            {x: 720, y: 50}, 
            {x: 50, y: 520}
        ];
        return doorPositions[levelNum % 3];
    }
}
