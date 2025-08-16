import { spawnCicada } from "./cicadas.js"
import { spawnTurtle } from "./turtles.js"
import { createCupid } from "./cupids.js"
import { createVending } from "./vending.js"
import { gameState, updateMenuVisibility } from "./game.js"
import { createFlower } from "./flowers.js"
import { createTetro } from "./tetros.js"
import { createGhost } from "./ghosts.js"
import { marioStopFiring, updateMarioHealthBar } from "./mario.js"
import { createUnicorn } from "./unicorn.js"

let gameArea = document.getElementById('game-area')

const spawnerFlags = new Map();
const activeSpawners = new Set();

export async function stage1(gameGen) {
    //freshing up variables:  ==============================
    gameArea = document.getElementById('game-area')
    spawnPositions = {
        left: { x: -50, y: 50 },
        topleft: { x: -50, y: 350 },
        right: { x: gameArea.offsetWidth + 50, y: 50 },
        topright: { x: gameArea.offsetWidth + 50, y: 350 },
    }
    //======================================================

    await spawnSwarm(10, createCupid, 5, 200, gameState.cupids, 100, 0, 4000);
    if (abortStage(gameGen)) return;

    await spawnSwarm(10, createGhost, 10, 200, gameState.ghosts, 100, 0, 4000);
    if (abortStage(gameGen)) return;


    let tLeft  = startSpawner('left', 0, 0, spawnTurtle, -1, 5*60);
    let tRight = startSpawner('right',0, 0, spawnTurtle, -1, 6*60);

    await spawnSwarm(16, createCupid, 4, 200, gameState.cupids, 100, 0, 4000);
    if (abortStage(gameGen)) {
        stopSpawner(tLeft)
        stopSpawner(tRight)
        return
    }

    let u = async () => {await sleep(4000); createUnicorn(-100, gameArea.offsetHeight / 2);}; u();

    await spawnSwarm(15, createGhost, 15, 200, gameState.ghosts, 100, 0, 4000);
    if (abortStage(gameGen)) return;

    removeAllEvents()
    stopSpawner(tLeft)
    stopSpawner(tRight)
    marioStopFiring();
    gameState.level++
    gameState.currentState = 'cinematic'
    gameState.mapLoaded = false
}


export async function stage2(gameGen) {
    

    createVending();

    await spawnSwarm(20, createTetro, 5, 200, gameState.tetros, 400, 1700, 4000);
    if (abortStage(gameGen)) return;

    let cLeft = startSpawner("left", 0, 0, spawnCicada, -1, 6 * 60);
    let cRight = startSpawner("right", 0, 0, spawnCicada, -1, 9 * 60);

    await spawnSwarm(16, createCupid, 4, 350, gameState.cupids, 100, 0, 4000);
    if (abortStage(gameGen)){ 
        stopSpawner(cLeft)
        stopSpawner(cRight)
        return;
    }
    let u = async () => {await sleep(6000); createUnicorn(-100, gameArea.offsetHeight / 2);}; u();

    await spawnSwarm(20, createGhost, 15, 200, gameState.ghosts, 100, 0, 4000);
    if (abortStage(gameGen)) return;

    

    removeAllEvents()

    let cTopRight = startSpawner("topleft", 0, 0, spawnCicada, -1, 12 * 60);
    let cTopLeft = startSpawner("topright", 0, 0, spawnCicada, -1, 8 * 60);
    let tLeft = startSpawner("left", 0, 0, spawnTurtle, -1, 7 * 60);
    let tRight = startSpawner("right", 0, 0, spawnTurtle, -1, 13 * 60);
    
    
    await spawnSwarm(30, createTetro, 6, 200, gameState.tetros, 400, 2000, 4000);
    if (abortStage(gameGen)) {
        stopSpawner(cTopLeft)
        stopSpawner(cTopRight)
        stopSpawner(tLeft)
        stopSpawner(tRight)
        return
    };

    removeAllEvents()
    stopSpawner(cLeft)
    stopSpawner(cRight)
    stopSpawner(cTopLeft)
    stopSpawner(cTopRight)
    stopSpawner(tLeft)
    stopSpawner(tRight)
    marioStopFiring();
    gameState.level++
    gameState.currentState = 'cinematic'
    updateMenuVisibility();
    gameState.mapLoaded = false
}




export async function stage3(gameGen) {
    const vending = createVending();

    await spawnSwarm(15, createFlower, 5, 200, gameState.flowers, 50, 0, 3000);
    if (abortStage(gameGen)) return;

    addEvent(() => startSpawner("topleft", 0, 0, spawnCicada, 1), 6 * 60);
    addEvent(() => startSpawner("topright", 0, 0, spawnCicada, 1), 6 * 60);

    let u = async () => {await sleep(6000); createUnicorn(-100, gameArea.offsetHeight / 2);}; u();

    await spawnSwarm(16, createCupid, 4, 350, gameState.cupids, 100, 0, 4000);
    if (abortStage(gameGen)) return;

    removeAllEvents()

    let cTopLeft1 = startSpawner("topleft", 0, 0, spawnTurtle, -1, 6 * 60);
    let cTopRight1 = startSpawner("topright", 0, 0, spawnTurtle, -1, 6 * 60);

    await spawnSwarm(20, createTetro, 5, 200, gameState.tetros, 400, 1700, 4000);
    if (abortStage(gameGen)) {
        stopSpawner(cTopLeft1)
        stopSpawner(cTopRight1)
        return};
    removeAllEvents()

    let cTopLeft2 = startSpawner("topleft", 0, 0, spawnCicada, -1, 8 * 60);
    let cTopRight2 = startSpawner("topright", 0, 0, spawnCicada, -1, 9 * 60);
    let tLeft = startSpawner("left", 0, 0, spawnTurtle, -1, 10 * 60);
    let tRight = startSpawner("right", 0, 0, spawnTurtle, -1, 11 * 60);

    await spawnSwarm(20, createGhost, 15, 200, gameState.ghosts, 100, 0, 4000);
    if (abortStage(gameGen)) {
        stopSpawner(cTopLeft2)
        stopSpawner(cTopRight2)
        stopSpawner(tLeft)
        stopSpawner(tRight)    
        return
    };

    await spawnSwarm(30, createFlower, 5, 200, gameState.flowers, 50, 0, 3000);
    if (abortStage(gameGen)) return;

    vending.state = 'badMother'

    await waitForCondition(() => !gameState.allEntities.includes(vending), 2500);

    stopSpawner(cTopLeft1)
    stopSpawner(cTopRight1)
    stopSpawner(cTopLeft2)
    stopSpawner(cTopRight2)
    stopSpawner(tLeft)
    stopSpawner(tRight)    
    marioStopFiring();
    gameState.level++
    gameState.currentState = 'cinematic'
    updateMenuVisibility();
    gameState.mapLoaded = false

}





function abortStage(gameGen) {
    if (gameGen !== gameState.currentGameGen) {
        stopAllSpawners();
        removeAllEvents();
        console.log("abort!")
        return true
    }
    console.log("don't abort!")
}

async function spawnSwarm(count, spawnUnitFunc, maxInRow = 10, squeezValue = 0, array, ySeparation = 90, yoffset = 0, delay = 0) {
    const rows = count / maxInRow
    const leftOver = (rows - parseInt(rows)) * maxInRow
    const exactRows = parseInt(rows)
    let unitIndex = 0

    const startX = 100 + squeezValue
    const endX = gameArea.offsetWidth - 200 - squeezValue
    const downOffset = 900 - yoffset

    for (let yi = 0; yi < exactRows; yi++) {
        for (let x = 0; x < maxInRow; x++) {
            spawnUnitFunc(startX + x * (endX - startX) / (maxInRow - 1), -downOffset + gameArea.offsetWidth - (yi * ySeparation), unitIndex, yi)
            unitIndex++
        }
    }

    for (let x = 0; x < leftOver; x++) {
        spawnUnitFunc(startX + x * (endX - startX) / (leftOver - 1), -downOffset + gameArea.offsetWidth - (exactRows * ySeparation), unitIndex, exactRows)
        unitIndex++
    }
    await waitForCondition(() => array.length == 0, delay);
}


async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
}


// Array to hold scheduled events
export const eventQueue = [];
let nextId = 0;
export function addEvent(fn, interval) {
    if (typeof fn !== 'function' || typeof interval !== 'number') {
        throw new Error('Invalid arguments: must pass a function and an interval.');
    }
    const id = `event-${nextId++}`;
    const event = {
        fn,
        maxTimer: interval,
        currentTimer: interval,
        id
    };
    eventQueue.push(event);
    return id;
}


let spawnPositions = {
    left: { x: 5, y: 50 },
    topleft: { x: 5, y: 700 },
    right: { x: gameArea.offsetWidth -5, y: 50 },
    topright: { x: gameArea.offsetWidth -5, y: 700 },
}


//this is called once per frame at game's update function, it will be used to handle timers in stage Controller so that when the game is paused, the timers here pause too
export function stageControllerTicker() {
    for (let i = 0; i < eventQueue.length; i++) {
        const event = eventQueue[i];

        // Reset the current timer to max
        if (event.currentTimer <= 0) {
            event.currentTimer = event.maxTimer;

            event.fn(); // Execute the function
        }
        event.currentTimer--
    }
}

export function removeAllEvents() {
    eventQueue.length = 0
}

export function removeEvent(id) {
    for (let i = 0; i < eventQueue.length; i++) {
        if (eventQueue[i].id === id) {
            eventQueue.splice(i, 1);
            return true;
        }
    }
    return false;
}


export function startSpawner(  position, x, y, spawnUnitFunc, count = -1, intervalFrames = 60, bindToGameGen = gameState.currentGameGen
) {
  
  if (position && typeof position === 'string' && spawnPositions && position in spawnPositions) {
    const pos = spawnPositions[position];
    x = typeof pos.x === 'function' ? pos.x() : pos.x;
    y = pos.y;
  }

  const id = `sp-${Date.now()}-${Math.random()}`;
  spawnerFlags.set(id, true);
  activeSpawners.add(id);

  (async () => {
    for (let i = 0; count < 0 || i < count; i++) {
      // hard stop requested?
      if (!spawnerFlags.get(id)) break;
      // auto-stop if a restart/level changed the generation
      if (bindToGameGen !== gameState.currentGameGen) break;

      spawnUnitFunc(x, y);
      await sleep(intervalFrames * (1000 / 60));
    }
    spawnerFlags.delete(id);
    activeSpawners.delete(id);
  })();

  return id;
}

export function stopSpawner(id) {
  spawnerFlags.set(id, false);
}


export function stopAllSpawners() {
  for (const id of activeSpawners) spawnerFlags.set(id, false);
  spawnerFlags.clear();
  activeSpawners.clear();
}
// Helper to wait for a condition to become true
function waitForCondition(conditionFn, checkInterval = 200, delay = 0) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (conditionFn()) {
                clearInterval(interval);
                setTimeout(resolve, delay);
            }
        }, checkInterval);
    });
}



