import * as utils from "./utils.js"
import * as mario from "./mario.js"
import { allEntities, removeFromAllEntities } from './game.js'

//dirTypes can be down, up, right, left, target
//team = player, enemy
export function createBullet(dirType, team, x, y, speed, damage = 10, targetX = 0, targetY = 0) {
    let bulletBody = document.createElement("img");
    bulletBody.className = "bullet-img";
    bulletBody.src = "assets/enemies/lazer.png";
    document.getElementById("game-area").appendChild(bulletBody);

    switch (dirType) {
        case "down":
            targetX = x
            targetY = y - 1
            break
        case "left":
            targetX = x - 1
            targetY = y
            break
        case "right":
            targetX = x + 1
            targetY = y
            break
        case "up":
            targetX = x
            targetY = y + 1
            break
    }

    const dx = targetX - x
    const dy = targetY - y

    const len = Math.sqrt(dx * dx + dy * dy)

    const velX = (dx / len) * speed
    const velY = (dy / len) * speed

    let bullet = {
        damage: damage,
        dir:dirType,
        x: x,
        y: y,
        velX: velX,
        velY: velY,
        touched: false,
        disabled: false,
        body: [utils.createCircle(x, y, 10), utils.createRect(x, y + 10, 10, 10)],
        updateFunc: function () { bulletUpdate(this) },
        drawFunc: function () { bulletVisuals(this) },
        dom: bulletBody,
        team: team,
    }
    allEntities.push(bullet);
    allBullets.push(bullet);
    return bullet
}

export function bulletUpdate(bullet) {
    utils.moveUnit(bullet, bullet.velX, bullet.velY)
    if (bullet.y < 0) {
        bullet.disabled = true
        bullet.dom.remove()
        removeFromAllBullets(bullet)
        removeFromAllEntities(bullet)
        return;
    }
    if (bullet.touched) {
        bullet.disabled = true
        bullet.dom.remove()
        removeFromAllBullets(bullet)
        removeFromAllEntities(bullet)
        return;
    }
    if (bullet.disabled) {
        bullet.dom.remove()
        removeFromAllBullets(bullet)
        removeFromAllEntities(bullet)
        return;
    }
}

export function bulletVisuals(bullet) {
    bullet.dom.style.opacity = "100%";
    bullet.dom.style.setProperty('--bullet-x', `${bullet.x}px`);
    bullet.dom.style.setProperty('--bullet-y', `${-bullet.y}px`);

    if (bullet.dir === 'left') {
        bullet.dom.style.setProperty('--bullet-rotation', '-90deg');
    } else if (bullet.dir === 'right') {
        bullet.dom.style.setProperty('--bullet-rotation', '90deg');
    }
}

export let allBullets = [];

export function removeFromAllBullets(entity){
    allBullets = allBullets.filter(t => t !== entity);
}