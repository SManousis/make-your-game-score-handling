import * as utils from "./utils.js"

export function createBullet(x, y) {
    let bulletBody = document.createElement("img");
    bulletBody.className = "bullet-img";
    bulletBody.src = "assets/enemies/lazer.png";
    document.getElementById("game-area").appendChild(bulletBody);

    let bullet = {
        damage: 20,
        x: x,
        y: y,
        velX: 0,
        velY: 3,
        touched: false,
        disabled: false,
        body: [utils.createCircle(x, y, 10), utils.createRect(x, y+10, 10, 10)],
        updateFunc: function() { bulletUpdate(this) },
        drawFunc: function() { bulletVisuals(this) },
        dom: bulletBody,
    }
    return bullet
}

export function bulletUpdate(bullet) {
    utils.moveUnit(bullet, 0, bullet.velY)
    if (bullet.y < 0){
        bullet.disabled = true
        bullet.dom.remove()
    }
    if (bullet.touched){
        bullet.disabled = true
        bullet.dom.remove()
    }
}

export function bulletVisuals(bullet) {
    bullet.dom.style.opacity = "100%";
    bullet.dom.style.setProperty('--bullet-x', `${bullet.x}px`);
    bullet.dom.style.setProperty('--bullet-y', `${-bullet.y}px`);
}