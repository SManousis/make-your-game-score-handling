import * as utils from './utils.js'
import { gameArea, allEntities,removeFromAllEntities } from './game.js';
import { mario } from './mario.js';
import { moveAndCollide } from './physicsStep.js';

export function shootSandwich(dir, vendX, vendY) {
    const sandwichElement = document.createElement('img');
    sandwichElement.className = 'sandwich-img';
    sandwichElement.src = 'assets/items/healthCandy.png'
    gameArea.appendChild(sandwichElement);

    const sndState = Math.random() < 0.5 ? 'friend' : 'enemy';
    const velXsign = dir === 'left' ? -1 : 1;

    const newSandwich = {
        name: "sandwich",
        health: +Infinity,
        lifeSpan: 500,
        damage: 50,
        maxspeed: 1.5,
        gravity: 0.8,
        state: sndState, //friend, enemy, disabled
        velX: 5 * velXsign,
        velY: 10,
        x: vendX,
        y: vendY,
        width: 50,
        height: 50,
        body: [
            utils.createCircle(vendX, vendY, 25)
        ],
        drawFunc: function () { sandwichVisuals(this) },
        updateFunc: function () { sandwichUpdate(this) },
        physicsPointsOffsets: [
            { x: (-120 / 2) + 1, y: 0 }, // Left foot
            { x: (120 / 2) + 1, y: 0 }  // Right foot
        ],
        dom: sandwichElement,
        team: "enemy",
    };
    allEntities.push(newSandwich);
}

function sandwichUpdate(newSandwich) {
    newSandwich.lifeSpan -= 1;
    if (newSandwich.lifeSpan <= 0) {
        mario.velY = 12;
        removeSandwich(newSandwich);
        return;
    }

    for (const BodyPart of newSandwich.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, mario)) {
            if (newSandwich.state === 'friend') {
                mario.health += newSandwich.damage
            } else {
                mario.health -= newSandwich.damage
            }
            removeSandwich(newSandwich);
            return;
        }
    }

    const grounded = moveAndCollide(newSandwich);
    if (grounded) {
        newSandwich.velX = 0;
    }
}

function sandwichVisuals(newSandwich) {
    if (!newSandwich.dom) return;

    newSandwich.dom.style.setProperty('--sandwich-x', `${newSandwich.x}px`)
    newSandwich.dom.style.setProperty('--sandwich-y', `${newSandwich.y}px`)

    if (newSandwich.state === "disabled") {
        newSandwich.dom.style.height = '20px'
        newSandwich.dom.style.opacity = '0.7'
    }
}

function removeSandwich(newSandwich) {
    newSandwich.state = "disabled"
    removeFromAllEntities(newSandwich)
    if (newSandwich.dom) newSandwich.dom.remove();
    newSandwich.body.forEach(b => { if (b.div) b.div.remove(); })
    removeFromAllEntities(newSandwich)
}

