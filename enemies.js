import * as utils from "./utils.js";
export function createCupid(x, y) {
    let cupidBody = document.createElement("img");
    cupidBody.className = "cupid-img";
    cupidBody.src = "assets/enemies/TrumpCupid.png";
    document.getElementById("game-area").appendChild(cupidBody);
     // store reference in object
    let cupid = {
       health: 100,
       damage: 10,
       moveSpeed: 1,
       x: x,           // use the parameters!
       y: y,
       bullet_count: 1,
       aimDirection: "down",
       state: "airborne",
       velX: 2,
       velY: 0,
       body: [utils.createCircle(x, y + 25, 10), utils.createCircle(x, y + 50 + 25, 25)],
       updateFunc: function() { cupidUpdate(this) },   
       drawFunc: function() { cupidVisuals(this) },
       dom: cupidBody,
       parallelMoveCount: 0,
    }
    return cupid
 }


let  parallelmovecount = 0

export function cupidUpdate(cupid) {
    utils.moveUnit(cupid, cupid.velX, 0)
    cupid.parallelMoveCount++
    if (cupid.parallelMoveCount === 25) {
        cupid.velX = -cupid.velX
        utils.moveUnit(cupid, cupid.velX, 0)
    }
    if (cupid.parallelMoveCount === 50) {
        cupid.velX = -cupid.velX
        cupid.velY = 3
        cupid.parallelMoveCount = 0
        utils.moveUnit(cupid, 0, cupid.velY)
    }
    
}



export function cupidVisuals(cupid) {
    cupid.dom.style.opacity = "100%";
    cupid.dom.style.setProperty('--cupid-x', `${cupid.x}px`);
    cupid.dom.style.setProperty('--cupid-y', `${cupid.y}px`);
}


