import * as mario from './mario.js'
import * as enemies from './enemies.js'
import * as turtles from './turtles.js'
import * as bullets from './bullets.js'
import * as utils from './utils.js'

export function MarioCollusion(){
    for (const bullet of bullets.allBullets){
        if (collusionCheck(mario.mario, bullet)){
            console.log("bullet touched mario")
            bullet.disabled = true
            bullet.dom.remove()
            mario.mario.health -= bullet.damage
            // if (mario.mario.health <= 0){
            //     mario.mario.disabled = true
            //     mario.mario.dom.remove()
            //     gameState.currentState = 'gameover'
            // }
        }
    }
}

export function collusionCheck(entit1, entit2) {
    // Optionally skip if on the same team
    if (entit1.team && entit2.team && entit1.team === entit2.team) return false;
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
