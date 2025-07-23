import { gameArea } from './game.js'
import * as utils from './utils.js'

export let walkables = []

export const ground = {
    body: [utils.createRect(-5000, -970, 10000, 1000)]
}



export const left = {
    body: [utils.createRect(450, 150, 200, 25)]
}

export const right = {
    body: [utils.createRect(document.getElementById("game-area").offsetWidth-450-200, 150, 200, 25)]
}

export const topleft = {
    body: [utils.createRect(0, 250, 200, 25)]
}

export const topright = {
    body: [utils.createRect(document.getElementById("game-area").offsetWidth-200, 250, 200, 25)]
}




//
walkables.push(ground)
walkables.push(left)
walkables.push(right)
walkables.push(topleft)
walkables.push(topright)

