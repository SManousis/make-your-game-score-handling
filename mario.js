import * as utils from './utils.js'
import {walkables} from './walkables.js'
import {keysPressed,gameArea} from './game.js'
import * as physics from './physicsStep.js'

export const marioDiv = document.getElementById('mario');



//the character the player controls
export let mario = {
    health: 100, //how much health point he has, if it reaches 0 he dies!
    attack_damage: 10, //how damage marios bullets deal to enemies
    accel: 1, //how quickly accelerates in x axis
    maxSpeed: 10, //maximum running speed in x axis
    jump_power: 15,
    state: "standing", //crouch, standing, airborne, dead
    gravity: 0.8, //the speed that which he is pushed down while airborne
    drag: 1.2, //how much mario slows downs in x axis if he's not actively walking left or right
    bullet_count: 1, //how many bullets mario will fire
    aimDirection: "left", //left, right, up
    velX: 0, //his current velocity in x axis
    velY: 0, //his current velocity in y axis
    x: 100, //his current x position 
    y: 100, //his current y position
    lookingDir: "left", //which direction mario is looking at
    lookingUp: false,
    walkCounter: 0, //a counter that counts for how many frames mario has been walking towards a direction, for walk animation purposes
    crouching: false,
    body: [utils.createCircle(100, 100 + 20, 20), utils.createCircle(100, 100 + 20 + 40, 20)], //his gameplay body represented in circles
    physicsPointsOffsets: [{x: -20, y: 0}, {x: 20, y: 0}], //These points will be used
    drawFunc: marioVisuals, //his visual representation in the game
    updateFunc: marioUpdate
    
}





export let currentBody = document.getElementById("mario-body-forward")
export let currentLegs = document.getElementById("mario-legs0")
export let marioFeetFrames = ["mario-legs0", "mario-legs1", "mario-legs2", "mario-legs3", "mario-legs3"]
export function marioVisuals() {

    if (mario.lookingUp) {
        currentBody.style.opacity = "0%"
        if (mario.crouching) {
            currentBody = document.getElementById("mario-body-crouch-up")
        } else {
            currentBody = document.getElementById("mario-body-up")
        }
    } else if (mario.crouching) {
        currentBody.style.opacity = "0%"
        currentBody = document.getElementById("mario-body-crouch-forward")
    } else {
        currentBody.style.opacity = "0%"
        currentBody = document.getElementById("mario-body-forward")
    }

    if (mario.velY > 0.2) {
        currentLegs.style.opacity = "0%"
        currentLegs = document.getElementById("mario-legs-jump")
    } else if (mario.velY < -0.2) {
        currentLegs.style.opacity = "0%"
        currentLegs = document.getElementById("mario-legs-falling")
    } else if (mario.crouching) {
        currentLegs.style.opacity = "0%"
        currentLegs = document.getElementById("mario-legs-crouch")
    } else {
        currentLegs.style.opacity = "0%"
        currentLegs = document.getElementById(marioFeetFrames[parseInt(mario.walkCounter / 2) % marioFeetFrames.length])
    }

    currentBody.style.opacity = "100%"
    currentBody.style.setProperty('--mario-x', `${mario.x}px`);
    currentBody.style.setProperty('--mario-y', `${-mario.y}px`);

    currentLegs.style.opacity = "100%"
    currentLegs.style.setProperty('--mario-x', `${mario.x}px`);
    currentLegs.style.setProperty('--mario-y', `${-mario.y}px`);

    if (mario.lookingDir == "right") {
        currentBody.style.setProperty('--mario-scale-x', `${-1}`);
        currentLegs.style.setProperty('--mario-scale-x', `${-1}`);
    } else if (mario.lookingDir == "left") {
        currentBody.style.setProperty('--mario-scale-x', `${1}`);
        currentLegs.style.setProperty('--mario-scale-x', `${1}`);
    }
}



export function isMarioTouchingGround() {
    let largest = 0
    for (let walkable of walkables) {
        for (let walkableBody of walkable.body) {
            const result1 = utils.isPointCollidingWithBody(mario.x - 20, mario.y, walkableBody).vertical
            const result2 = utils.isPointCollidingWithBody(mario.x + 20, mario.y, walkableBody).vertical
            if (result1 != 0 || result2 != 0) {
                largest = utils.largestMag(utils.largestMag(result1, result2), utils.largestMag(largest, 0))
            }
        }
    }
    return largest
}

export function isMarioWalkingIntoGround() {
    let largestV = 0
    let largestH = 0
    for (let walkable of walkables) {
        for (let walkableBody of walkable.body) {

            const result1 = utils.isPointCollidingWithBody(mario.x - 21, mario.y, walkableBody)
            const result2 = utils.isPointCollidingWithBody(mario.x + 21, mario.y, walkableBody)


            if (result1.vertical != 0 || result2.vertical != 0) {
                largestV = utils.largestMag(utils.largestMag(result1.vertical, result2.vertical), largestV)
                if (result1.horizontal != 0 || result2.horizontal != 0) {
                    largestH = utils.largestMag(utils.largestMag(result1.horizontal, result2.horizontal), largestH)
                }
            }
        }
    }
    return { vertical: largestV, horizontal: largestH }
}


export function marioUpdate() {
    if (keysPressed.right) {
        mario.lookingDir = "right"
    } else if (keysPressed.left) {
        mario.lookingDir = "left"
    }

    if (keysPressed.up) {
        mario.lookingUp = true
    } else {
        mario.lookingUp = false
    }




    // add x acceleration
    let impulse = mario.accel
    // if (!grounded) {
    //   impulse = mario.accel / 1.5 //to make aerial x axis acceleration harder than grounded
    // }
    if (keysPressed.left) {
        mario.velX -= impulse

    }

    if (keysPressed.right) {
        mario.velX += impulse

    }



    // // apply max x speed
    // if (mario.velX > mario.maxSpeed) {
    //     mario.velX = mario.maxSpeed
    // }
    // if (mario.velX < -mario.maxSpeed) {
    //     mario.velX = -mario.maxSpeed
    // }

    //add x drag when one ground
    if (!keysPressed.left && !keysPressed.right) {
        let impulse = mario.drag
        // if (!grounded) {
        //   impulse = mario.drag / 5
        // }
        if (mario.velX > 0.2) {
            mario.velX -= impulse
            if (mario.velX < 0) {
                mario.velX = 0
            }
        } else if (mario.velX < -0.2) {
            mario.velX += impulse
            if (mario.velX > 0) {
                mario.velX = 0
            }
        } else {
            mario.velX = 0
        }
    }


    // //move mario by x velocity
    // utils.moveUnit(mario, mario.velX, 0)

    // let resolve = isMarioWalkingIntoGround(mario.x, mario.y)

    // if (resolve.vertical != 0) {
    //     utils.moveUnit(mario, resolve.horizontal, 0)
    // }


   


    // //apply gravity to y velocity
    // mario.velY -= mario.gravity

    // // apply mario's gravity
    // utils.moveUnit(mario, 0, mario.velY)

    // let resolveUp = isMarioTouchingGround()

    // let grounded = (resolveUp > 0)

    // if (resolveUp != 0) {
    //     utils.moveUnit(mario, 0, resolveUp)
    //     mario.velY = 0
    // }

    let grounded = physics.moveAndCollide(mario)


     //don't allow mario to move past screen bounds
    if (mario.x < 0) {
        utils.setUnit(mario, 0, mario.y)
    }
    if (mario.x > gameArea.offsetWidth) {
        utils.setUnit(mario, gameArea.offsetWidth, mario.y)
    }

    //if mario on the ground and jump button pressed
    if (keysPressed.space && grounded) {
        mario.velY += mario.jump_power
    }


    if (grounded && mario.velX != 0) {
        mario.walkCounter++
    } else {
        mario.walkCounter = 0
    }

    if (grounded && mario.velX == 0 && mario.velY == 0 && keysPressed.down) {
        mario.crouching = true
    } else {
        mario.crouching = false
    }

}
