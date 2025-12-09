# 🚨 QUICK FIX - index.html Not Loading

## Problem
- ✅ simple.html works
- ✅ debug.html works  
- ❌ index.html doesn't show game

## Solution Steps

### 1. Open index.html in browser

### 2. Open Browser Console (F12)

### 3. Look for these exact messages:

**EXPECTED (Working):**
```
Starting Zelda Adventure Game...
Game constructor called
Canvas found: [object HTMLCanvasElement]
Canvas initialized: 800 x 600
All elements found, starting game initialization...
Initializing level 1
Generated 11 walls
Door created at {x: 720, y: 520}
Created 3 enemies
Created 4 collectibles
First frame rendered
Player: Player {x: 60, y: 60, ...}
Enemies: 3
Collectibles: 4
Walls: 11
Level initialized, starting game loop...
Game instance created successfully: Game {...}
```

### 4. What you're likely seeing:

**Scenario A: No console output at all**
→ Module not loading

**Scenario B: Console shows errors**
→ Check what error says

**Scenario C: Console shows initialization but no render**
→ Game loop not starting

---

## Diagnostic Tools (In Order)

### Test 1: Open diagnose.html
Click "Run Full Diagnostic"
- See what fails

### Test 2: Manual Check
Open index.html console and type:
```javascript
// Check if game exists
window.game

// Try to manually create
document.getElementById('gameCanvas')

// Check module loaded
import('./config.js').then(c => console.log(c))
```

---

## Most Likely Issues & Fixes

### Issue: "Game instance created successfully" but black canvas

**Problem**: Game loop starting but draw not working

**Fix**: Check if these exist:
```javascript
// In console on index.html:
window.game.player  // Should show Player object
window.game.walls   // Should show array of walls
window.game.ctx     // Should show CanvasRenderingContext2D
```

**If undefined**, the constructor failed partway through.

---

### Issue: No console output at all

**Problem**: Module script not loading

**Check index.html has:**
```html
<script type="module" src="game.js"></script>
```

**Not:**
```html
<script src="game.js"></script>
```

---

### Issue: "Canvas element not found!"

**Problem**: HTML elements missing

**Fix**: Verify index.html has:
```html
<canvas id="gameCanvas" width="800" height="600"></canvas>
```

---

### Issue: Module import errors

**Problem**: Not using HTTP server

**Must use one of:**
```bash
python3 -m http.server 8000
# or
python -m SimpleHTTPServer 8000
# or
npx serve
```

**Cannot use:** `file:///path/to/index.html`

---

## Emergency Fix: Force Render

If game creates but doesn't show, try this in console:

```javascript
// Force one frame render
if (window.game) {
    window.game.draw();
    console.log('Forced draw');
}

// Check canvas
const ctx = document.getElementById('gameCanvas').getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);
console.log('Manual draw test');
```

If red square appears → Canvas works, game.draw() has issue
If nothing → Canvas context broken

---

## Debug Commands for Console

### Check game state:
```javascript
window.game.player
window.game.enemies
window.game.walls
window.game.collectibles
```

### Force update once:
```javascript
window.game.update()
window.game.draw()
```

### Check if loop is running:
```javascript
let count = 0;
const old = window.game.draw.bind(window.game);
window.game.draw = function() {
    count++;
    console.log('Draw call #' + count);
    old();
}
```

### Check canvas:
```javascript
const canvas = document.getElementById('gameCanvas');
console.log('Canvas:', canvas);
console.log('Context:', canvas.getContext('2d'));
console.log('Size:', canvas.width, 'x', canvas.height);
```

---

## What to Report

If still not working, provide:

1. **Browser + Version**
   - Chrome 120? Firefox 100?

2. **Exact Console Output**
   - Copy/paste everything in console

3. **diagnose.html Results**
   - Which checks fail?

4. **These commands:**
```javascript
// Run in console on index.html:
console.log('Game:', window.game);
console.log('Canvas:', document.getElementById('gameCanvas'));
console.log('Context:', document.getElementById('gameCanvas')?.getContext('2d'));
```

---

## Common Working Solutions

### Solution 1: Clear browser cache
- Ctrl+Shift+Delete
- Clear all cache
- Reload page

### Solution 2: Try different browser
- Chrome usually works best
- Firefox also good
- Safari can be finicky with modules

### Solution 3: Check file encoding
- Ensure all .js files are UTF-8
- No BOM (Byte Order Mark)
- Unix line endings (LF not CRLF)

### Solution 4: Re-download files
- Sometimes file corruption
- Re-download all .js files
- Verify file sizes match

---

## File Sizes (Approximate)

If files are much smaller, they might be corrupted:

```
game.js          ~15 KB
Player.js        ~7 KB  
Enemy.js         ~5 KB
LevelGenerator.js ~7 KB
config.js        ~1 KB
Collectible.js   ~3 KB
Door.js          ~5 KB
```

---

## Still Not Working?

1. Open **simple.html** - verify canvas works
2. Open **debug.html** - verify modules load
3. Open **diagnose.html** - run full diagnostic
4. Open **index.html** - check console output
5. Report findings with above info

The game IS working in simple.html, so the code logic is fine.
The modules ARE loading in debug.html, so imports work.
The issue is specific to how index.html initializes the game.

**Most likely**: Timing issue with DOMContentLoaded and module loading.
