import * as utils from "./utils.js";
import * as mario from './mario.js'
import { allEntities, gameState, updateMenuVisibility, updateScore } from './game.js'
import * as bullets from './bullets.js'
import * as healthItem from './healthItem.js'
import * as walkables from './walkables.js'

export let ghosts = [];

export function createGhost(x, y, index, row) {
    let ghostBody = document.createElement("img");
    ghostBody.className = "ghost-img";
    ghostBody.src = "assets/enemies/ghost.svg";
    document.getElementById("game-area").appendChild(ghostBody);
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
        state: (row%2 == 0) ? "left" : "right",
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
    ghosts.push(ghost)
    allEntities.push(ghost)
    return ghost
}


// export function reset() {
//     // Remove ghosts from allEntities
//     for (const ghost of ghosts) {
//         utils.destroyUnit(ghost)
//     }
//     // Empty the ghosts array
//     ghosts.length = 0;
// }

//let  parallelmovecount = 0

export function ghostUpdate(ghost) {
    if (ghost.health <= 0) {
        utils.destroyUnit(ghost)
        updateScore(ghost.scoreValue);
    }

    switch (ghost.state){
        case "left":
            if (ghost.x < 120){
                ghost.state = "right"
                ghost.velY -= 10
            }
            ghost.velX = -3
            break

        case "right":
            if (ghost.x > document.getElementById('game-area').offsetWidth-120){
                ghost.state = "left"
                ghost.velY -= 10
            } 
            ghost.velX = 3
            break
    }
    
    utils.moveUnit(ghost, ghost.velX, ghost.velY)
    
    if (ghost.velY > 0){
        ghost.velY -= 1
    }else if (ghost.velY < 0){
        ghost.velY += 1
    }

    if (parseInt(Math.random()*1000) == 0){
        bullets.createBullet("down", "enemy", 'pacman', ghost.x, ghost.y, 3, 10)
    }

}



export function ghostVisuals(ghost) {
    ghost.dom.style.opacity = "100%";
    ghost.dom.style.setProperty('--x', `${ghost.x}px`);
    ghost.dom.style.setProperty('--y', `${-ghost.y}px`);
}
