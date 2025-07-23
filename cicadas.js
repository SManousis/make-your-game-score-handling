import * as utils from './utils.js'
import { mario } from './mario.js'
import { gameArea, allEntities } from './game.js'
import { moveAndCollide } from './physicsStep.js'

//cicadas spawning
export let cicadas = [];
let DEAD_ZONE = 40;
let spawnCooldown = 0;
const max_cicadas=2;

export function spawner() {
    spawnCooldown--;
    if (spawnCooldown <= 0 && cicadas.length < max_cicadas) {
        spawnCicada();
        spawnCooldown = getRandomInt();
    }
}

function spawnCicada() {
    const cicadaElement = document.createElement('img')
    cicadaElement.className = 'cicada-img';
    cicadaElement.src = 'assets/enemies/cicada.png';
    gameArea.appendChild(cicadaElement);

    //choose randomly between left and right
    const spawnSide = Math.random() < 0.5 ? 'left' : 'right';
    const startX = spawnSide === 'left' ? -50 : gameArea.offsetWidth + 50;
    const startY = 1000;

    const newCicada = {
        maxspeed: 0.5,
        gravity: 0.5,
        state: 'walking', //walking, defeated
        velX: 0,
        velY: 0,
        jump_power: 20,
        horizontal_jump_power: 10,
        jumpCooldown: 0,
        x: startX,
        y: startY,
        width: 80,
        height: 50,
        lookingDir: spawnSide === 'left' ? 'right' : 'left',
        body: [
            utils.createRect(startX-(120/2),startY,120,45)
        ],
        drawFunc: function () { cicadaVisuals(this) },
        updateFunc: function () { cicadaUpdate(this) },
        physicsPointsOffsets: [
            { x: -35, y: 0 }, // Left foot
            { x: 35, y: 0 }  // Right foot
        ],
        dom: cicadaElement,
    };

    cicadas.push(newCicada);
    allEntities.push(newCicada);
}

function cicadaUpdate(cicada) {
    if (cicada.state === 'walking' || cicada.state == 'jumping') {
        let dx = mario.x - cicada.x;

        cicada.jumpCooldown--;
        if (cicada.jumpCooldown <= 0) {
            // console.log("cicada jumping")
            cicada.velY= cicada.jump_power * (Math.random()+0.8);
            if (dx > 0){
                cicada.velX = cicada.horizontal_jump_power * (Math.random()+0.8)
            }else{
                cicada.velX = -(cicada.horizontal_jump_power * (Math.random()+0.8))
            }
            cicada.jumpCooldown = getRandomInt();
            cicada.state = 'jumping'
        }
        
        if (Math.abs(dx) > DEAD_ZONE) {
            if (dx > 0) {
                cicada.velX = cicada.maxspeed;
                cicada.lookingDir = "right";
            } else {
                cicada.velX = -cicada.maxspeed;
                cicada.lookingDir = "left";
            }
        }


        //check for other cicadas in the way
        const detectionDistance=cicada.width*0.8

        for (const otherCicada of cicadas){
            if (otherCicada===cicada)continue;

            if (cicada.velX>0 && otherCicada.x>cicada.x){
                const distance=otherCicada.x-cicada.x;
                if (distance<detectionDistance){
                    cicada.velX=otherCicada.velX; 
                    break;
                }
            } else if (cicada.velX<0 && otherCicada.x<cicada.x){
                const distance=cicada.x-otherCicada.x;
                if (distance<detectionDistance){
                    cicada.velX=otherCicada.velX;
                    break
                }
            }
        }


    } if (cicada.state = "flying"){

    }
    else {
        cicada.velX = 0; //stop moving if defeated
    }


    const grounded = moveAndCollide(cicada);

    if (grounded){
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
        if (mario.velY < 0 && mario.y < cicada.y + (cicada.height / 2)) {
            // console.log("cicada defeated")
            cicada.state = "defeated"
            mario.velY = 12;

            //make cicada disappear after a moment
            setTimeout(() => {
                if (cicada.dom) cicada.dom.remove();
                cicada.body.forEach(b => { if (b.div) b.div.remove(); })
                cicadas = cicadas.filter(t => t !== cicada);
            }, 300)
        } else {
            // console.log("Mario was hurt by a cicada")
            //inflict damage on Mario
        }
    }

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

    if (cicada.state === "defeated") {
        cicada.dom.style.height = '20px'
        cicada.dom.style.opacity = '0.7'
    }
}

function getRandomInt(min = 60, max = 360) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}