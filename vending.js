// Static vending machine. Feels colide
// Spits random items
import * as utils from './utils.js'
import { gameArea, allEntities } from './game.js';

export function createVendingStatic() {
    console.log("create Vending")
    const vendingElement = document.createElement('img');
    vendingElement.className = 'vending-img';
    vendingElement.src = 'assets/enemies/machine.png'
    gameArea.appendChild(vendingElement);

    //choose randomly between left and right

    const newVending = {
        name: "vending",
        health: +Infinity,
        damage: 50,
        maxspeed: 1.5,
        gravity: 0.8,
        state: 'friendly', //friendly, badMother, disabled
        velX: 0,
        velY: 0,
        x: 1500,
        y: 900,
        width: 200,
        height: 200,
        body: [
            utils.createRect(1625, 10, 125, 200)
        ],
        drawFunc: function () { vendingVisuals(this) },
        updateFunc: function () { vendingUpdate(this) },
        physicsPointsOffsets: [
            { x: (-120 / 2) + 1, y: 0 }, // Left foot
            { x: (120 / 2) + 1, y: 0 }  // Right foot
        ],
        dom: vendingElement,
        team: "enemy",
    };

    allEntities.push(newVending);

    //push to allentities
}

function vendingVisuals() {

}

function vendingUpdate() {

}
