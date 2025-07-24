import { createCupid, cupids } from "./cupids.js"
import { gameArea } from "./game.js"

export async function stage1(){
    let wait = false
    spawnSwarm(5, createCupid, 5, 200)
    await waitForCondition(() => cupids.length == 0)

    wait = true
    setTimeout(() => {wait = false; spawnSwarm(10, createCupid, 5, 500)}, 1000)
    await waitForCondition(() => cupids.length == 0 && !wait)

    wait = true
    setTimeout(() => {wait = false; spawnSwarm(20, createCupid, 10, 400)}, 1000)
    await waitForCondition(() => cupids.length == 0 && !wait)

    wait = true
    setTimeout(() => {wait = false; spawnSwarm(40, createCupid, 20, 300)}, 1000)
    await waitForCondition(() => cupids.length == 0 && !wait)

    wait = true
    setTimeout(() => {wait = false; spawnSwarm(80, createCupid, 25, 200)}, 3000)
    await waitForCondition(() => cupids.length == 0 && !wait)

    wait = true
    setTimeout(() => {wait = false; spawnSwarm(160, createCupid, 35, 100)}, 4000)
    await waitForCondition(() => cupids.length == 0 && !wait)
}


export function spawnSwarm(count, spawnUnitFunc, maxInRow = 10, squeezValue = 0) {
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
            spawnUnitFunc(startX + x * (endX - startX) / (maxInRow-1), -downOffset + gameArea.offsetWidth - (yi * ySeparation), unitIndex)
            unitIndex++
        }
    }

    for (let x = 0; x < leftOver; x++) { 
        spawnUnitFunc(startX + x * (endX - startX) / (leftOver-1), -downOffset + gameArea.offsetWidth - (exactRows * ySeparation), unitIndex)
        unitIndex++
    }
}

export function spawner(x, y, unit, interval){
    
}





// Helper to wait for a condition to become true
function waitForCondition(conditionFn, checkInterval = 100) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (conditionFn()) {
                clearInterval(interval);
                resolve();
            }
        }, checkInterval);
    });
}