import * as utils from "./utils.js";
import { gameState, updateScore } from './game.js'
import { createExplosion } from "./explosion.js";


export function createTetro(x, y, index, row) {

    const tetroBody = document.createElement('div')


    let parts = []
    for (let i = 0; i < 4; i++) {
        let a = document.createElement("img");
        a.className = "tetro-img";
        a.src = "assets/enemies/tetris.svg";
        parts.push(a)
    }

    x += Math.random() * 200 - 100
    y += Math.random() * 500 - 250

    let tetroShapeBody = []

    switch (parseInt(Math.round(Math.random() * 5))) {
        // switch (0){
        case 0:
            //##
            //##

            parts[1].style.left = '40px'

            parts[2].style.bottom = '-40px'

            parts[3].style.bottom = '-40px'
            parts[3].style.left = '40px'

            tetroShapeBody = [
                utils.createRect(x, y, 40, 40),
                utils.createRect(x + 40, y, 40, 40),
                utils.createRect(x, y - 40, 40, 40),
                utils.createRect(x + 40, y - 40, 40, 40)
            ]

            break;
        case 1:
            //#####
            parts[1].style.left = '40px'

            parts[2].style.left = '80px'
            parts[3].style.left = '120px'

            tetroShapeBody = [
                utils.createRect(x, y, 40, 40),
                utils.createRect(x + 40, y, 40, 40),
                utils.createRect(x + 80, y, 40, 40),
                utils.createRect(x + 120, y, 40, 40)
            ]

            break;

        case 2:
            //#
            //#
            //#
            //#
            parts[1].style.bottom = '-40px'

            parts[2].style.bottom = '-80px'
            parts[3].style.bottom = '-120px'

            tetroShapeBody = [
                utils.createRect(x, y, 40, 40),
                utils.createRect(x, y - 40, 40, 40),
                utils.createRect(x, y - 80, 40, 40),
                utils.createRect(x, y - 120, 40, 40)
            ]

            break;
        case 3:
            //###
            // #

            parts[1].style.left = '40px'

            parts[2].style.left = '80px'

            parts[3].style.left = '40px'
            parts[3].style.bottom = '-40px'

            tetroShapeBody = [
                utils.createRect(x, y, 40, 40),
                utils.createRect(x + 40, y, 40, 40),
                utils.createRect(x + 80, y, 40, 40),
                utils.createRect(x + 40, y - 40, 40, 40)
            ]

            break;
        case 4:
            //##
            // ##
            parts[1].style.left = '40px'

            parts[2].style.left = '80px'
            parts[2].style.bottom = '-40px'

            parts[3].style.left = '40px'
            parts[3].style.bottom = '-40px'

            tetroShapeBody = [
                utils.createRect(x, y, 40, 40),
                utils.createRect(x + 40, y, 40, 40),
                utils.createRect(x + 80, y - 40, 40, 40),
                utils.createRect(x + 40, y - 40, 40, 40)
            ]

            break;
        case 5:
            //##
            //#
            //#

            parts[1].style.left = '40px'

            parts[2].style.bottom = '-80px'

            parts[3].style.bottom = '-40px'

            tetroShapeBody = [
                utils.createRect(x, y, 40, 40),
                utils.createRect(x + 40, y, 40, 40),
                utils.createRect(x, y - 40, 40, 40),
                utils.createRect(x, y - 80, 40, 40)
            ]

            break;
    }

    for (let p of parts) {
        tetroBody.appendChild(p);
    }

    document.getElementById("stage-resources").appendChild(tetroBody);

    let tetro = {
        name: "tetro",
        index: index,
        health: 5,
        damage: 10,
        moveSpeed: 1.0,
        x: x,           // use the parameters!
        y: y,
        bullet_count: 1,
        aimDirection: "down",
        state: "airborne",
        velX: 0,
        velY: -1.5,
        kamikazeSpeed: 10,
        kamikazeMode: false,
        touched: false,
        rand1: Math.random() * 10,
        rand2: Math.random() * 10,
        body: tetroShapeBody,
        updateFunc: function () { tetroUpdate(this) },
        drawFunc: function () { tetroVisuals(this) },
        dom: tetroBody,
        parallelMoveCount: 0,
        team: "enemy",
        scoreValue: 10,
        hasExploded: false,
        destroySound: "destroy_fly",
    }
    // console.log("I was created at ", x, y)
    gameState.tetros.push(tetro)
    gameState.allEntities.push(tetro)
    return tetro
}




export function tetroUpdate(tetro) {
    if (tetro.health <= 0) {
        utils.destroyUnit(tetro)
        updateScore(tetro.scoreValue);
    }

    if (tetro.kamikazeMode == false){
        utils.moveUnit(tetro, tetro.velX, tetro.velY)
    }

    if (tetro.y <= 50 && !tetro.kamikazeMode) {
        tetro.kamikazeMode = true
    }

    for (const BodyPart of tetro.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, gameState.mario)) {
            if (tetro.kamikazeMode) {
                createExplosion(tetro.x, tetro.y, 'player', 0, 200)
                gameState.mario.takeDamage(tetro.damage, tetro.x, undefined, false)
                utils.destroyUnit(tetro)

            } else {
                gameState.mario.takeDamage(tetro.damage, tetro.x, undefined, true)
            }

            break;
        }
    }

    if (tetro.kamikazeMode) {
        tetro.health = 1000
        utils.kamikaze(tetro, gameState.mario);
        return;
    }
}



export function tetroVisuals(tetro) {
    tetro.dom.style.opacity = "100%";
    tetro.dom.style.setProperty('--x', `${tetro.x}px`);
    tetro.dom.style.setProperty('--y', `${-tetro.y}px`);
}

