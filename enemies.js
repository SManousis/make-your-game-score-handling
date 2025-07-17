let cupid = {
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
    body: [createCircle(600, 150 + 25, 10), createCircle(600, 0 + 50 + 25, 25)],
    updateFunc: cupidUpdate,
    drawFunc: cupidVisuals
}

let cupidBody = document.getElementById("cupid-body")
let  parallelmovecount = 0
let 
function cupidUpdate() {
    moveUnit(cupid, cupid.velX, 0)
    parallelmovecount++
    if (parallelmovecount === 60) {
        cupid.velY = -3
        parallelmovecount = 0
        moveUnit(cupid, 0, cupid.velY)
    }
    if (parallelmovecount % 20 === 0) {
        cupid.velX = -cupid.velX
        moveUnit(cupid, cupid.velX, 0)
    }
}
function cupidVisuals() {
    cupidBody.style.opacity = "100%"
    cupidBody.style.setProperty('--cupid-x', `${cupid.x}px`);
    cupidBody.style.setProperty('--cupid-y', `${-cupid.y}px`);
}

allEntities.push(cupid)

