import * as utils from "./utils.js";
import * as game from "./game.js";
import * as physics from "./physicsStep.js";

export let powerUps = [];


export function createPowerUp(x, y, value=0, type="health", graphic="healthCandy") {
    let powerUpBody = document.createElement("img");
    powerUpBody.className = "health-item-img";
    powerUpBody.src = `assets/items/${graphic}.svg`;
    document.getElementById("stage-resources").appendChild(powerUpBody);

    let powerUp = {
        x: x,
        y: y,
        gravity: 0.8,
        velY: -1,
        velX: 0,
        powerUpType: type, //health, bomb, multibullet
        value: value,
        body: [utils.createCircle(x, y + 10, 15)],
        updateFunc: function () { powerUpUpdate(this) },
        drawFunc: function () { powerUpVisuals(this) },
        dom: powerUpBody,
        team: "player",
        physicsPointsOffsets: [{ x: 0, y: 0 }],
        type: "powerUp",
    }
    // console.log("Health item was created at ", x, y)
    game.gameState.powerUps.push(powerUp)
    game.gameState.allEntities.push(powerUp);
    return powerUp;
}

export function powerUpUpdate(powerUp) {
    physics.moveAndCollide(powerUp, 0, 1)
    setTimeout(() => {
        powerUp.dom.remove()
        powerUp.body.forEach(body => body.div.remove())
        const idx = game.gameState.allEntities.indexOf(powerUp);
        if (idx !== -1) game.gameState.allEntities.splice(idx, 1);
    }, 10000)
}

export function powerUpVisuals(powerUp) {
    powerUp.dom.style.opacity = "100%";
    powerUp.dom.style.setProperty('--health-item-x', `${powerUp.x}px`);
    powerUp.dom.style.setProperty('--health-item-y', `${-powerUp.y}px`);
}
