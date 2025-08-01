import * as utils from "./utils.js"
import * as mario from "./mario.js"
import { allEntities, gameArea, sounds, soundsVolume } from './game.js'
import * as walkables from './walkables.js'
import * as audio from "./audio.js"

//dirTypes can be down, up, right, left, target
//team = player, enemy
export function createBullet(dirType, team, x, y, speed, damage = 10, targetX = 0, targetY = 0) {
    let bulletBody = document.createElement("img");
    bulletBody.className = "bullet-img";
    bulletBody.src = "assets/enemies/lazer.png";
    document.getElementById("game-area").appendChild(bulletBody);


    let bodyWidth = 10;
    let bodyHeight = 55;
    let [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];

    switch (dirType) {
        case "down":
            targetX = x
            targetY = y - 1
            break
        case "up":
            targetX = x
            targetY = y + 1
            break
        case "left":
            [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            bodyX = x - (bodyWidth / 2)
            bodyY = y + (bodyHeight / 2)
            targetX = x - 1
            targetY = y
            break
        case "right":
            [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]

            bodyX = x - (bodyWidth / 2)
            bodyY = y + (bodyHeight / 2)
            targetX = x + 1
            targetY = y
            break
    }

    const dx = targetX - x
    const dy = targetY - y

    const len = Math.sqrt(dx * dx + dy * dy)

    const velX = (dx / len) * speed
    const velY = (dy / len) * speed

    let bullet = {
        damage: damage,
        dir: dirType,
        x: x,
        y: y,
        velX: velX,
        velY: velY,
        touched: false,
        disabled: false,
        body: [utils.createRect(bodyX, bodyY, bodyWidth, bodyHeight)],
        updateFunc: function () { bulletUpdate(this) },
        drawFunc: function () { bulletVisuals(this) },
        dom: bulletBody,
        team: team,
        type: "bullet",
    }
    allEntities.push(bullet);
    allBullets.push(bullet);
    if (sounds) {
        if (team === "player") {
            audio.audioManager.playSample("lazer", {
                gain: soundsVolume,
                pan: audio.xToPan(bullet.x),
                throttleMs: 60,
                pitchRandom: [0.98, 1.02]
            });
        } else {
            audio.audioManager.playSample("lazer_short", {
                gain: soundsVolume,
                pan: audio.xToPan(bullet.x),
                throttleMs: 60,
                pitchRandom: [0.98, 1.02]
            });
        }
    }
    return bullet
}

export function bulletUpdate(bullet) {
    utils.moveUnit(bullet, bullet.velX, bullet.velY)

    if (bullet.y < -300 || bullet.x < -300 || bullet.y > gameArea.offsetHeight + 300 || bullet.x > gameArea.offsetWidth + 300) {
        utils.destroyUnit(bullet)
        return;
    }

    if (bullet.touched) {
        bullet.disabled = true
        utils.destroyUnit(bullet)
        return;
    }

    for (const walkable of walkables.walkables) {
        for (const walkableBody of walkable.body) {
            for (const body of bullet.body) {
                if (utils.IsBodyCollidingWithBody(body, walkableBody)) {
                    // console.log(`walkable touched ${entity.name}`)
                    bullet.disabled = true
                    bullet.dom.remove()
                    utils.destroyUnit(bullet)
                    return;
                }
            }
        }
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

