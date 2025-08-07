import * as utils from "./utils.js";
import * as mario from './mario.js'
import { allEntities, gameState, updateMenuVisibility, updateScore } from './game.js'
import * as bullets from './bullets.js'
import * as powerups from './powerups.js'
import * as walkables from './tilesMap.js'
import { createExplosion } from "./explosion.js";
import * as collision from './collision.js'

export let flowers = [];

let preloadedFiringImage = new Image();
// preloadedFiringImage.src = "/assets/enemies/TrumpflowerFired.svg";


export function createFlower(x, y, index, row) {
    let flowerBody = document.createElement("img");
    flowerBody.className = "flower-img";
    flowerBody.src = "assets/enemies/flower.svg";
    document.getElementById("game-area").appendChild(flowerBody);
    // store reference in object

    let flower = {
        name: "flower",
        index: index,
        health: 8,
        damage: 10,
        moveSpeed: 0.1,
        x: x,           // use the parameters!
        y: y,
        bullet_count: 1,
        aimDirection: "down",
        state: "airborne",
        velX: (Math.random()-0.5) * 3,
        velY: (Math.random()-0.5) * 3,
        kamikazeSpeed: 5,
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
        scoreValue: 10,
        hasExploded: false,
        destroySound: "destroy_fly",
    }
    // console.log("I was created at ", x, y)
    flowers.push(flower)
    allEntities.push(flower)
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

    flower.lowBound -= 0.22
    flower.upBound -= 0.22

    utils.moveUnit(flower, flower.velX, flower.velY)



   
    if (parseInt(Math.random() * 1200) == 0) {
        let bullet = bullets.createBullet("target", "enemy", 'sphere', flower.x, flower.y, 9, 20, mario.mario.x, mario.mario.y+40)
    }

    if (flowers.length > 0 && flowers[0].y <= 350) {
        for (let flower of flowers) {
            flower.kamikazeMode = true
        }
    }

    if (flower.kamikazeMode) {
        utils.kamikaze(flower, mario.mario);
        utils.moveUnit(flower, flower.velX, flower.velY);
        if (utils.IsBodyCollidingWithUnit(flower.body[0], mario.mario)){
            createExplosion(flower.x, flower.y, "enemy", 100, 50)
            utils.destroyUnit(flower)
        }
        return;
    }
}



export function flowerVisuals(flower) {
    flower.dom.style.opacity = "100%";
    flower.dom.style.setProperty('--x', `${flower.x}px`);
    flower.dom.style.setProperty('--y', `${-flower.y}px`);
}

