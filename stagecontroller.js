import { spawnCicada } from "./cicadas.js"
import { spawnTurtle } from "./turtles.js"
import { createCupid, cupids } from "./cupids.js"
import { createVending } from "./vending.js"
import { gameState,  currentGameGen } from "./game.js"
import { createFlower, flowers } from "./flowers.js"
import { tetros, createTetro } from "./tetros.js"


const gameArea = document.getElementById('game-area')

export async function stage1(gameGen) {
    const vending = createVending();
    vending.state = 'badMother'

    await waitForCondition(() => !gameState.allEntities.includes(vending), 2500);

    // const unicorn = createUnicorn(-100, gameArea.offsetHeight / 2);
    // unicorn.velX = 4;
    // await waitForCondition(() => !gameState.allEntities.includes(unicorn), 3000);
    // if (abortStage(gameGen)) return;

    await spawnSwarm(20, createFlower, 5, 200, flowers, 400, 0, 3000);
    if (abortStage(gameGen)) return;

    

    await spawnSwarm(30, createTetro, 5, 200, tetros, 400, 2300);
    if (abortStage(gameGen)) return;

    await sleep(1000);
    if (abortStage(gameGen)) return;

    const turt1 = addEvent(() => startSpawner("left", 0, 0, spawnTurtle, 1), 500);
    const turt2 = addEvent(() => startSpawner("right", 0, 0, spawnTurtle, 1), 433);

    await spawnSwarm(10, createCupid, 5, 500, cupids);
    if (abortStage(gameGen)) return;

    await sleep(1000);
    if (abortStage(gameGen)) return;

    const turt3 = addEvent(() => startSpawner("topleft", 0, 0, spawnTurtle, 1), 422);
    const turt4 = addEvent(() => startSpawner("topright", 0, 0, spawnTurtle, 1), 366);

    await spawnSwarm(20, createCupid, 10, 400, cupids);
    if (abortStage(gameGen)) return;

    removeEvent(turt1);
    removeEvent(turt2);
    removeEvent(turt3);
    removeEvent(turt4);

    await sleep(1000);
    if (abortStage(gameGen)) return;

    const c1 = addEvent(() => startSpawner("left", 0, 0, spawnCicada, 1), 350);
    const c2 = addEvent(() => startSpawner("right", 0, 0, spawnCicada, 1), 433);

    await spawnSwarm(40, createCupid, 20, 300, cupids);
    if (abortStage(gameGen)) return;

    await sleep(1000);
    if (abortStage(gameGen)) return;

    const c3 = addEvent(() => startSpawner("topleft", 0, 0, spawnCicada, 1), 220);
    const c4 = addEvent(() => startSpawner("topright", 0, 0, spawnCicada, 1), 333);

    await spawnSwarm(80, createCupid, 25, 200, cupids);
    if (abortStage(gameGen)) return;

    await sleep(3000);
    if (abortStage(gameGen)) return;

    const c5 = addEvent(() => startSpawner("left", 0, 0, spawnCicada, 1), 20);
    const c6 = addEvent(() => startSpawner("right", 0, 0, spawnCicada, 1), 20);
    const c7 = addEvent(() => startSpawner("topleft", 0, 0, spawnCicada, 1), 20);
    const c8 = addEvent(() => startSpawner("topright", 0, 0, spawnCicada, 1), 20);

    await sleep(1000);
    if (abortStage(gameGen)) return;

    await spawnSwarm(160, createCupid, 35, 100, cupids);
    if (abortStage(gameGen)) return;

    await sleep(1000);
    if (abortStage(gameGen)) return;
}




export async function stage2(gameGen) {

}




export async function stage3(gameGen) {

}





function abortStage(gameGen) {
    if (gameGen !== currentGameGen) {
        removeAllEvents()
        return true
    }
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


const spawnPositions = {
    left: { x: -50, y: 50 },
    topleft: { x: -50, y: 350 },
    right: { x: gameArea.offsetWidth + 50, y: 50 },
    topright: { x: gameArea.offsetWidth + 50, y: 350 },
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





export function startSpawner(position, x, y, spawnUnitFunc, count = 1) {
    if (spawnPositions.hasOwnProperty(position)) {
        x = spawnPositions[position].x
        y = spawnPositions[position].y
    }

    for (let i = 0; i < count; i++) {
        spawnUnitFunc(x, y);
        sleep(60);
    }
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



