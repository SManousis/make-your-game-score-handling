import * as utils from './utils.js'
import { gameState, updateScore } from './game.js'
import { moveAndCollide } from './physicsStep.js'





export function spawnCicada(x, y) {
    const cicadaElement = document.createElement('img')
    cicadaElement.className = 'cicada-img';
    cicadaElement.src = 'assets/enemies/cicada.svg';
    document.getElementById('stage-resources').appendChild(cicadaElement);

    const newCicada = {
        name: "cicada",
        health: 8,
        damage: 5,
        maxspeed: 0.5,
        gravity: 0.5,
        state: 'walking', //walking, disabled
        velX: 0,
        velY: 0,
        jump_power: 15,
        horizontal_jump_power: 4,
        jumpCooldown: 0,
        x: x,
        y: y,
        width: 80,
        height: 50,
        lookingDir: 'left',
        body: [
            utils.createRect(x - (120 / 2), y, 120, 45)
        ],
        drawFunc: function () { cicadaVisuals(this) },
        updateFunc: function () { cicadaUpdate(this) },
        physicsPointsOffsets: [
            { x: -35, y: 0 }, // Left foot
            { x: 35, y: 0 }  // Right foot
        ],
        dom: cicadaElement,
        team: "enemy",
        scoreValue: 0,
        destroySound: "bubble",
    };

    gameState.cicadas.push(newCicada);
    gameState.allEntities.push(newCicada);
    gameState.groundedEnemies.push(newCicada)
}

function cicadaUpdate(cicada) {
    //dead
    if (cicada.health <= 0) {
        deleteCicada(cicada)
        updateScore(cicada.scoreValue);
    }


    if (cicada.state === 'walking') {
        let marioIsOnTheRight = gameState.mario.x - cicada.x >= 0;


        if (marioIsOnTheRight) {
            cicada.velX = cicada.maxspeed;
            cicada.lookingDir = "right";
        } else {
            cicada.velX = -cicada.maxspeed;
            cicada.lookingDir = "left";
        }
        
        //check for other cicadas in the way
        const detectionDistance = cicada.width * 0.8

        for (const groundedEnemy of gameState.groundedEnemies) {
            if (groundedEnemy === cicada || Math.abs(groundedEnemy.y - cicada.y) > 1) continue;

            if (cicada.velX > 0 && groundedEnemy.x > cicada.x) {
                const distance = groundedEnemy.x - cicada.x;
                if (distance < detectionDistance) {

                    cicada.velX = 0;
                    if (distance == 0) {
                        cicada.velX = Math.random() * 100
                    }
                    break;
                }
            } else if (cicada.velX < 0 && groundedEnemy.x < cicada.x) {
                const distance = cicada.x - groundedEnemy.x;
                if (distance < detectionDistance) {

                    cicada.velX = 0;
                    if (distance == 0) {
                        cicada.velX = Math.random() * 100
                    }
                    break
                }
            }
        }

        cicada.jumpCooldown--;
        if (cicada.jumpCooldown <= 0) {
            // console.log("cicada jumping")
            cicada.velY = cicada.jump_power * (Math.random() + 0.6);
            if (marioIsOnTheRight) {
                cicada.velX = cicada.horizontal_jump_power * (Math.random() + 0.6)
            } else {
                cicada.velX = -(cicada.horizontal_jump_power * (Math.random() + 0.6))
            }
            cicada.jumpCooldown = utils.getRandomInt();
            cicada.state = 'jumping'
        }


    } else if (cicada.state == 'jumping') {

    } else {
        cicada.velX = 0; //stop moving if disabled
    }


    const grounded = moveAndCollide(cicada);

    if (grounded) {
        cicada.state = 'walking'
    } else {
        cicada.state = 'jumping'
    }

    let isColliding = false;
    for (const BodyPart of cicada.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, gameState.mario)) {
            isColliding = true;
            break;
        }
    }

    if ((cicada.state === 'walking' || cicada.state === 'jumping') && isColliding) {

        //check if collision was Mario jumping on cicada
        if (gameState.mario.y > cicada.y + (cicada.height / 1.7)) {
            // console.log("cicada disabled")
            cicada.state = "disabled"
            gameState.mario.velY = 22;
            deleteCicada(cicada, 300)
        } else {
            gameState.mario.takeDamage(cicada.damage, cicada.x, "cicada_hit")
        }
    }
}

function deleteCicada(cicada, timeout=0) {
    utils.destroyUnit(cicada, timeout)
}

function cicadaVisuals(cicada) {
    if (!cicada.dom) return;

    cicada.dom.style.setProperty('--x', `${cicada.x}px`)
    cicada.dom.style.setProperty('--y', `${-cicada.y}px`)

    if (cicada.lookingDir === 'left') {
        cicada.dom.style.setProperty('--scale-x', `-1`)
    } else {
       
        cicada.dom.style.setProperty('--scale-x', `1`)
    }

    if (cicada.state === "disabled") {
        cicada.dom.style.height = '20px'
        cicada.dom.style.opacity = '0.7'
    }
}
