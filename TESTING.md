# Testing Checklist

## What Was Fixed

### 🔴 Critical Issues (NOW FIXED)
1. ✅ **game.js was empty** - Now contains complete game logic (14KB)
2. ✅ **Module loading error** - HTML now uses `type="module"`
3. ✅ **Player.js corrupted** - Rewritten with full Player class
4. ✅ **Enemy.js corrupted** - Rewritten with full Enemy class
5. ✅ **Missing imports** - All modules properly import dependencies

## How to Test

### 1. Setup
```bash
# Navigate to game directory
cd zelda-game_[timestamp]

# Start a local server (choose one):
python -m http.server 8000
# OR
python3 -m http.server 8000
# OR
npx serve
```

### 2. Open Browser
- Navigate to: `http://localhost:8000`
- Open browser console (F12)

### 3. Expected Console Output
```
Starting Zelda Adventure Game...
Initializing level 1
Generated 11 walls
Door created at {x: 720, y: 520}
Created 3 enemies
Created 4 collectibles
```

### 4. Test Game Features

#### Level Loading ✅
- [ ] Game world appears (dark floor with grid pattern)
- [ ] Walls are visible (stone texture)
- [ ] Player appears at top-left (green character)
- [ ] Enemies spawn (orange/red/blue)
- [ ] Collectibles appear (green rupees, golden keys)
- [ ] Door appears in corner (locked/grey)

#### Player Controls ✅
- [ ] Arrow keys move player
- [ ] Player cannot walk through walls
- [ ] Space bar shows sword attack
- [ ] Player animates when moving

#### Combat System ✅
- [ ] Attacking enemies damages them
- [ ] Enemy death creates particles
- [ ] Score increases on enemy kill
- [ ] Enemies can damage player
- [ ] Player flickers when invulnerable
- [ ] Hearts decrease on damage

#### Collectibles ✅
- [ ] Rupees collected increase score (+10)
- [ ] Keys collected increase score (+50)
- [ ] Collectibles bob up and down
- [ ] Collection creates particle effects
- [ ] Items counter updates

#### Door System ✅
- [ ] Door starts locked (grey)
- [ ] Door unlocks when all items collected (green glow)
- [ ] Entering door completes level
- [ ] Level complete modal appears
- [ ] Next level button works

#### Level Progression ✅
- [ ] Level number increases
- [ ] More enemies spawn
- [ ] More collectibles appear
- [ ] Walls become more complex
- [ ] Player speed increases
- [ ] Hearts restore on level up

#### Game Over ✅
- [ ] Losing all hearts shows game over
- [ ] Final score displayed
- [ ] Try again button reloads game

## Common Issues

### If nothing appears:
1. Check browser console for errors
2. Ensure using http:// not file://
3. Check all .js files exist
4. Verify index.html has `type="module"`

### If world is blank:
1. Check console for "Initializing level X"
2. Verify canvas element exists
3. Check CONFIG values are loaded

### If player can't move:
1. Check keyboard event listeners
2. Verify Player.js is loaded
3. Test in different browser

## Module Dependencies

```
game.js (Main)
├── config.js
├── Player.js ───→ config.js
├── Enemy.js ────→ config.js
├── Collectible.js
├── Door.js
└── LevelGenerator.js ───→ config.js
```

All modules use ES6 syntax:
- `export class ClassName`
- `export const CONFIG`
- `import { ... } from './file.js'`

## Performance Notes

- Game runs at 60 FPS (requestAnimationFrame)
- Canvas size: 800x600px
- Particle effects are optimized (max life 30 frames)
- Shadow blur reduced for performance
