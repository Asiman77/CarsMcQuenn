# AI Development Diary — World Tour Rush

## 🤖 Used AI Tools & Justification
For this project, I used **Gemini (Free Version)** as my primary AI development collaborator.
- **Why?** It complies fully with the course guidelines of using free-tier tools. It provided solid guidance on vanilla DOM architecture, CSS grid/flexbox structuring, and helped me resolve logical scope conflicts during the state updates without resorting to complex canvas engines.

---

## 🛠️ Error Log & Resolution Entries

### 1. [25 May 2026] - DOM Element Reference Before Load
**What I asked the AI:**
"Provide the initial script setup to link keyboard events to the `#player` car div."

**What it gave me:**
A script that tried to fetch `document.getElementById('player')` globally at the top of the file and modify its styles immediately.

**What was wrong:**
The script was loading in the HTML `<head>` tag. Because the HTML DOM structure wasn't fully parsed yet, `getElementById` returned `null`, causing an immediate crash: *TypeError: Cannot read properties of null (reading 'style')*.

**How I fixed it:**
I wrapped the initial configuration setup inside a `window.onload` event listener and moved the DOM lookups directly inside the execution triggers to ensure elements exist before modification.

**Time lost:** ~20 minutes

---

### 2. [26 May 2026] - Accumulating Ghost DOM Elements on Restart
**What I asked the AI:**
"How can I build a page-reset logic inside `startGame()` so the player can restart by clicking RETRY without refreshing the window?"

**What it gave me:**
A function that reset `gameState.score = 0` and called `requestAnimationFrame(gameLoop)`.

**What was wrong:**
While the state variables cleared properly, the actual physical `.enemy` elements left over from the previous game session remained frozen on the screen. When the new loop triggered, new enemies overlapping the old ones spawned, breaking the gameplay layout.

**How I fixed it:**
I added a clearing loop right at the beginning of the `startGame()` cycle using `document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());` to wipe the graphical board clean before rendering new nodes.

**Time lost:** ~25 minutes

---

### 3. [26 May 2026] - Disproportional Box Collisions after Visual CSS Adjustments
**What I asked the AI:**
"I want to scale down the cars slightly in CSS to make the grid look sleeker. Update the dimensions."

**What it gave me:**
The exact CSS rules to minimize the car dimensions from `60px/100px` down to `55px/95px`.

**What was wrong:**
The visual layout adapted perfectly, but the collision system in JavaScript still checked for the old hardcoded width and height bounds (`60` and `100`). This resulted in "ghost collisions" where the player would trigger a Game Over despite visually passing right next to an enemy.

**How I fixed it:**
I audited the `player` state object parameters and synced the analytical bounding boxes precisely to match the updated layout math: `width: 55` and `height: 95`.

**Time lost:** ~30 minutes

---

### 4. [27 May 2026] - Autoplay Blocked Policy on Native Audio Trigger
**What I asked the AI:**
"Write a function using the standard Web Audio API to instantly trigger the regional anthem when the player chooses a car."

**What it gave me:**
A direct `audio.play()` execution mapped directly inside the programmatic selection transition.

**What was wrong:**
Modern web browsers strictly block any programmatically generated audio loops that fire automatically before a conscious user gesture is captured on the window grid. The console threw a *NotAllowedError: play() failed because the user didn't interact with the document first*.

**How I fixed it:**
I modified the game kickoff architecture so the media player initialization only runs safely inside the `startGame()` trigger event, ensuring a legitimate click handler unlocks the media stream.

**Time lost:** ~15 minutes

---

### 5. [27 May 2026] - Concurrent Multi-Stream Audio Glitch during Retries
**What I asked the AI:**
"Make the anthem loop infinitely and ensure it triggers cleanly on retry."

**What it gave me:**
`gameState.currentAnthem = new Audio(...)` inside the startup scope.

**What was wrong:**
Every time I lost a game session and hit the **RETRY** action button, a brand new `Audio` stream instance initialized without cleaning up the previous allocation. Multiple instances of the same anthem played simultaneously out of phase, creating an echoing noise glitch.

**How I fixed it:**
I integrated a structural safety check within `playAnthem()`. Before deploying a new sound stream, I explicitly fire `gameState.currentAnthem.pause()` and reset its execution cursor timeline to `0`.

**Time lost:** ~20 minutes