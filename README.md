# World Tour Rush (CarsMcQuenn Edition) 🏎️💨

An interactive, cultural arcade car-dodging game built entirely using native frontend components: **HTML5, CSS3, and Vanilla JavaScript**.

This project was developed strictly adhering to the **KISS (Keep It Super Simple)** design principle, avoiding any external libraries, frameworks, or Canvas API engines, relying purely on native DOM Manipulation and CSS positioning.

---

## 🔗 Live Links & Project Assets
- **Live Game (GitHub Pages):** [👉 Click Here to Play the Game](https://YOUR_GITHUB_USERNAME.github.io/CarsMcQuenn/) *(Replace with your actual GitHub Pages link)*
- **AI Development History Gündəliyi:** [View AI_DIARY.md](AI_DIARY.md)

---

## 📸 Architectural Blueprint & Planning Sketch
Before writing a single line of execution logic, the game canvas structure and side panel viewports were mapped out dynamically using Excalidraw.

### Excalidraw Sketch Map:
![Excalidraw Layout Blueprint](assets/image_74fd81.jpg)

---

## 🎮 Game Description & List of Entities

### Description:
In **World Tour Rush**, players select a specific cultural country/region (Azerbaijan, Catalonia, Basque Country, or Spain) to begin a rapid highway tour. As the game boots up, the chosen country's local national anthem plays dynamically in the background. The objective is to survive on a strict 3-lane highway system while incoming rival vehicles rush down the track. As your survival score increments, the geographical location shifts through iconic local cities, updating sideboards with real-time cultural landmarks and historical architectural signs.

### Game Entities:
1. **Player Entity (`.car`):** A custom-designed car object whose behavior (visual skin, capot outlines, and front/rear window trims) adapts based on selection:
    - *Azerbaijan:* The legendary square-profile **Lada 2107**.
    - *Spain:* The aerodynamic **Seat Ibiza** hatchback.
    - *Catalonia:* The sleek **Seat Leon**.
    - *Basque Country:* The durable **VW Golf**.
2. **Enemy Entity (`.enemy`):** Randomized oncoming rival cars spawned outside the upper view frame, moving downward. They wear inverted rotation coordinates so their headlight beams face the player.
3. **Scenery Sidebars (`.scenery-side`):** Dual static lateral informational tracking boards that hold custom signposts, reactive vector region flags, and real-time landmark nodes.
4. **HUD Overlay (`#hud`):** The primary real-time scoring data display node.

---

## 🕹️ How to Play

### Objectives:
- Avoid crashing into oncoming traffic for as long as possible.
- Earn **+10 points** for every rival vehicle you successfully pass.
- Progress through all 5 local cities per region. The game speed scales up dynamically every 50 points!

### Game Controls:
| Key | Action |
| :--- | :--- |
| `⬅️ ArrowLeft` | Shift car one lane to the left smoothly. |
| `➡️ ArrowRight` | Shift car one lane to the right smoothly. |
| `Mouse Click` | Interface navigation (Car selection, START, and RETRY actions). |

### Win / Lose Conditions:
- **Win Condition:** Endless arcade mechanics. The goal is to achieve the highest possible score and register it into local persistence memory.
- **Lose Condition:** Any structural intersection of bounding boxes (Player vs. Enemy) instantly terminates the game loop cycle, stops the audio stream, and triggers the Game Over overlay.

---

## 🧠 Architectural & Technical Decisions

### Functional Approach vs. OOP
This project was implemented using a **Functional Approach** combined with centralized **State Management** instead of Object-Oriented Programming (OOP) classes.

**Why?**
1. **Single Source of Truth:** All vital parameters (game states, coordinates, scores, active arrays) are encapsulated inside a single global `gameState` object. This makes tracking, debugging, and pausing the system state trivial.
2. **Performance on DOM Elements:** Since this game runs entirely on HTML DOM manipulations rather than a Canvas rendering loop, treating entities as pure objects inside functions like `spawnEnemy()` and `moveEnemies()` reduces garbage collection strain.
3. **Readability & Academic Transparency:** Functual decomposition separates computational updates (`checkCollisions`) from direct graphical outputs (`updatePlayerPosition`), ensuring the code base follows a clear structure that is easy to audit.

---

## 🐛 Known Bugs & Future Enhancements

While the game is fully operational and production-ready, the following items have been logged for future updates:

1. **Autoplay Browser Restriction:** - *Issue:* Modern web browsers block audio rendering before an initial interaction.
    - *Fix applied:* Integrated the audio trigger strictly into the `START GAME` user button gesture handler.
2. **Responsive Aspect Ratio Scaling:**
    - *Limitation:* The viewport is highly optimized for a desktop grid centered via Flexbox. Playing on narrow mobile layouts might truncate the sidebar viewports.
    - *Next Step:* Implement advanced CSS media query breakouts to rearrange the sidebars into a top/bottom HUD layout for portable screens.
3. **Visual Asset Enhancements:**
    - *Next Step:* Transition the pure CSS-gradient vector skins into high-definition actual PNG sprite-sheets with transparent backgrounds for realistic wheel rotations and exhaust smoke animations.