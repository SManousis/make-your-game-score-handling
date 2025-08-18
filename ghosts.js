import * as utils from "./utils.js";
import { gameState, updateScore } from './game.js'
import * as bullets from './bullets.js'
import { createExplosion } from "./explosion.js";


export function createGhost(x, y, index, row) {
    let ghostBody = document.createElement("img");
    ghostBody.className = "ghost-img";
    ghostBody.src = "assets/enemies/ghost.svg";
    document.getElementById("stage-resources").appendChild(ghostBody);
    // store reference in object

    let ghost = {
        name: "ghost",
        index: index,
        health: 8,
        damage: 10,
        moveSpeed: 0.1,
        x: x,           // use the parameters!
        y: y,
        bullet_count: 1,
        aimDirection: "down",
        state: (row % 2 == 0) ? "left" : "right",
        velX: 1.2,
        velY: 0,
        touched: false,
        rand1: Math.random() * 10,
        rand2: Math.random() * 10,
        body: [utils.createCircle(x, y + 20, 30)],
        updateFunc: function () { ghostUpdate(this) },
        drawFunc: function () { ghostVisuals(this) },
        dom: ghostBody,
        parallelMoveCount: 0,
        team: "enemy",
        scoreValue: 10,
        hasExploded: false,
        destroySound: "destroy_fly",
        kamikazeMode: false,
        kamikazeSpeed: 8,
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
        //     this.dom = ghostBody;
        // }
    }
    console.log("I was created at ", x, y)
    gameState.ghosts.push(ghost)
    gameState.allEntities.push(ghost)
    return ghost
}



//let  parallelmovecount = 0

export function ghostUpdate(ghost) {
    if (ghost.health <= 0) {
        utils.destroyUnit(ghost)
        updateScore(ghost.scoreValue);
    }

    switch (ghost.state) {
        case "left":
            if (ghost.x < 120) {
                ghost.state = "right"
                ghost.velY -= 13
            }
            ghost.velX = -5
            break

        case "right":
            if (ghost.x > document.getElementById('game-area').offsetWidth - 120) {
                ghost.state = "left"
                ghost.velY -= 13
            }
            ghost.velX = 5
            break
    }

    if (!ghost.kamikazeMode){
        utils.moveUnit(ghost, ghost.velX, ghost.velY)
    }

    if (ghost.velY > 0) {
        ghost.velY -= 1
    } else if (ghost.velY < 0) {
        ghost.velY += 1
    }



    if (parseInt(Math.random() * 1000) == 0) {
        bullets.createBullet("down", "enemy", 'pacman', ghost.x, ghost.y, 3, 10)
    }

    if (ghost.y <= 300) {
        for (let ghost of gameState.ghosts) {
            ghost.kamikazeMode = true
        }
    }

    for (const BodyPart of ghost.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, gameState.mario)) {
            if (ghost.kamikazeMode) {
                createExplosion(ghost.x, ghost.y, 'player', 0, 200)
                gameState.mario.takeDamage(ghost.damage, ghost.x, undefined, false)
                utils.destroyUnit(ghost)

            } else {
                gameState.mario.takeDamage(ghost.damage, ghost.x, undefined, true)
            }

            break;
        }
    }
    if (ghost.kamikazeMode) {
        utils.kamikaze(ghost, gameState.mario);
        return;
    }

}



export function ghostVisuals(ghost) {
    ghost.dom.style.opacity = "100%";
    ghost.dom.style.setProperty('--x', `${ghost.x}px`);
    ghost.dom.style.setProperty('--y', `${-ghost.y}px`);
}
