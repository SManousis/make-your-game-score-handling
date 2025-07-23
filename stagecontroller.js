import { gameArea } from "./game.js"

let stage1 = []



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