import * as utils from "./utils.js"
import * as mario from "./mario.js"
import { allEntities, gameArea, audio } from './game.js'
import * as walkables from './walkables.js'

//dirTypes can be down, up, right, left, target
//team = player, enemy



export function createBullet(dirType, team, bulletType, x, y, speed, damage = 10, targetX = 0, targetY = 0, bounceEdges = false, penetrateWalkable = false) {
    let bulletBody = document.createElement("img");
    bulletBody.className = "bullet-img";

    let bodyWidth = 10;
    let bodyHeight = 55;

    let bulletPhysicsBody = 0
    let [bodyX, bodyY] = [0, 0];
    switch (bulletType) {
        case 'lazer':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 10;
            bodyHeight = 55;

            bulletBody.src = "assets/projectiles/lazer.svg";
            bulletBody.style.width = bodyWidth + 'px';
            bulletBody.style.height = bodyHeight + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createRect(bodyX, bodyY, bodyWidth, bodyHeight)

            break;

        case 'bullet':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 20;
            bodyHeight = 40;

            bulletBody.src = "assets/projectiles/pistol_bullet.svg";
            bulletBody.style.width = bodyWidth + 'px';
            bulletBody.style.height = bodyHeight + 'px';
            bulletBody.style.bottom = -3 + 'px';
            bulletBody.style.left = 5 + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createRect(bodyX, bodyY, bodyWidth, bodyHeight)

            break;

        case 'heart':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 15;
            bodyHeight = 70;

            bulletBody.src = "assets/projectiles/heartArrow.svg";
            bulletBody.style.width = bodyWidth + 10 + 'px';
            bulletBody.style.height = bodyHeight + 20 + 'px';
            bulletBody.style.bottom = -5 + 'px';
            bulletBody.style.left = 3 + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createRect(bodyX, bodyY, bodyWidth, bodyHeight)

            break;

        case 'sphere':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 30;
            bodyHeight = 30;
            bulletBody.src = "assets/projectiles/sphere.svg";
            bulletBody.style.width = bodyWidth + 10 + 'px';
            bulletBody.style.height = bodyHeight + 10 + 'px';
            bulletBody.style.bottom = -30 + 'px';
            bulletBody.style.left = 3 + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createCircle(bodyX, bodyY, (bodyWidth / 2))

            break;

        case 'sandwich':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 30;
            bodyHeight = 30;
            bulletBody.src = "assets/items/rotten_sandwich.svg";
            bulletBody.style.width = bodyWidth + 20 + 'px';
            bulletBody.style.height = bodyHeight + 20 + 'px';
            bulletBody.style.bottom = -25 + 'px';
            bulletBody.style.left = 0 + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createCircle(bodyX, bodyY, (bodyWidth / 2))

            break;

        case 'pacman':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 40;
            bodyHeight = 40;

            bulletBody.src = "assets/projectiles/pacman-bullet.svg";
            bulletBody.style.width = 55 + 'px';
            bulletBody.style.height = 55 + 'px';
            bulletBody.style.bottom = -30 + 'px';
            bulletBody.style.left = -3 + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createCircle(bodyX, bodyY, (bodyWidth / 2))

            break;
        case 'poo':
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 30;
            bodyHeight = 30;

            bulletBody.src = "assets/projectiles/poo.svg";
            bulletBody.style.width = 55 + 'px';
            bulletBody.style.height = 55 + 'px';
            bulletBody.style.bottom = -30 + 'px';
            bulletBody.style.left = -3 + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createCircle(bodyX, bodyY, (bodyWidth / 2))

            break;

        default:
            [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];
            bodyWidth = 10;
            bodyHeight = 55;

            bulletBody.src = "assets/projectiles/lazer.svg";
            bulletBody.style.width = bodyWidth + 'px';
            bulletBody.style.height = bodyHeight + 'px';

            if (dirType == "left" || dirType == 'right') {
                [bodyWidth, bodyHeight] = [bodyHeight, bodyWidth]
            }
            bulletPhysicsBody = utils.createRect(bodyX, bodyY, bodyWidth, bodyHeight)

            break;
    }


    document.getElementById("game-area").appendChild(bulletBody);



    [bodyX, bodyY] = [x - (bodyWidth / 2), y + 10 - (bodyHeight / 2)];

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
        body: [bulletPhysicsBody],
        updateFunc: function () { bulletUpdate(this) },
        drawFunc: function () { bulletVisuals(this) },
        dom: bulletBody,
        team: team,
        type: "bullet",
        bounceEdges: bounceEdges,
        penetrateWalkable: penetrateWalkable,
    }
    allEntities.push(bullet);
    allBullets.push(bullet);

    if (audio.sounds) {
        if (team === "player") {
            audio.manager.playSample("lazer", {
                gain: audio.soundsVolume,
                pan: audio.xToPan(bullet.x, gameArea.offsetWidth),
                throttleMs: 60,
                pitchRandom: [0.98, 1.02]
            });
        } else {
            audio.manager.playSample("lazer_short", {
                gain: audio.soundsVolume,
                pan: audio.xToPan(bullet.x, gameArea.offsetWidth),
                throttleMs: 60,
                pitchRandom: [0.98, 1.02]
            });
        }
    }
    return bullet
}

export function bulletUpdate(bullet) {
    utils.moveUnit(bullet, bullet.velX, bullet.velY)

    if (bullet.bounceEdges){
        if (bullet.x < 0 || bullet.x > document.getElementById('game-area').offsetWidth){
            bullet.velX = -bullet.velX
        }
    }

    if (bullet.y < -30 || bullet.x < -30 || bullet.y > gameArea.offsetHeight + 20 || bullet.x > gameArea.offsetWidth + 20) {
        utils.destroyUnit(bullet)
        return;
    }

    if (bullet.touched) {
        bullet.disabled = true
        utils.destroyUnit(bullet)
        return;
    }

    if (!bullet.penetrateWalkable){
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

