import * as utils from './utils.js'
import * as walkables from './tilesMap.js'
import { keysPressed, gameArea, gameState, audio, triggerGameOver, lifeLostFanfare } from './game.js'
import * as physics from './physicsStep.js'
import * as bullets from './bullets.js'

export const marioDiv = document.getElementById('mario');

const FIRE_RATE = 30;
let fireCooldown = 0;


//the character the player controls
export function createMario(x = 500, y = 500) {
    mario = {
        name: "mario",
        health: 100,
        maxhealth: 120, //how much health point he has, if it reaches 0 he dies!
        attack_damage: 10, //how damage marios bullets deal to enemies
        accel: 1, //how quickly accelerates in x axis
        maxSpeed: 10, //maximum running speed in x axis
        jump_power: 17,
        state: "standing", //crouch, standing, airborne, dead
        gravity: 0.8, //the speed that which he is pushed down while airborne
        drag: 1.2, //how much mario slows downs in x axis if he's not actively walking left or right
        bullet_count: bullets, //how many bullets mario will fire
        multibulletTimer: 0,
        bombs: bombs,
        aimDirection: "left", //left, right, up
        velX: 0, //his current velocity in x axis
        velY: 0, //his current velocity in y axis
        x: 0, //his current x position
        y: 0, //his current y position
        lookingDir: "left", //which direction mario is looking at
        lookingUp: false,
        walkCounter: 0, //a counter that counts for how many frames mario has been walking towards a direction, for walk animation purposes
        crouching: false,
        isInvincible: false,
        invincibilityTimer: 0,
        body: [utils.createCircle(0, 0 + 20, 20), utils.createCircle(0, 0 + 20 + 40, 20), utils.createCircle(0 - 30, 0 + 20, 30), utils.createCircle(0 + 30, 0 + 20, 30)], //his gameplay body represented in circles
        physicsPointsOffsets: [{ x: -20, y: 0 }, { x: 20, y: 0 }], //These points will be used
        drawFunc: function () { marioVisuals(this) }, //his visual representation in the game
        updateFunc: marioUpdate,
        team: "player",
        dom: marioDiv,
        takeHitSounds: [
            "mario_hit1", "mario_hit1", "mario_hit1", "mario_hit1", "mario_hit1",
            "mario_hit2", "mario_hit2", "mario_hit2", "mario_hit2", "mario_hit2",
            "mario_hit3", "mario_hit3", "mario_hit3", "mario_hit3", "mario_hit3",
            "mario_hit4_rare"],
        jumpSounds: [
            "mario_jump1",
            "mario_jump2",
            "mario_jump3",
        ],
        getRandomHitSound(sounds) {
            return sounds[Math.floor(Math.random() * sounds.length)];
        },
        takeDamage: function (damage, sourceX, sound) {
            if (this.isInvincible) {
                return;
            }
            if (audio.sounds) {
                if (!sound) sound = this.getRandomHitSound(this.takeHitSounds);
                // TODO: Throtlle this
                audio.playSampleDeb(sound, {
                    gain: audio.soundsVolume,
                    pan: audio.xToPan(this.x, gameArea.offsetWidth),
                    throttleMs: 60,
                });
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
        applyPowerUp: function (type, value, sound) {
            if (audio.sounds) {
                audio.manager.playSample(sound, {
                    gain: audio.soundsVolume,
                    pan: audio.xToPan(this.x, gameArea.offsetWidth),
                    throttleMs: 60,
                    pitchRandom: [0.98, 1.02]
                });
            };
            switch (type) {
                case 'health':
                    this.health += value;
                    if (this.health > this.maxhealth) this.health = this.maxhealth;

                    break;
                case 'bomb':
                    this.bombs += value;
                    break;
                case 'multibullet':

                    this.multibulletTimer = 600;
                    this.bullet_count = 4
                    break;
            }
        }
        // reset() {
        //     this.x = 500;
        //     this.y = 500;
        //     this.health = 100;
        //     this.velX = 0;
        //     this.velY = 0;
        //     this.disabled = false;
        //     this.body.forEach(body => body.div.remove());
        //     this.body = [utils.createCircle(0, 0 + 20, 20), utils.createCircle(0, 0 + 20 + 40, 20), utils.createCircle(0-30, 0 + 20, 30), utils.createCircle(0+30, 0 + 20, 30)];
        //     this.bullet_count = 1;
        //     this.dom.innerHTML = "";
        //     const defaultBody = document.getElementById("mario-body-forward").cloneNode(true);
        //     const defaultLegs = document.getElementById("mario-legs0").cloneNode(true);
        //     this.dom.appendChild(defaultLegs);
        //     this.dom.appendChild(defaultBody);
        //     this.currentBody = defaultBody;
        //     this.currentLegs = defaultLegs;

        //     this.currentBody.style.opacity = "100%"
        //     this.currentBody.style.setProperty('--mario-x', `${this.x}px`);
        //     this.currentBody.style.setProperty('--mario-y', `${-this.y}px`);

        //     this.currentLegs.style.opacity = "100%"
        //     this.currentLegs.style.setProperty('--mario-x', `${this.x}px`);
        //     this.currentLegs.style.setProperty('--mario-y', `${-this.y}px`);
        // }


    }
    gameState.allEntities.push(mario)
}

utils.setUnit(mario, 500, 500)



export let currentBody = document.getElementById("mario-body-forward")
export let currentLegs = document.getElementById("mario-legs0")
export let marioFeetFrames = ["mario-legs0", "mario-legs1", "mario-legs2", "mario-legs3", "mario-legs3"]
export function marioVisuals(mario) {
    if (mario.health <= 0) {
        currentBody.style.opacity = '0%'
        currentLegs.style.opacity = '0%'
        currentBody = document.getElementById('mario-dead-body')

        currentBody.style.opacity = "100%"
        currentBody.style.setProperty('--mario-x', `${mario.x}px`);
        currentBody.style.setProperty('--mario-y', `${-mario.y}px`);
    }
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
    if (mario.isInvincible && Math.floor(mario.invincibilityTimer / 4) % 2 === 0) {
        currentBody.style.opacity = '0%'
        currentLegs.style.opacity = '0%'
        return;
    } else {
        currentBody.style.opacity = '100%'
        currentLegs.style.opacity = '100%'
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

        gameState.lives -= 1
        lifeLostFanfare();
        mario.health = 100
        if (gameState.lives === 0) {
            triggerGameOver();

            console.log("mario died")
        }
    }

    if (mario.multibulletTimer > 0) {
        mario.multibulletTimer--;
    }
    if (mario.multibulletTimer <= 0) {
        mario.bullet_count = 1
    }

    // if (keysPressed.upgrade) {
    //     mario.bullet_count = 4
    //     keysPressed.upgrade = false
    // }

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
    if (keysPressed.left && !keysPressed.down) {
        if (mario.velX > -mario.maxSpeed) {
            mario.velX -= impulse
        }
    }

    if (keysPressed.right && !mario.is && !keysPressed.down) {
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






    //don't allow mario to move past screen bounds
    if (mario.x <= 0) {
        utils.setUnit(mario, 0, mario.y);
        if (mario.velX < 0) { // Only kill velocity if moving INTO the wall
            mario.velX = 0;
        }
    }
    if (mario.x >= gameArea.offsetWidth) {
        utils.setUnit(mario, gameArea.offsetWidth, mario.y);
        if (mario.velX > 0) { // Only kill velocity if moving INTO the wall
            mario.velX = 0;
        }
    }
    if (mario.y < 0) {
        utils.setUnit(mario, mario.x, 0);
        if (mario.velY < 0) { // Only kill velocity if moving INTO the wall
            mario.velY = 0;
        }
    }

    // Top of screen check
    if (mario.y > gameArea.offsetHeight) {
        utils.setUnit(mario, mario.x, gameArea.offsetHeight);
        mario.velY = 0;
    }

    let grounded = physics.moveAndCollide(mario)

    //if mario on the ground and jump button pressed
    if (keysPressed.space && grounded) {
        mario.velY += mario.jump_power
        if (audio.sounds) {
            audio.manager.playSample(mario.getRandomHitSound(mario.jumpSounds), {
                gain: audio.soundsVolume,
                pan: audio.xToPan(mario.x, gameArea.offsetWidth),
                throttleMs: 60,
                pitchRandom: [0.98, 1.02]
            });
        }
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

    const spread = 50 / (1 + (count / 100))

    if (odd) {
        count--
        result.push(0)
    }
    for (let i = 1; i <= count / 2; i++) {
        if (!odd && i == 1) {
            result.push(i * spread / 2)
            result.push(-i * spread / 2)
        } else {
            result.push(i * spread)
            result.push(-i * spread)
        }

    }

    return result;
}

export function marioShoot() {
    const spreadValues = getSpreadValues(mario.bullet_count);


    let yCorrection = 40;
    if (mario.crouching) {
        yCorrection = yCorrection - 22
    }
    if (mario.aimDirection === 'left') {
        for (const offset of spreadValues) {
            bullets.createBullet(
                mario.aimDirection,
                "player",
                'bullet',
                mario.x - 40,
                mario.y + yCorrection + offset + 20, // Apply spread on Y
                14,
                8
            );
        }

    } else if (mario.aimDirection === 'right') {
        for (const offset of spreadValues) {
            bullets.createBullet(
                mario.aimDirection,
                "player",
                'bullet',
                mario.x + 40,
                mario.y + yCorrection + offset + 20, // Apply spread on Y
                14,
                8
            );
        }

    } else if (mario.aimDirection === 'up') {
        for (const offset of spreadValues) {
            bullets.createBullet(
                mario.aimDirection,
                "player",
                'bullet',
                mario.x + offset, // Apply spread on X
                mario.y + 100,
                14,
                8
            );
        }
    }
}

export function updateMarioHealthBar(current, max) {
    const healthBar = Math.max(0, current / max) * 100
    document.getElementById('mario-healthBar').style.width = healthBar + '%'
    if (mario.health <= 20) {
        document.getElementById('mario-healthBar').style.background = '#f00';
    } else if (mario.health <= 40) {
        document.getElementById('mario-healthBar').style.background = '#ff0';
    } else {
        document.getElementById('mario-healthBar').style.background = '#0f0';
    }
}