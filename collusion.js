import * as mario from './mario.js'
import * as enemies from './enemies.js'
import * as turtles from './turtles.js'
import * as bullets from './bullets.js'
import * as utils from './utils.js'

export function MarioCollusion(){
    for (const bullet of bullets.allBullets){
        if (collusionCheck(mario.mario, bullet)){
            bullet.disabled = true
            bullet.dom.remove()
            mario.mario.health -= bullet.damage
            if (mario.mario.health <= 0){
                mario.mario.disabled = true
                mario.mario.dom.remove()
                gameState.currentState = 'gameover'
            }
        }
    }
}

export function collusionCheck(entit1,entit2){
    if (entit1.team == entit2.team){
        return
    }
    for (const body of entit1.body){
        if (utils.IsBodyCollidingWithBody(body, entit2)){
            return true
        }
    }
}
