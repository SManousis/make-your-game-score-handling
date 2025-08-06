// Static vending machine. Feels colide
// Spits random items
import * as utils from './utils.js'
import { gameArea, allEntities, audio, updateScore } from './game.js';
import { shootSandwich } from './sandwich.js'
import { createBomb } from './explosion.js';

const shootSandwichDebounce = utils.opDebounce(shootSandwich, 300, { leading: true })



export function createVending(x = 1600, y = 270) {
    const vendingElement = document.createElement('img');
    vendingElement.className = 'vending-img';
    vendingElement.src = 'assets/enemies/machine.png'
    gameArea.appendChild(vendingElement);

    //choose randomly between left and right

    const Vending = {
        name: "vending",
        health: 1000,
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
        vendTakeOff: false,
        takeDamage: function (damage, sourceX, sound) {
            // if (audio.sounds) {
            //     audio.manager.playSample(sound, {
            //         gain: audio.soundsVolume,
            //         pan: audio.xToPan(this.x, gameArea.offsetWidth),
            //         throttleMs: 60,
            //         pitchRandom: [0.98, 1.02]
            //     });
            // }
            switch (this.state) {
                case "badMother":
                    this.health -= damage;
                    break;
                case 'friendly':
                    console.log("I was shot at !")
                    if (Math.round(Math.random() * 5) == 0) {
                        shootSandwich('left', this.x - 10, this.y + 20)
                    } else if (Math.round(Math.random() * 1) == 0) {
                        let count = Math.round(Math.random() * 20) + 3
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

    allEntities.push(Vending);

    //push to allentities
    return Vending
}

function vendingVisuals(entity) {
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

    vending.dom.src = 'assets/enemies/vendingBoss.png'

    if (vending.flySequence < 100) {
        return
    }

    if (vending.flySequence < 220) {
        utils.setUnit(vending, utils.lerp(vending.x, 100, 0.03), utils.lerp(vending.y, 700, 0.03))

        return
    }



    if (vending.flySequence < 310) {
        vending.health = 100
        return
    }

    if (vending.health <= 0) {
        utils.destroyUnit(vending)
        updateScore(10000);
    }



    vending.uniCounter += 0.04

    vending.velY = Math.sin(vending.uniCounter) * 3
    vending.velX = (Math.sin(vending.uniCounter / 2.2)) * 13
    console.log(Math.sin(vending.uniCounter))

    utils.moveUnit(vending, vending.velX, vending.velY)

}

