import * as utils from './utils.js'
import { mario } from './mario.js'
import { gameArea, allEntities, removeFromAllEntities, updateScore } from './game.js'
import { moveAndCollide } from './physicsStep.js'

//turtle spawning
export let turtles = [];
export let DEAD_ZONE = 100;
let spawnCooldown = 0;
const SPAWN_RATE = 180; //spawn a new turtle every 180 frames/3 secs
const max_turtles = 5;

export function spawnTurtle(x, y) {
    const turtleElement = document.createElement('img');
    turtleElement.className = 'turtle-img';
    turtleElement.src = 'assets/enemies/caretta.png'
    gameArea.appendChild(turtleElement);

    const newTurtle = {
        name: "turtle",
        health: 8,
        damage: 5,
        maxspeed: 1.5,
        gravity: 0.8,
        state: 'walking', //walking, disabled
        velX: 0,
        velY: 0,
        x: x,
        y: y,
        width: 120,
        height: 120,
        lookingDir: spawnSide === 'left' ? 'right' : 'left',
        body: [
            utils.createRect(x - (120 / 2), y, 120, 45)
        ],
        drawFunc: function () { turtleVisuals(this) },
        updateFunc: function () { turtleUpdate(this) },
        physicsPointsOffsets: [
            { x: (-120 / 2) + 1, y: 0 }, // Left foot
            { x: (120 / 2) + 1, y: 0 }  // Right foot
        ],
        dom: turtleElement,
        team: "enemy",
        scoreValue: 10,
        type: "turtle",
    };


    turtles.push(newTurtle);
    allEntities.push(newTurtle);

    //push to allentities
}

function turtleUpdate(turtle) {
    if (turtle.health <= 0) {
        // if (turtle.dom) turtle.dom.remove();
        // turtle.body.forEach(b => { if (b.div) b.div.remove(); })
        // utils.removeUnitFromArray(turtle, turtles)
        // removeFromAllEntities(turtle)
        utils.destroyUnit(turtle)
        game.updateScore(turtle.scoreValue);
    }

    if (turtle.state === 'walking') {
        //follow Mario
        let dx = mario.x - turtle.x;

        if (Math.abs(dx) > DEAD_ZONE) {
            if (dx > 0) {
                turtle.velX = turtle.maxspeed;
                turtle.lookingDir = "right";
            }
            else {
                turtle.velX = -turtle.maxspeed;
                turtle.lookingDir = "left";
            }
        }

        //check for other turtles in the way
        const detectionDistance = turtle.width * 0.8

        for (const otherTurtle of turtles) {
            if (otherTurtle === turtle) continue;

            if (turtle.velX > 0 && otherTurtle.x > turtle.x) {
                const distance = otherTurtle.x - turtle.x;
                if (distance < detectionDistance) {
                    turtle.velX = otherTurtle.velX;
                    break;
                }
            } else if (turtle.velX < 0 && otherTurtle.x < turtle.x) {
                const distance = turtle.x - otherTurtle.x;
                if (distance < detectionDistance) {
                    turtle.velX = otherTurtle.velX;
                    break
                }
            }
        }


    } else {
        turtle.velX = 0; //stop moving if disabled
    }


    moveAndCollide(turtle);

    let isColliding = false;
    for (const BodyPart of turtle.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, mario)) {
            isColliding = true;
            break;
        }
    }

    if (turtle.state === 'walking' && isColliding) {

        //check if collision was Mario jumping on turtle
        if (mario.velY < 0 && mario.y < turtle.y + (turtle.height / 2)) {
            console.log("turtle disabled")
            turtle.state = "disabled"
            mario.velY = 12;
   
            updateScore(turtle.scoreValue);

            //make turtle disappear after a moment
            setTimeout(() => {
                // if (turtle.dom) turtle.dom.remove();
                // turtle.body.forEach(b => { if (b.div) b.div.remove(); })
                // utils.removeUnitFromArray(turtle, turtles)
                // removeFromAllEntities(turtle)
                utils.destroyUnit(turtle)

            }, 300)
        } else {
            console.log("Mario was hurt by a turtle")
            //inflict damage on Mario
            mario.takeDamage(turtle.damage, turtle.x)

        }
    }

}


function turtleVisuals(turtle) {
    if (!turtle.dom) return;

    turtle.dom.style.setProperty('--turtle-x', `${turtle.x}px`)
    turtle.dom.style.setProperty('--turtle-y', `${turtle.y}px`)

    if (turtle.lookingDir === 'left') {
        turtle.dom.style.setProperty('--turtle-scale-x', `-1`)
    } else {
        turtle.dom.style.setProperty('--turtle-scale-x', `1`)
    }

    if (turtle.state === "disabled") {
        turtle.dom.style.height = '20px'
        turtle.dom.style.opacity = '0.7'
    }
}