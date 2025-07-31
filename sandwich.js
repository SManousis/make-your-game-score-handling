import * as utils from './utils.js'
import { gameArea, allEntities, removeFromAllEntities } from './game.js';
import { mario } from './mario.js';
import { moveAndCollide } from './physicsStep.js';

export function shootSandwich(dir, vendX, vendY) {
    if (Math.random() > 0.15) {
        return
    }
    const state = Math.random() < 0.7 ? 'friend' : 'enemy';
    const sandwichElement = document.createElement('img');
    sandwichElement.className = 'sandwich-img';
    if (state === 'friend') {
        sandwichElement.src = 'assets/items/sandwich.png'
    } else {
        sandwichElement.src = 'assets/items/rotten_sandwich.png'
    }
    gameArea.appendChild(sandwichElement);

    const randomSign = dir === 'left' ? -1 : 1;
    const velX = utils.getRandomInt(5, 20) * randomSign
    const velY = utils.getRandomInt(10, 25)

    const newSandwich = {
        name: "sandwich",
        health: +Infinity,
        lifeSpan: 500,
        damage: 50,
        maxspeed: 1.5,
        gravity: 0.8,
        state: state, //friend, enemy, disabled
        velX: velX,
        velY: velY,
        x: vendX,
        y: vendY,
        width: 50,
        height: 50,
        body: [
            utils.createCircle(vendX + 25, vendY + 25, 25)
        ],
        drawFunc: function () { sandwichVisuals(this) },
        updateFunc: function () { sandwichUpdate(this) },
        physicsPointsOffsets: [
            { x: (-120 / 2) + 1, y: 0 }, // Left foot
            { x: (120 / 2) + 1, y: 0 }  // Right foot
        ],
        dom: sandwichElement,
        team: "player",
        type: "healthItem"
    };
    allEntities.push(newSandwich);
}

function sandwichUpdate(newSandwich) {
    newSandwich.lifeSpan -= 1;
    if (newSandwich.lifeSpan <= 0) {

        removeSandwich(newSandwich);
        return;
    }

    for (const BodyPart of newSandwich.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, mario)) {
            if (newSandwich.state === 'friend') {
                mario.healthUpgrade(newSandwich.damage, "catching_sandwich")
            } else {
                mario.takeDamage(newSandwich.damage, newSandwich.x, "turtle_hit")
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

