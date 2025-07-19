import * as utils from './utils.js'

export let walkables = []

export const ground = {
    body: [utils.createRect(-5000, -970, 10000, 1000)]
}

export const platformTest = {
    body: [utils.createRect(100, 100, 100, 100)]
}

export const platformTest2 = {
    body: [utils.createRect(700, 100, 200, 210)]
}



export const platform1 = {
    body: [utils.createRect(200, 100, 150, 30)]
}

export const platform2 = {
    body: [utils.createRect(300, 200, 200, 30)]
}

export const platform3 = {
    body: [utils.createRect(560, 300, 80, 30)]
}

export const platform4 = {
    body: [utils.createRect(820, 400, 120, 30)]
}

export const platform5 = {
    body: [utils.createRect(1150, 500, 150, 30)]
}


//
walkables.push(ground)
walkables.push(platform1)
walkables.push(platform2)
walkables.push(platform3)
walkables.push(platform4)
walkables.push(platform5)
walkables.push(platformTest)
walkables.push(platformTest2)
