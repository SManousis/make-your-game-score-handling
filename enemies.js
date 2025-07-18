import * as utils from "./utils.js";
export let cupid = {
    health: 100,
    damage: 10,
    moveSpeed: 2,
    x: 0,
    y: 0,
    bullet_count: 1,
    aimDirection: "down",
    state: "airborne",
    velX: 2,
    velY: 0,
    body: [utils.createCircle(0, 600 + 25, 10), utils.createCircle(0, 600 + 50 + 25, 25)],
    updateFunc: cupidUpdate,
    drawFunc: cupidVisuals
}

let cupidBody = document.getElementById("cupid-body")
let  parallelmovecount = 0

export function cupidUpdate() {
    utils.moveUnit(cupid, cupid.velX, 0)
    parallelmovecount++
    if (parallelmovecount === 600) {
        cupid.velY = 3
        parallelmovecount = 0
        utils.moveUnit(cupid, 0, cupid.velY)
    }
    if (parallelmovecount % 50 === 0) {
        cupid.velX = -cupid.velX
        utils.moveUnit(cupid, cupid.velX, 0)
    }
}
export function cupidVisuals() {
    cupidBody.style.opacity = "100%"
    cupidBody.style.setProperty('--cupid-x', `${-cupid.x}px`);
    cupidBody.style.setProperty('--cupid-y', `${cupid.y}px`);
}



