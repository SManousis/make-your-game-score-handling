import { spawnCicada } from "./cicadas.js"
import { createCupid, cupids } from "./cupids.js"
import {  } from "./game.js"

const gameArea = document.getElementById('game-area')

export async function stage1(){
     console.log("start")
    await spawnSwarm(5, createCupid, 5, 200, cupids)
     console.log("bet")
    await sleep(1000)
    console.log("wtf")
    await spawnSwarm(10, createCupid, 5, 500, cupids)
    await sleep(1000)
  
    await spawnSwarm(20, createCupid, 10, 400, cupids)
    await sleep(1000)

    await spawnSwarm(40, createCupid, 20, 300, cupids)
    await sleep(1000)

    await spawnSwarm(80, createCupid, 25, 200, cupids)
    await sleep(1000)

    await spawnSwarm(160, createCupid, 35, 100, cupids)
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
            spawnUnitFunc(startX + x * (endX - startX) / (maxInRow-1), -downOffset + gameArea.offsetWidth - (yi * ySeparation), unitIndex)
            unitIndex++
        }
    }

    for (let x = 0; x < leftOver; x++) { 
        spawnUnitFunc(startX + x * (endX - startX) / (leftOver-1), -downOffset + gameArea.offsetWidth - (exactRows * ySeparation), unitIndex)
        unitIndex++
    }

    console.log(array.length)
    await waitForCondition(() => {console.log("its: ",array.length);return array.length == 0})
}


const spawnPositions = {
    left: {x: -50, y: 0},
    topleft: {x: -50, y: 200},
    right: {x:  gameArea.offsetWidth + 50, y: 0},
    topright: {x:  gameArea.offsetWidth + 50, y: 200},
}

async function sleep(ms){
    await new Promise(r => setTimeout(r, ms));
}


function startSpawner(position, x, y, spawnUnitFunc, milliSecondWait){
    let interval = setInterval(() => {
        if (spawnPositions.hasOwnProperty(position)){
            spawnUnitFunc(spawnPositions[position].x, spawnPositions[position].y)
        }else{
            spawnUnitFunc(x, y)
        }
        
        console.log('spawning')
    }, milliSecondWait)

    return interval
}


function stopSpawner(interval){
    clearInterval(interval)
}


function spawnWave(func, array){
    
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



