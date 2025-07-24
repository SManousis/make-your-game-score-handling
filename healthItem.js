import * as utils from "./utils.js";
import * as game from "./game.js";
import * as physics from "./physicsStep.js";

export let healthItems = [];


export function createHealthItem(x, y, healthAdd = 0){
    let healthItemBody = document.createElement("img");
    healthItemBody.className = "health-item-img";
    healthItemBody.src = "assets/items/healthCandy.png";
    document.getElementById("game-area").appendChild(healthItemBody);

    let healthItem = {
        x: x,
        y: y,
        gravity: 0.8,
        velY: -1,
        velX: 0,
        healthAdd: healthAdd,
        body: [utils.createCircle(x, y+10, 15)],
        updateFunc: function() { healthItemUpdate(this) },
        drawFunc: function() { healthItemVisuals(this) },
        dom: healthItemBody,
        team: "player",
        physicsPointsOffsets: [{ x: 0, y: 0 }],
    }
    console.log("Health item was created at ", x, y)
    healthItems.push(healthItem)
    game.allEntities.push(healthItem);
        return healthItem
}

export function healthItemUpdate(healthItem) {
    physics.moveAndCollide(healthItem, 0, 1)
    setTimeout(() => {
        healthItem.dom.remove()
        healthItem.body.forEach(body => body.div.remove())
        const idx = game.allEntities.indexOf(healthItem);
        if (idx !== -1) game.allEntities.splice(idx, 1);
    }, 10000)
}

export function healthItemVisuals(healthItem) {
    healthItem.dom.style.opacity = "100%";
    healthItem.dom.style.setProperty('--health-item-x', `${healthItem.x}px`);
    healthItem.dom.style.setProperty('--health-item-y', `${-healthItem.y}px`);
}
