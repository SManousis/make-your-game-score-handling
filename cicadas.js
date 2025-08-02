import * as utils from './utils.js'
import { mario } from './mario.js'
import { gameArea, allEntities, updateScore } from './game.js'
import { moveAndCollide } from './physicsStep.js'
import * as game from './game.js'


//cicadas spawning
export let cicadas = [];

export function spawnCicada(x, y) {
    const cicadaElement = document.createElement('img')
    cicadaElement.className = 'cicada-img';
    cicadaElement.src = 'assets/enemies/cicada.png';
    gameArea.appendChild(cicadaElement);

    const newCicada = {
        name: "cicada",
        health: 8,
        damage: 10,
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
        scoreValue: 15,
    };

    cicadas.push(newCicada);
    allEntities.push(newCicada);
    game.groundedEnemies.push(newCicada)
}

function cicadaUpdate(cicada) {
    //dead
    if (cicada.health <= 0) {
        if (game.audio.sounds) {
            game.audio.manager.playSample("bubble", {
                gain: game.audio.soundsVolume,
                pan: game.audio.xToPan(cicada.x),
                throttleMs: 60,
                pitchRandom: [0.98, 1.02]
            });
        }
        deleteCicada(cicada)
        updateScore(cicada.scoreValue);
    }


    if (cicada.state === 'walking') {
        let marioIsOnTheRight = mario.x - cicada.x >= 0;


        if (marioIsOnTheRight) {
            cicada.velX = cicada.maxspeed;
            cicada.lookingDir = "right";
        } else {
            cicada.velX = -cicada.maxspeed;
            cicada.lookingDir = "left";
        }
        
        //check for other cicadas in the way
        const detectionDistance = cicada.width * 0.8

        for (const groundedEnemy of game.groundedEnemies) {
            if (groundedEnemy === cicadas || Math.abs(groundedEnemy.y - cicadas.y) > 1) continue;

            if (cicadas.velX > 0 && groundedEnemy.x > cicadas.x) {
                const distance = groundedEnemy.x - cicadas.x;
                if (distance < detectionDistance) {

                    cicadas.velX = 0;
                    if (distance == 0) {
                        cicadas.velX = Math.random() * 100
                    }
                    break;
                }
            } else if (cicadas.velX < 0 && groundedEnemy.x < cicadas.x) {
                const distance = cicadas.x - groundedEnemy.x;
                if (distance < detectionDistance) {

                    cicadas.velX = 0;
                    if (distance == 0) {
                        cicadas.velX = Math.random() * 100
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
        if (utils.IsBodyCollidingWithUnit(BodyPart, mario)) {
            isColliding = true;
            break;
        }
    }

    if ((cicada.state === 'walking' || cicada.state === 'jumping') && isColliding) {

        //check if collision was Mario jumping on cicada
        if (mario.y > cicada.y + (cicada.height / 1.5)) {
            // console.log("cicada disabled")
            cicada.state = "disabled"
            mario.velY = 22;
            if (game.audio.sounds) {
                game.audio.manager.playSample("bubble", {
                    gain: game.audio.soundsVolume,
                    pan: game.audio.xToPan(cicada.x),
                    throttleMs: 60,
                    pitchRandom: [0.98, 1.02]
                });
            }

            setTimeout(() => {
                deleteCicada(cicada)
            }, 300)
        } else {
            mario.takeDamage(cicada.damage, cicada.x, "cicada_hit")
        }
    }
}

function deleteCicada(cicada) {
    utils.destroyUnit(cicada)
}

function cicadaVisuals(cicada) {
    if (!cicada.dom) return;

    cicada.dom.style.setProperty('--cicada-x', `${cicada.x}px`)
    cicada.dom.style.setProperty('--cicada-y', `${cicada.y}px`)

    if (cicada.lookingDir === 'left') {
        cicada.dom.style.setProperty('--cicada-scale-x', `-1`)
    } else {
        cicada.dom.style.setProperty('--cicada-scale-x', `1`)
    }

    if (cicada.state === "disabled") {
        cicada.dom.style.height = '20px'
        cicada.dom.style.opacity = '0.7'
    }
}
