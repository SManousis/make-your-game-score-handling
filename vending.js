// Static vending machine. Feels colide
// Spits random items
import * as utils from './utils.js';
import { gameArea, gameState, audio, updateScore } from './game.js';
import { shootSandwich } from './sandwich.js'
import { createBomb } from './explosion.js';
import { createBullet } from './bullets.js';

const shootSandwichDebounce = utils.opDebounce(shootSandwich, 300, { leading: true })



export function createVending(x = 1600, y = 290) {
    const vendingElement = document.createElement('img');
    vendingElement.className = 'vending-img';
    vendingElement.src = 'assets/enemies/machine.svg'
    document.getElementById('stage-resources').appendChild(vendingElement);

    //choose randomly between left and right

    const Vending = {
        name: "vending",
        health: 4000,
        damage: 50,
        maxspeed: 1.5,
        gravity: 0.8,
        state: 'friendly', //friendly, badMother, disabled
        velX: 0,
        velY: 0,
        x: x,
        xStart: x,
        y: y,
        yStart: y,
        width: 200,
        height: 200,
        flySequence: 0,
        uniCounter: 0,
        attackTimer: 120,
        attackType: 'none',
        attackCounter: 0,
        body: [
            utils.createRect(x, y, 125, 160)
        ],
        drawFunc: function () { vendingVisuals(this) },
        updateFunc: function () { vendingUpdate(this) },
        physicsPointsOffsets: [
            { x: (-120 / 2) + 1, y: 0 }, // Left foot
            { x: (120 / 2) + 1, y: 0 }  // Right foot
        ],
        dom: vendingElement,
        team: "enemy",
        prevAttack: '',
        vendTakeOff: false,
        takeDamage: function (damage, sourceX, sound) {
            if (audio.sounds) {
                audio.manager.playSample("destroy_fly", {
                    gain: audio.soundsVolume,
                    pan: audio.xToPan(this.x, gameArea.offsetWidth),
                    throttleMs: 60,
                    pitchRandom: [0.98, 1.02]
                });
            }
            switch (this.state) {
                case "badMother":
                    this.health -= damage;
                    break;
                case 'friendly':
                    if (Math.round(Math.random() * 5) == 0) {
                        shootSandwich('left', this.x - 10, this.y + 20)
                    } else if (Math.round(Math.random() * 20) == 0) {
                        let count = Math.round(Math.random() * 4) + 3
                        for (let i = 0; i < count; i++) {
                            createBomb(this.x, this.y + 20, -(Math.random() * 15 + 2), (Math.random() * 20 + 10), 'enemy', 20, 300, 10, true, true, false, 'assets/items/rotten_sandwich.svg')
                        }
                        createBomb(this.x, this.y + 20, 1, 20, 'enemy', 20, 300, 10, true, true, false, 'assets/items/rotten_sandwich.svg')
                        createBomb(this.x, this.y + 20, 2, 15, 'enemy', 20, 300, 10, true, true, false, 'assets/items/rotten_sandwich.svg')
                    }
                    break;
            }

        },
    };

    gameState.allEntities.push(Vending);

    //push to allentities
    return Vending
}

function vendingVisuals(entity) {
    entity.dom.style.opacity = '1';
    entity.dom.style.setProperty('--x', `${entity.x}px`);
    entity.dom.style.setProperty('--y', `${-entity.y}px`);
}



function vendingUpdate(vending) {
    if (vending.state != 'badMother') {
        return
    }

    if (audio.sounds && !vending.vendTakeOff) {
        audio.manager.playSample("vending_rising", {
            gain: audio.soundsVolume,
            throttleMs: 60,
        });
        vending.vendTakeOff = true;
    }

    vending.flySequence += 1

    vending.dom.src = 'assets/enemies/vendingBoss.svg'

    if (vending.flySequence < 100) {
        return
    }

    if (vending.flySequence < 220) {
        utils.setUnit(vending, utils.lerp(vending.x, 100, 0.03), utils.lerp(vending.y, 700, 0.03))

        return
    }



    if (vending.flySequence < 310) {
        vending.health = 80
        return
    }

    if (vending.health <= 0) {
        utils.destroyUnit(vending)
        updateScore(10000);
    }



    vending.uniCounter += 0.04

    vending.velY = Math.sin(vending.uniCounter) * 3
    vending.velX = (Math.sin(vending.uniCounter / 2.2)) * 13


    utils.moveUnit(vending, vending.velX, vending.velY)

    if (vending.attackType == 'none') {
        vending.attackTimer -= 1
    }

    if (vending.attackTimer <= 0) {
        vending.attackTimer = 100 + Math.random() * 50

        vending.attackType = utils.returnRandomElement(['carpet', 'homing', 'balls', 'bigbomb'])
        while (vending.attackType == vending.prevAttack) {
            vending.attackType = utils.returnRandomElement(['carpet', 'homing', 'balls', 'bigbomb'])
        }
    }

    // console.log(vending.attackType, vending.attackTimer)
    if (vending.attackType != 'none') {
        vending.attackCounter++
        vending.prevAttack = vending.attackType
        switch (vending.attackType) {
            case 'carpet': //many bombs down in a row
                if (vending.attackCounter % 30 == 0) {
                    createBomb(vending.x, vending.y, 0, 0, 'enemy', 20, 100, 100, true, true, false, 'assets/items/rotten_sandwich.svg')
                }
                if (vending.attackCounter == 400) {
                    vending.attackCounter = 0
                    vending.attackType = 'none'
                }
                break;

            case 'homing': //lazers towards mario
                if (vending.attackCounter % 30 == 0) {
                    createBullet('target', 'enemy', 'sandwich', vending.x, vending.y, 10, 10, gameState.mario.x, gameState.mario.y)
                    createBullet('target', 'enemy', 'sandwich', vending.x - 20, vending.y, 10, 10, gameState.mario.x - 200 - (Math.random() * 30), gameState.mario.y)
                    createBullet('target', 'enemy', 'sandwich', vending.x + 20, vending.y, 10, 10, gameState.mario.x + 200 + (Math.random() * 30), gameState.mario.y)
                }
                if (vending.attackCounter == 400) {
                    vending.attackCounter = 0
                    vending.attackType = 'none'
                }
                break;

            case 'balls': //bouncing balls
                const l = [123, 143, 185, 205]
                if (l.includes(vending.attackCounter)) {
                    const count = Math.round(Math.random() * 3) + 2
                    for (let i = 0; i < count; i++) {
                        createBullet('target', 'enemy', 'sphere', vending.x, vending.y, 5 + Math.random() * 10, 10, vending.x + (Math.random() - 0.5) * 0.5, vending.y + -0.020, true, true)
                    }
                }
                if (vending.attackCounter == 60 * 11) {
                    vending.attackCounter = 0
                    vending.attackType = 'none'
                }
                break;

            case 'bigbomb': //big slow falling atomic bomb
                if (vending.attackCounter == 100) {
                    const b = createBomb(vending.x, vending.y, 0, -3.5, 'enemy', 1000, 900, 1000, true, true, false, 'assets/items/bomb.svg', 0)
                    b.dom.style.width = '300px'
                    b.dom.style.height = '300px'
                }
                if (vending.attackCounter == 60 * 4) {
                    vending.attackCounter = 0
                    vending.attackType = 'none'
                }
                break;
        }
    }
}

