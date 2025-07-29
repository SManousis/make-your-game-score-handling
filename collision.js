import * as mario from './mario.js'
import * as enemies from './cupids.js'
import * as turtles from './turtles.js'
import * as bullets from './bullets.js'
import * as utils from './utils.js'
import * as game from './game.js'
import * as healthItem from './healthItem.js'


export function isShot(entity) {
    for (const bullet of bullets.allBullets) {
        if (bullet.disabled) continue;
        if (collisionCheck(entity, bullet)) {
            // console.log(`bullet touched ${entity.name}`)
            bullet.disabled = true
            bullet.body.forEach(body => body.div.remove())
            bullet.dom.remove()
            if (entity.type !== "turtle"){
            entity.health -= bullet.damage
            }
            if (entity.health <= 0) {
                entity.disabled = true  
            }
        }
    }
}

export function healthItemPicked(entity) {
    for (const candy of healthItem.healthItems) {
        if (candy.disabled) continue;
        // console.log("Checking collision between:", entity, "and", candy);
        if (collisionCheck(entity, candy)) {
            // console.log(`healthItem touched ${entity.name} gained ${candy.healthAdd}`);
            candy.disabled = true
            candy.body.forEach(body => body.div.remove())
            candy.dom.remove()
            entity.health += candy.healthAdd
            if (entity.health > 120) {
                entity.health = 120
            }
        }
    }
}


// export function MarioCollision() {
//     for (const bullet of bullets.allBullets) {
//         if (bullet.disabled) continue;
//         if (collisionCheck(mario.mario, bullet)) {
//             console.log("bullet touched mario")
//             bullet.disabled = true
//             bullet.body.forEach(body => body.div.remove())
//             bullet.dom.remove()
//             mario.mario.health -= bullet.damage
//             if (mario.mario.health <= 0) {
//                 mario.mario.disabled = true
//                 game.gameState.currentState = 'gameOver'
//                 game.updateMenuVisibility();
//                 console.log("mario died")
//             }
//         }
//     }
// }

export function collisionCheck(entit1, entit2) {
    // Optionally skip if on the same team
    if (entit1.team && entit2.team && entit1.team === entit2.team && entit2.type !== "healthItem") return false;
    // Loop through all bodies in both entities
    for (const body1 of entit1.body) {
        for (const body2 of entit2.body) {
            if (utils.IsBodyCollidingWithBody(body1, body2)) {
                return true;
            }
        }
    }
    return false;
}
