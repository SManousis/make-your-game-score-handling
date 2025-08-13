import * as utils from './utils.js'
import { gameState,updateScore } from './game.js'
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
    turtleElement.src = 'assets/enemies/caretta.svg'
    document.getElementById('stage-resources').appendChild(turtleElement);

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
        lookingDir: 'left',
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
        destroySound: "bubble",
    };


    gameState.turtles.push(newTurtle);
    gameState.allEntities.push(newTurtle);
    gameState.groundedEnemies.push(newTurtle)

    //push to allentities
}

// export function reset() {
//     // Remove turtles from allEntities
//     for (const turtle of turtles) {
//         utils.destroyUnit(turtle)
//     }
//     // Empty the turtles array
//     turtles.length = 0;
// }

function turtleUpdate(turtle) {
    if (turtle.health <= 0) {
        utils.destroyUnit(turtle)
        updateScore(turtle.scoreValue);
    }

    if (turtle.state === 'walking') {
        //follow Mario
        let dx = gameState.mario.x - turtle.x;


        if (dx > 0) {
            turtle.velX = turtle.maxspeed;
            turtle.lookingDir = "right";
        }
        else {
            turtle.velX = -turtle.maxspeed;
            turtle.lookingDir = "left";
        }


        //check for other turtles in the way
        const detectionDistance = turtle.width * 0.8

        for (const groundedEnemy of gameState.groundedEnemies) {
            if (groundedEnemy === turtle || Math.abs(groundedEnemy.y - turtle.y) > 1) continue;

            if (turtle.velX > 0 && groundedEnemy.x > turtle.x) {
                const distance = groundedEnemy.x - turtle.x;
                if (distance < detectionDistance) {

                    turtle.velX = 0;
                    if (distance == 0) {
                        turtle.velX = Math.random() * 100
                    }
                    break;
                }
            } else if (turtle.velX < 0 && groundedEnemy.x < turtle.x) {
                const distance = turtle.x - groundedEnemy.x;
                if (distance < detectionDistance) {

                    turtle.velX = 0;
                    if (distance == 0) {
                        turtle.velX = Math.random() * 100
                    }
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
        if (utils.IsBodyCollidingWithUnit(BodyPart, gameState.mario)) {
            isColliding = true;
            break;
        }
    }

    if (turtle.state === 'walking' && isColliding) {
        // console.log("mar.y", gameState.mario.y, "turt.y", (turtle.y + (turtle.height / 1.5)))
        //check if collision was Mario jumping on turtle
        if (gameState.mario.y > (turtle.y + 20)) {

            console.log("turtle disabled")
            turtle.state = "disabled"
            gameState.mario.velY = 12;
            updateScore(turtle.scoreValue);
            utils.destroyUnit(turtle, 300)
        } else {
            console.log("Mario was hurt by a turtle")
            //inflict damage on Mario
            gameState.mario.takeDamage(turtle.damage, turtle, "turtle_hit")
        }
    }

}


function turtleVisuals(turtle) {
    if (!turtle.dom) return;

       turtle.dom.style.setProperty('--x', `${turtle.x}px`);
    turtle.dom.style.setProperty('--y', `${-turtle.y}px`);

    if (turtle.lookingDir === 'left') {
        turtle.dom.style.setProperty('--scale-x', `-1`); 
    } else {
        turtle.dom.style.setProperty('--scale-x', `1`); 
    }

    if (turtle.state === "disabled") {
        turtle.dom.style.height = '20px'
        turtle.dom.style.opacity = '0.7'
    }
}