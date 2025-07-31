import * as mario from './mario.js'
import * as enemies from './cupids.js'
import * as turtles from './turtles.js'
import * as bullets from './bullets.js'
import * as utils from './utils.js'
import * as game from './game.js'
import * as healthItem from './healthItem.js'
import { audioManager } from './audio.js'


export function isShot(entity) {
    for (const bullet of bullets.allBullets) {
        if (bullet.disabled) continue;
        if (collisionCheck(entity, bullet)) {
            // console.log(`bullet touched ${entity.name}`)
            bullet.disabled = true
            bullet.body.forEach(body => body.div.remove())
            bullet.dom.remove()
            if (entity.type !== "turtle") {
                entity.health -= bullet.damage
            }
            if (entity.health <= 0) {
                entity.disabled = true
            }
        }
    }
}

export function inAoe(unit) {

    for (const aoe of game.aoeDamage) {
        if (aoe.active == false || aoe.team == unit.team) {
            console.log("skipping: ", aoe.name, aoe.team == unit.team, aoe.active == false)
            continue
        }
        for (let aoeBody of aoe.body) {
            console.log('checking body')
            if (utils.IsBodyCollidingWithUnit(aoeBody, unit)) {
                console.log("CONNECTED: ", unit.name, unit.team, aoe.team)
                if (Object.hasOwn(unit, 'takeDamage')) {
                    unit.takeDamage(aoe.damage, aoe.x)
                } else {
                    unit.health -= aoe.damage
                }
                break
            }
        }
    }
}

export function healthItemPicked(entity) {
    for (const candy of healthItem.healthItems) {
        if (candy.disabled) continue;
        // console.log("Checking collision between:", entity, "and", candy);
        if (collisionCheck(entity, candy)) {
            if (game.sounds) audioManager.playSample("health", {
                gain: game.soundsVolume,
                pan: 0,
                throttleMs: 300,
                pitchRandom: [0.95, 1.05],
            });
            
            // console.log(`healthItem touched ${entity.name} gained ${candy.healthAdd}`);
            candy.disabled = true
            candy.body.forEach(body => body.div.remove())
            candy.dom.remove()
            entity.health += candy.healthAdd
            if (entity.maxhealth && entity.health > entity.maxhealth) {
                entity.health = entity.maxhealth
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
