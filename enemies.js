import * as utils from "./utils.js";
import * as mario from './mario.js'
import * as game from './game.js'
import * as bullets from './bullets.js'

let preloadedFiringImage = new Image();
preloadedFiringImage.src = "assets/enemies/TrumpCupidFired.png";

export function createCupid(x, y, index) {
    let cupidBody = document.createElement("img");
    cupidBody.className = "cupid-img";
    cupidBody.src = "assets/enemies/TrumpCupid.png";
    document.getElementById("game-area").appendChild(cupidBody);
     // store reference in object
    
    let cupid = {
       index: index,
       health: 100,
       damage: 10,
       moveSpeed: 0.5,
       x: x,           // use the parameters!
       y: y,       
       bullet_count: 1,
       aimDirection: "down",
       state: "airborne",
       velX: 2,
       velY: 0,
       touched: false,
       rand1: Math.random()*10,
       rand2: Math.random()*10,
       body: [utils.createCircle(x,  y+20, 30)],
       updateFunc: function() { cupidUpdate(this) },   
       drawFunc: function() { cupidVisuals(this) },
       dom: cupidBody,
       parallelMoveCount: 0,
       team: "enemy"
    }
    return cupid
 }


//let  parallelmovecount = 0

export function cupidUpdate(cupid) {
    utils.moveUnit(cupid, cupid.velX, 0)
    cupid.parallelMoveCount++
    if (cupid.parallelMoveCount % 3 === 0){ 
        cupid.moveSpeed === 0 ? cupid.moveSpeed = 1 : cupid.moveSpeed = 0
    }
    if (cupid.parallelMoveCount === 50) {
        cupid.velX = -cupid.velX
        utils.moveUnit(cupid, cupid.velX, 0)
    }
    if (cupid.parallelMoveCount === 100) {
        cupid.velX = -cupid.velX
        cupid.velY = -3
        cupid.parallelMoveCount = 0
        utils.moveUnit(cupid, 0, cupid.velY)
    }


    //if cupid touches mario, become touched
    if (!cupid.touched && utils.IsBodyCollidingWithUnit(cupid.body[0], mario.mario)){
        cupid.touched = true
        cupid.velY = 0
    }

    if (cupid.touched){
        //if cupid is touched, fly up, first slowly and then speed up
        cupid.velY += 0.2
        cupid.velY *= 1.05

        utils.moveUnit(cupid, cupid.rand1-2.5, cupid.velY + cupid.rand2)
    }

    //always move a little bit closer to mario
    utils.moveUnit(cupid, (mario.mario.x - cupid.x)/(500*cupid.rand1), (mario.mario.y - cupid.y)/(500*cupid.rand2))
    
    //decide if cupid will fire
    // if (cupid.index*100 == game.gameState.frameCounter%(game.cupids.length*100)){
    if (parseInt(Math.random()*2000) == 0){
        cupid.dom.src=preloadedFiringImage.src
        let bullet = bullets.createBullet("down", "enemy", cupid.x, cupid.y, 4, 8)
        game.allEntities.push(bullet);
        bullets.allBullets.push(bullet);
        setTimeout(() => {
            cupid.dom.src="assets/enemies/TrumpCupid.png"
        }, 300)   
    }
}



export function cupidVisuals(cupid) {
    cupid.dom.style.opacity = "100%";
    cupid.dom.style.setProperty('--cupid-x', `${cupid.x}px`);
    cupid.dom.style.setProperty('--cupid-y', `${-cupid.y}px`);
}


