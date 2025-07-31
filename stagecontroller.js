import { spawnCicada } from "./cicadas.js"
import { spawnTurtle } from "./turtles.js"
import { createCupid, cupids } from "./cupids.js"
import { createGhost, ghosts } from "./ghosts.js"
import { createVendingStatic } from "./vending.js"
import { gameState } from "./game.js"
import { audioManager } from "./audio.js"
// import {  } from "./game.js"

const gameArea = document.getElementById('game-area')

export async function stage1() {
    createVendingStatic()
    console.log("1")
    await spawnSwarm(50, createGhost, 20, 200, ghosts)
    audioManager.playSample("swarm")
    console.log("2")
    await sleep(1000)
    
    console.log("3")
    const turt1 = addEvent(() => startSpawner("left", 0, 0, spawnTurtle), 500)
    console.log("4")
    const turt2 = addEvent(() => startSpawner("right", 0, 0, spawnTurtle), 433)
    
    await spawnSwarm(10, createCupid, 5, 500, cupids)
    audioManager.playSample("swarm")
    await sleep(1000)
    
    const turt3 = addEvent(() => startSpawner("topleft", 0, 0, spawnTurtle), 422)
    const turt4 = addEvent(() => startSpawner("topright", 0, 0, spawnTurtle), 366)
    await spawnSwarm(20, createCupid, 10, 400, cupids)
    audioManager.playSample("swarm")
    removeEvent(turt1)
    removeEvent(turt2)
    removeEvent(turt3)
    removeEvent(turt4)
    await sleep(1000)

    const c1 = addEvent(() => startSpawner("left", 0, 0, spawnCicada), 350)
    const c2 = addEvent(() => startSpawner("right", 0, 0, spawnCicada), 433)
    await spawnSwarm(40, createCupid, 20, 300, cupids)
    audioManager.playSample("swarm")
    await sleep(1000)

    const c3 = addEvent(() => startSpawner("topleft", 0, 0, spawnCicada), 220)
    const c4 = addEvent(() => startSpawner("topright", 0, 0, spawnCicada), 333)
    await spawnSwarm(80, createCupid, 25, 200, cupids)
    audioManager.playSample("swarm")
    await sleep(3000)

    const c5 = addEvent(() => startSpawner("left", 0, 0, spawnCicada), 20)
    const c6 = addEvent(() => startSpawner("right", 0, 0, spawnCicada), 20)
    const c7 = addEvent(() => startSpawner("topleft", 0, 0, spawnCicada), 20)
    const c8 = addEvent(() => startSpawner("topright", 0, 0, spawnCicada), 20)
    await sleep(1000)

    await spawnSwarm(160, createCupid, 35, 100, cupids)
    audioManager.playSample("swarm")
    await sleep(1000)
}


async function spawnSwarm(count, spawnUnitFunc, maxInRow = 10, squeezValue = 0, array) {
    const rows = count / maxInRow
    const leftOver = (rows - parseInt(rows)) * maxInRow
    const exactRows = parseInt(rows)
    const ySeparation = 90
    let unitIndex = 0

    const startX = 100 + squeezValue
    const endX = gameArea.offsetWidth - 200 - squeezValue
    const downOffset = 900

    for (let yi = 0; yi < exactRows; yi++) {
        for (let x = 0; x < maxInRow; x++) {
            spawnUnitFunc(startX + x * (endX - startX) / (maxInRow - 1), -downOffset + gameArea.offsetWidth - (yi * ySeparation), unitIndex)
            unitIndex++
        }
    }

    for (let x = 0; x < leftOver; x++) {
        spawnUnitFunc(startX + x * (endX - startX) / (leftOver - 1), -downOffset + gameArea.offsetWidth - (exactRows * ySeparation), unitIndex)
        unitIndex++
    }
    await waitForCondition(() => { return array.length == 0 })
}


async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
}


// Array to hold scheduled events
const eventQueue = [];
let nextId = 0;
function addEvent(fn, interval) {
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


function removeEvent(id) {
    for (let i = 0; i < eventQueue.length; i++) {
        if (eventQueue[i].id === id) {
            eventQueue.splice(i, 1);
            return true;
        }
    }
    return false;
}





function startSpawner(position, x, y, spawnUnitFunc, count = 1) {
    if (spawnPositions.hasOwnProperty(position)) {
        x = spawnPositions[position].x
        y = spawnPositions[position].y
    }

    for (let i = 0; i < count; i++) {
        spawnUnitFunc(x, y)
        sleep(60)
    }
}



// Helper to wait for a condition to become true
function waitForCondition(conditionFn, checkInterval = 200) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (conditionFn()) {
                clearInterval(interval);
                resolve();
            }
        }, checkInterval);
    });
}



