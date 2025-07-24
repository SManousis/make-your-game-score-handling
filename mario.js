import * as utils from './utils.js'
import { walkables } from './walkables.js'
import { keysPressed, gameArea, gameState, updateMenuVisibility } from './game.js'
import * as physics from './physicsStep.js'
import * as bullets from './bullets.js'

export const marioDiv = document.getElementById('mario');

const FIRE_RATE = 30;
let fireCooldown = 0;

//the character the player controls
export let mario = {
    name: "mario",
    health: 100, //how much health point he has, if it reaches 0 he dies!
    attack_damage: 10, //how damage marios bullets deal to enemies
    accel: 1, //how quickly accelerates in x axis
    maxSpeed: 10, //maximum running speed in x axis
    jump_power: 17,
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
    isInvincible: false,
    invincibilityTimer: 0,
    body: [utils.createCircle(100, 100 + 20, 20), utils.createCircle(100, 100 + 20 + 40, 20), utils.createCircle(100-30, 100 + 20, 30), utils.createCircle(100+30, 100 + 20, 30)], //his gameplay body represented in circles
    physicsPointsOffsets: [{ x: -20, y: 0 }, { x: 20, y: 0 }], //These points will be used
    drawFunc: marioVisuals, //his visual representation in the game
    updateFunc: marioUpdate,
    team: "player",
    takeDamage: function (damage, sourceX) {
        if (this.isInvincible) {
            return;
        }
        this.health -= damage;
        const KNOCKBACK_VERTICAL = 13;
        const KNOCKBACK_HORIZONTAL = 20;
        this.velY = KNOCKBACK_VERTICAL;
        if (this.x < sourceX) {
            this.velX -= KNOCKBACK_HORIZONTAL;
        } else {
            this.velX += KNOCKBACK_HORIZONTAL;
        }
        this.isInvincible = true;
        this.invincibilityTimer = 40;
    },
    reset() {
        this.x = 100;
        this.y = 100;
        this.health = 100;
        this.velY = 0;
        this.disabled = false;
        this.body.forEach(body => body.div.remove());
        this.body = [utils.createCircle(100, 100 + 20, 20), utils.createCircle(100, 100 + 20 + 40, 20), utils.createCircle(100-30, 100 + 20, 30), utils.createCircle(100+30, 100 + 20, 30)];
        this.bullet_count=1;
    }
}





export let currentBody = document.getElementById("mario-body-forward")
export let currentLegs = document.getElementById("mario-legs0")
export let marioFeetFrames = ["mario-legs0", "mario-legs1", "mario-legs2", "mario-legs3", "mario-legs3"]
export function marioVisuals() {
    if (mario.crouching) {
        mario.body[0].active = false;
        mario.body[1].active = false;
        mario.body[2].active = true;
        mario.body[3].active = true;
    } else {
        mario.body[0].active = true;
        mario.body[1].active = true;
        mario.body[2].active = false;
        mario.body[3].active = false;
    }
    if (mario.isInvincible && Math.floor(mario.invincibilityTimer / 6) % 2 === 0) {
        currentBody.style.display = 'none'
        currentLegs.style.display = 'none'
        return;
    } else {
        currentBody.style.display = 'block'
        currentLegs.style.display = 'block'
    }
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
    if (mario.isInvincible) {
        mario.invincibilityTimer--;
        if (mario.invincibilityTimer <= 0) {
            mario.isInvincible = false;
        }
    }
    if (mario.health <= 0) {
        gameState.currentState = 'gameOver'
        updateMenuVisibility();
        console.log("mario died")
    }

    if (keysPressed.upgrade){
        mario.bullet_count++
        keysPressed.upgrade = false
    }

    if (keysPressed.right) {
        mario.lookingDir = "right"
        mario.aimDirection = "right"
    } else if (keysPressed.left) {
        mario.lookingDir = "left"
        mario.aimDirection = "left"
    }

    if (keysPressed.up) {
        mario.lookingUp = true
        mario.aimDirection = "up"
    } else {
        mario.lookingUp = false
        mario.aimDirection = mario.lookingDir
    }


    if (keysPressed.autofire) {
        fireCooldown--;
        if (fireCooldown <= 0) {
            marioShoot();
            fireCooldown = FIRE_RATE;
        }

    }

    // add x acceleration
    let impulse = mario.accel
    // if (!grounded) {
    //   impulse = mario.accel / 1.5 //to make aerial x axis acceleration harder than grounded
    // }
    if (keysPressed.left) {
        if (mario.velX > -mario.maxSpeed) {
            mario.velX -= impulse
        }
    }

    if (keysPressed.right && !mario.is) {
        if (mario.velX < mario.maxSpeed) {
            mario.velX += impulse
        }
    }


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

// Helper function to generate symmetric spread values
function getSpreadValues(count) {
    const result = [];
    const odd = count % 2 == 1

    const spread = 50 / (1+(count/100))

    if (odd) {
        count--
        result.push(0)
    }
    for (let i = 1; i <= count / 2; i++) {
        if (!odd && i == 1) {
            result.push(i * spread/2)
            result.push(-i * spread/2)
        } else {
            result.push(i * spread)
            result.push(-i * spread)
        }

    }

    return result;
}

export function marioShoot() {
    const spreadValues = getSpreadValues(mario.bullet_count);
    console.log(spreadValues)
    
    let yCorrection = 40;
    if (mario.crouching)  {
        yCorrection = yCorrection - 22
    }
    if (mario.aimDirection === 'left') {
        for (const offset of spreadValues) {
            bullets.createBullet(
                mario.aimDirection,
                "player",
                mario.x - 40,
                mario.y + yCorrection + offset, // Apply spread on Y
                14,
                8
            );
        }

    } else if (mario.aimDirection === 'right') {
        for (const offset of spreadValues) {
            bullets.createBullet(
                mario.aimDirection,
                "player",
                mario.x + 40,
                mario.y + yCorrection + offset, // Apply spread on Y
                14,
                8
            );
        }
        
    } else if (mario.aimDirection === 'up') {
        for (const offset of spreadValues) {
            bullets.createBullet(
                mario.aimDirection,
                "player",
                mario.x + offset, // Apply spread on X
                mario.y + 100,
                14,
                8
            );
        }
    }
}

export function updateMarioHealthBar(current, max) {
    const healthBar = Math.max(0, current/max)*100
    document.getElementById('mario-healthBar').style.width = healthBar + '%'
}