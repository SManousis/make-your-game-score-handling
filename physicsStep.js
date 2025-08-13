
import { gameState } from './game.js'
import * as utils from './utils.js'



//it will simulate the physics step of a unit, 
// assumes the unit has x, y, velX, velY, gravity. returns data about the state of the unit after the physics step 
// TODO also needs to be made to work with just 1 or more points, instead of two and two that mario has. might require reworking
export function moveAndCollide(unit) {
    

    //move unit by x velocity
    utils.moveUnit(unit, unit.velX, 0)

    let resolve = isUnitColliding(unit)
    if (resolve == undefined || resolve.vertical == undefined || resolve.horizontal == undefined){
        throw new Error("wtf")
    }
    if (resolve.vertical != 0) {
        utils.moveUnit(unit, resolve.horizontal*1.01, 0)
    }

    //apply gravity to y velocity
    unit.velY -= unit.gravity

    // apply unit's gravity
    utils.moveUnit(unit, 0, unit.velY)

    resolve = isUnitColliding(unit)

    if (resolve == undefined || resolve.vertical == undefined || resolve.horizontal == undefined){
        throw new Error("wtf")
    }


    let grounded = (resolve.vertical > 0)

    if (resolve.vertical != 0) {
        utils.moveUnit(unit, 0, resolve.vertical*1.01)
        unit.velY = 0
    }

    return grounded
}



export function isUnitColliding(unit) {
    let largest = { vertical: 0, horizontal: 0 }
    for (let walkable of gameState.walkables) {
        for (let walkableBody of walkable.body) {
            for (let pointOffset of unit.physicsPointsOffsets) {
                const result = utils.isPointCollidingWithBody(unit.x + pointOffset.x, unit.y + pointOffset.y, walkableBody, unit.velX, unit.velY)
                largest.vertical = utils.largestMag(result.vertical, largest.vertical)
                largest.horizontal = utils.largestMag(result.horizontal, largest.horizontal)
            }
        }
    }
    return largest
}

