// Static vending machine. Feels colide
// Spits random items
import * as utils from './utils.js'
import { gameArea, allEntities, audio } from './game.js';
import { shootSandwich } from './sandwich.js'
import { createBomb } from './explosion.js';

const shootSandwichDebounce = utils.opDebounce(shootSandwich, 300, { leading: true })



export function createVendingStatic() {
    const vendingElement = document.createElement('img');
    vendingElement.className = 'vending-img';
    vendingElement.src = 'assets/enemies/machine.svg'
    gameArea.appendChild(vendingElement);

    //choose randomly between left and right

    const newVending = {
        name: "vending",
        health: 1000,
        damage: 50,
        maxspeed: 1.5,
        gravity: 0.8,
        state: 'friendly', //friendly, badMother, disabled
        velX: 0,
        velY: 0,
        x: 1600,
        y: 400,
        width: 200,
        height: 200,
        body: [
            utils.createRect(1625, 265, 125, 160)
        ],
        drawFunc: function () { vendingVisuals(this) },
        updateFunc: function () { vendingUpdate(this) },
        physicsPointsOffsets: [
            { x: (-120 / 2) + 1, y: 0 }, // Left foot
            { x: (120 / 2) + 1, y: 0 }  // Right foot
        ],
        dom: vendingElement,
        team: "enemy",
        takeDamage: function (damage, sourceX, sound) {
                // if (audio.sounds) {
                //     audio.manager.playSample(sound, {
                //         gain: audio.soundsVolume,
                //         pan: audio.xToPan(this.x, gameArea.offsetWidth),
                //         throttleMs: 60,
                //         pitchRandom: [0.98, 1.02]
                //     });
                // }
                switch (this.state){
                    case "badMother":
                        this.health -= damage;
                        break;
                    case 'friendly':
                        console.log("I was shot at !")
                        if (Math.round(Math.random()*13) == 0 ){
                            shootSandwich('left', this.x, this.y)
                        }else if (Math.round(Math.random()*5) == 0 ){
                            let count = Math.round(Math.random()*4)+3
                            for (let i = 0; i < count; i++){
                                createBomb(this.x, this.y-50, -(Math.random()*15+1), (Math.random()*15+10), 'enemy', 20, 200, 10, true, true, false, 'assets/items/rotten_sandwich.svg')
                            }
                        }
                        break;
                }
                
            },
    };

    allEntities.push(newVending);

    //push to allentities
}

function vendingVisuals() {

}


function vendingUpdate(vending) {
    
}

