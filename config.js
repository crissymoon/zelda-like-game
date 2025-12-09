// Game configuration constants
export const CONFIG = {
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600
    },
    PLAYER: {
        WIDTH: 32,
        HEIGHT: 32,
        SPEED: 4,
        SPEED_INCREMENT_PER_LEVEL: 0.1,
        MAX_SPEED: 6.5,
        INVULNERABLE_TIME: 60,
        ATTACK_COOLDOWN: 30,
        ATTACK_RANGE: 35
    },
    GAME: {
        MAX_HEARTS: 3,
        STARTING_HEARTS: 3,
        HEARTS_RESTORE_ON_LEVEL: 1
    },
    BORDER: {
        THICKNESS: 30
    },
    EFFECTS: {
        SHADOW_BLUR: 5,  // Reduced from 15-20
        GLOW_BLUR: 8,    // Reduced from 12-15
        PARTICLE_LIFE: 30
    },
    SCORING: {
        RUPEE: 10,
        KEY: 50,
        ENEMY_KILL: 30,
        TIME_PENALTY: 3,
        BASE_TIME_BONUS: 500
    }
};
