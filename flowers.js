import * as utils from "./utils.js";
import { gameState, updateScore } from './game.js'
import * as bullets from './bullets.js'
import { createExplosion } from "./explosion.js";



export function createFlower(x, y, index, row) {
    let flowerBody = document.createElement("img");
    flowerBody.className = "flower-img";
    flowerBody.src = "assets/enemies/flower.svg";
    document.getElementById("stage-resources").appendChild(flowerBody);
    // store reference in object

    let flower = {
        name: "flower",
        index: index,
        health: 5,
        damage: 10,
        moveSpeed: 0.1,
        x: x,           // use the parameters!
        y: y,
        bullet_count: 1,
        aimDirection: "down",
        state: "airborne",
        velX: (Math.random()-0.5) * 3,
        velY: (Math.random()-0.5) * 3,
        kamikazeSpeed: 10,
        kamikazeMode: false,
        touched: false,
        rand1: Math.random() * 10,
        rand2: Math.random() * 10,
        dirCounter: Math.random() * 20,
        upBound: document.getElementById('game-area').offsetHeight-50,
        lowBound: document.getElementById('game-area').offsetHeight*0.8,
        body: [utils.createCircle(x, y + 20, 50)],
        updateFunc: function () { flowerUpdate(this) },
        drawFunc: function () { flowerVisuals(this) },
        dom: flowerBody,
        parallelMoveCount: 0,
        team: "enemy",
        scoreValue: 50,
        hasExploded: false,
        destroySound: "destroy_fly",
    }
    // console.log("I was created at ", x, y)
    gameState.flowers.push(flower)
    gameState.allEntities.push(flower)
    return flower
}




export function flowerUpdate(flower) {
    if (flower.health <= 0) {
        utils.destroyUnit(flower)
        updateScore(flower.scoreValue);
    }

    flower.dirCounter++

    if (flower.dirCounter % 100 == 0){
        flower.velX = (Math.random()-0.5) * 6
        flower.velY = (Math.random()-0.5) * 4
        flower.dirCounter = Math.random() * 20
    }

    if (flower.y > flower.upBound){
        flower.velY = Math.random()-1 * 5
    }

    if (flower.y < flower.lowBound){
        flower.velY = Math.random() * 3
    }
    
    if (flower.x < 20){
        flower.velX = Math.max(flower.velX, -flower.velX)
    }

     if (flower.x > document.getElementById('game-area').offsetWidth-20){
        flower.velX = Math.min(flower.velX, -flower.velX)
    }

    flower.lowBound -= 0.33
    flower.upBound -= 0.36

    if (flower.kamikazeMode == false){
        utils.moveUnit(flower, flower.velX, flower.velY)
    }


   
    if (parseInt(Math.random() * 1200) == 0) {
        let bullet = bullets.createBullet("target", "enemy", 'sphere', flower.x, flower.y, 9, 20, gameState.mario.x, gameState.mario.y+40, false, true)
    }


    if (flower.y <= 100 && !flower.kamikazeMode) {
        for (let flower of gameState.flowers) {
            flower.kamikazeMode = true
        }
    }

    for (const BodyPart of flower.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, gameState.mario)) {
            if (flower.kamikazeMode) {
                createExplosion(flower.x, flower.y, 'player', 0, 200)
                gameState.mario.takeDamage(flower.damage, flower.x, undefined, false)
                utils.destroyUnit(flower)

            } else {
                gameState.mario.takeDamage(flower.damage, flower.x, undefined, true)
            }

            break;
        }
    }

    if (flower.kamikazeMode) {
        utils.kamikaze(flower, gameState.mario);
        return;
    }
}



export function flowerVisuals(flower) {
    flower.dom.style.opacity = "100%";
    flower.dom.style.setProperty('--x', `${flower.x}px`);
    flower.dom.style.setProperty('--y', `${-flower.y}px`);
}

