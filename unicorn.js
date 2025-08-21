import * as utils from "./utils.js";
import * as mario from './mario.js'
import { gameArea, gameState, updateScore, audio } from './game.js'
import * as bullets from './bullets.js'
import * as powerups from './powerups.js'

export function createUnicorn(x, y, index, row) {
    let unicornBody = document.createElement("img");
    unicornBody.className = "unicorn-img";
    unicornBody.src = "assets/enemies/unicorn.svg";
    document.getElementById("stage-resources").appendChild(unicornBody);
    // store reference in object

    let unicorn = {
        name: "unicorn",
        index: index,
        health: 24,
        damage: 10,
        moveSpeed: 0.1,
        x: x,
        y: y,
        originY: y,
        bullet_count: 1,
        aimDirection: "down",
        state: "right",
        velX: 4,
        velY: 0,
        passesMade: 0,
        movementState: "entering", //entering, arcing, exiting
        touched: false,
        rand1: Math.random() * 10,
        rand2: Math.random() * 10,
        body: [
            utils.createCircle(x, y, 80)
        ],
        updateFunc: function () { unicornUpdate(this) },
        drawFunc: function () { unicornVisuals(this) },
        dom: unicornBody,
        parallelMoveCount: 0,
        team: "enemy",
        scoreValue: 100,
        hasExploded: false,
        takeDamage: function (damage, sourceX, sound) {
            if (audio.sounds) {
                audio.manager.playSample("destroy_fly", {
                    gain: audio.soundsVolume,
                    pan: audio.xToPan(this.x, gameArea.offsetWidth),
                    throttleMs: 60,
                    pitchRandom: [0.98, 1.02]
                });
            }
            this.health -= damage;
            if (Math.random() < 0.15) {
                powerups.createPowerUp(unicorn.x, unicorn.y, 0, "multibullet", "rainbow");
            } else {
                powerups.createPowerUp(unicorn.x, unicorn.y - 60, 1, "bomb", "bomb");
            }

        }
        // reset() {
        //     this.health = 20;
        //     this.moveSpeed = 0.1;
        //     this.velX = 1;
        //     this.velY = 0;
        //     this.x = x;
        //     this.y = y;
        //     this.dom.remove();
        //     this.body.forEach(body => body.div.remove());
        //     this.body = [utils.createCircle(x, y + 20, 30)];
        //     this.dom = unicornBody;
        // }
    }
    console.log("I was created at ", x, y)
    gameState.unicorns.push(unicorn)
    gameState.allEntities.push(unicorn)
    return unicorn
}


// export function reset() {
//     // Remove unicorn from allEntities
//     
//         utils.destroyUnit(unicorn)
//     }


//let  parallelmovecount = 0

export function unicornUpdate(unicorn) {
    if (unicorn.health <= 0) {
        unicorn.destroySound = "bubble";
        utils.destroyUnit(unicorn)
        updateScore(unicorn.scoreValue);
        return;
    }

    const screenWidth = gameArea.offsetWidth;
    const isOffScreenLeft = unicorn.x < -unicorn.dom.offsetWidth;
    const isOffScreenRight = unicorn.x > screenWidth + unicorn.dom.offsetWidth;

    if (unicorn.movementState === "entering") {
        unicorn.x += unicorn.velX;
        if (unicorn.x > 0 && unicorn.x < screenWidth) {
            unicorn.movementState = "arcing";
        }
    } else if (unicorn.movementState === "arcing") {
        const screenCenter = screenWidth / 2;
        const peakHeight = gameArea.offsetHeight - 150;
        const startY = gameArea.offsetHeight / 2;
        let distanceFromCenter = Math.abs(unicorn.x - screenCenter) / screenCenter;
        let curveFactor = 1.0 - (distanceFromCenter * distanceFromCenter);
        unicorn.y = startY + curveFactor * (peakHeight - startY);

        unicorn.x += unicorn.velX;


        if ((unicorn.velX > 0 && unicorn.x > screenWidth) ||
            (unicorn.velX < 0 && unicorn.x < 0)) {
            unicorn.passesMade++;
            unicorn.movementState = "exiting";
        }
    }


    else if (unicorn.movementState === "exiting") {
        unicorn.x += unicorn.velX;


        if (isOffScreenLeft || isOffScreenRight) {
            if (unicorn.passesMade >= 2) {
                // If two passes are done, destroy the unicorn.
                utils.destroyUnit(unicorn);
                return;
            } else {
                // If only one pass is done, reverse direction and re-enter.
                unicorn.velX *= -1;
                unicorn.movementState = "entering";
            }
        }
    }



    for (const bod of unicorn.body) {
        bod.x = unicorn.x;
        bod.y = unicorn.y;
    }



    if (Math.random() < 0.02) {

        if (Math.random() < 0.15) {
            powerups.createPowerUp(unicorn.x, unicorn.y, 25, "health", "rainbow");
        } else {
            bullets.createBullet(
                'target',
                'enemy',
                'poo',
                unicorn.x,
                unicorn.y,
                5,
                10,
                gameState.mario.x,
                gameState.mario.y,
                false,
                true
            );
        }
    }

    if (parseInt(Math.random() * 1000) == 0) {
        bullets.createBullet("down", "enemy", 'poo', unicorn.x, unicorn.y, 3, 10, 0, 0, false, true)
    }

}



export function unicornVisuals(unicorn) {
    unicorn.dom.style.setProperty('--x', `${unicorn.x}px`);
    unicorn.dom.style.setProperty('--y', `${-unicorn.y}px`);
    unicorn.dom.style.opacity = "100%";

    if (unicorn.velX > 0) {
        unicorn.dom.style.setProperty('--scale-x', '1');
    } else {
        unicorn.dom.style.setProperty('--scale-x', '-1');
    }
}