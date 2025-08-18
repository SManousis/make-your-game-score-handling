import * as utils from './utils.js'
import * as game from './game.js'



export function isShot(entity) {
    for (const bullet of game.gameState.allBullets) {
        if (collisionCheck(entity, bullet)) {
            console.log('collision detected!')
            // console.log(`bullet touched ${entity.name}`)
            if (entity === game.gameState.mario) bullet.destroySound = undefined;
            utils.destroyUnit(bullet)
            bullet.disabled = true
  
            if (Object.hasOwn(entity, 'takeDamage')){
                entity.takeDamage(bullet.damage, bullet.x)
            } else if (entity.type !== "turtle") {
                entity.health -= bullet.damage
            }
            
            if (game.gameState.allBullets.includes(entity)){
                entity.disabled = true
                utils.destroyUnit(entity)
            }

            if (entity.health <= 0) {
                entity.disabled = true
            }

        }
    }
}

export function inAoe(unit) {

    for (const aoe of game.gameState.aoeDamage) {
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

export function powerUpPicked(entity) {
    for (const powerUp of game.gameState.powerUps) {
        if (powerUp.disabled) continue;
        // console.log("Checking collision between:", entity, "and", candy);
        if (collisionCheck(entity, powerUp)) {
            if (Object.hasOwn(entity, 'applyPowerUp')) {
                console.log(powerUp.powerUpType, powerUp.value)
                entity.applyPowerUp(powerUp.powerUpType, powerUp.value, "health");
            } 

             console.log(`powerUp touched ${entity.name} gained ${powerUp.healthAdd}`);
            powerUp.disabled = true
            powerUp.body.forEach(body => body.div.remove())
            powerUp.dom.remove()
        }
    }
}



export function collisionCheck(entit1, entit2) {
    // Optionally skip if on the same team
    if (entit1.team && entit2.team && entit1.team === entit2.team && entit2.type !== "powerUp") return false;
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
