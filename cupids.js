import * as utils from "./utils.js";
import * as mario from './mario.js'
import { gameState, updateScore } from './game.js'
import * as bullets from './bullets.js'
import * as powerups from './powerups.js'
import * as walkables from './tilesMap.js'
import { createExplosion } from "./explosion.js";


let preloadedFiringImage = new Image();
preloadedFiringImage.src = "assets/enemies/TrumpCupidFired.svg";


export function createCupid(x, y, index, row) {
    let cupidBody = document.createElement("img");
    cupidBody.className = "cupid-img";
    cupidBody.src = "assets/enemies/TrumpCupid.svg";
    document.getElementById("stage-resources").appendChild(cupidBody);
    // store reference in object

    let cupid = {
        name: "cupid",
        index: index,
        health: 8,
        damage: 10,
        moveSpeed: 0.1,
        x: x,           // use the parameters!
        y: y,
        bullet_count: 1,
        aimDirection: "down",
        state: "airborne",
        velX: 1.2,
        velY: 0,
        kamikazeSpeed: 8,
        kamikazeMode: false,
        touched: false,
        rand1: Math.random() * 10,
        rand2: Math.random() * 10,
        body: [utils.createCircle(x, y + 20, 30)],
        updateFunc: function () { cupidUpdate(this) },
        drawFunc: function () { cupidVisuals(this) },
        dom: cupidBody,
        parallelMoveCount: 0,
        team: "enemy",
        scoreValue: 10,
        hasExploded: false,
        destroySound: "destroy_fly",
        // reset() {
        //     this.health = 20;
        //     this.moveSpeed = 0.1;
        //     this.velX = 1;
        //     this.velY = 0;
        //     this.x = x;
        //     this.y = y;
        //     // this.dom.remove();
        //     // this.body.forEach(body => body.div.remove());
        //     // this.body = [utils.createCircle(x,  y+20, 30)];
        // }
    }
    // console.log("I was created at ", x, y)
    gameState.cupids.push(cupid)
    gameState.allEntities.push(cupid)
    return cupid
}




//let  parallelmovecount = 0

export function cupidUpdate(cupid) {
    if (cupid.health <= 0) {
        utils.destroyUnit(cupid)
        updateScore(cupid.scoreValue);
    }

    cupid.parallelMoveCount++

    //what does this do? (alex)
    // if (cupid.parallelMoveCount % 3 === 0){ 
    //     cupid.moveSpeed === 0 ? cupid.moveSpeed = 1 : cupid.moveSpeed = 0
    // }

    if (!cupid.kamikazeMode) {
        const distance = 100
        if (cupid.parallelMoveCount === distance) {
            cupid.velX = -cupid.velX

        }
        if (cupid.parallelMoveCount === distance * 2) {
            cupid.velX = -cupid.velX
            cupid.velY = -30.8
            cupid.parallelMoveCount = 0
        }

        if (Math.abs(cupid.velY) > 0) {
            utils.moveUnit(cupid, 0, cupid.velY)
            cupid.parallelMoveCount--
        } else {
            utils.moveUnit(cupid, cupid.velX, cupid.velY)
        }


        if (Math.abs(cupid.velY) > 1) {
            cupid.velY /= 1.05
        }

        if (Math.abs(cupid.velY) < 1) {
            cupid.velY = 0
        }

        if (parseInt(Math.random() * 2000) == 0) {
            cupid.dom.src = preloadedFiringImage.src
            let bullet = bullets.createBullet("down", "enemy", 'heart', cupid.x, cupid.y, 4, 8, 0, 0, false, true)

            setTimeout(() => {
                cupid.dom.src = "assets/enemies/TrumpCupid.svg"
            }, 300)
        }

        if (parseInt(Math.random() * 6000) == 0) {
            let powerUp = powerups.createPowerUp(cupid.x, cupid.y - 60, 20)
        }

    }



    // for (let walkable of gameState.walkables) {
    //     for (let walkableBody of walkable.body) {
    //         for (let cupidBody of cupid.body) {
    //             const explosiveX = cupid.x

    //             const explosiveY = cupid.y

    //             if (utils.IsBodyCollidingWithBody(cupidBody, walkableBody) && !cupid.hasExploded) {
    //                 cupid.hasExploded = true;
    //                 // Replace cupid with explosion-cupid!
    //                 createExplosion(explosiveX, explosiveY, "enemy");

    //                 console.log(explosiveX, explosiveY)
    //                 utils.destroyUnit(cupid); // Remove the original cupid
    //                 return;
    //             }
    //         }
    //     }
    // }

    if (cupid.y <= 300) {
        for (let cupid of gameState.cupids) {
            cupid.kamikazeMode = true
        }
    }

    for (const BodyPart of cupid.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, gameState.mario)) {
            if (cupid.kamikazeMode){
                createExplosion(cupid.x, cupid.y, 'player', 0, 200)
                gameState.mario.takeDamage(cupid.damage, cupid.x, undefined, false)
                utils.destroyUnit(cupid)
                
            }else{
                gameState.mario.takeDamage(cupid.damage, cupid.x, undefined, true)
            }
            
            break;
        }
    }
    if (cupid.kamikazeMode) {
        utils.kamikaze(cupid, gameState.mario);
        return;
    }

}



export function cupidVisuals(cupid) {
    cupid.dom.style.opacity = "100%";
    cupid.dom.style.setProperty('--x', `${cupid.x}px`);
    cupid.dom.style.setProperty('--y', `${-cupid.y}px`);
}

