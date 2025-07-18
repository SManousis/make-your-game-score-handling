import * as mario from './mario.js'
import * as floaters from './floaters.js'
//import * as walkables from './walkables.js'
//import * as lasers from './lasers'
//import * as utils from './utils.js'

let gameState = {
    currentState: 'running', //'paused','gameover','running'
    score: 0
}

let allEntities = []


export const gameArea = document.getElementById('game-area');

//adding our created entities to allEntities if they are not static
allEntities.push(mario.mario)


allEntities.push(floaters.floaterCircle)
allEntities.push(floaters.floaterRect)

//keeps track of which buttons are currently held down
export const keysPressed = {
    left: false,
    right: false,
    up: false,

    down: false,
    space: false,
};



// Listen for key presses
document.addEventListener('keydown', (event) => {
    if (event.key === 'p') {
        if (gameState.currentState === 'running') {
            gameState.currentState === 'paused';
        } else if (gameState.currentState === 'paused') {
            gameState.currentState = 'running';
        }
    }
    if (event.key === 'ArrowLeft') {
        keysPressed.left = true;
    }

    if (event.key === 'ArrowRight') {
        keysPressed.right = true;
    }

    if (event.key === 'ArrowUp') {
        keysPressed.up = true;
    }

    if (event.key === 'ArrowDown') {
        keysPressed.down = true;
    }

    if (event.key === ' ' || event.code === 'Space') {
        keysPressed.space = true
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        keysPressed.left = false;
    }

    if (event.key === 'ArrowRight') {
        keysPressed.right = false;
    }

    if (event.key === 'ArrowUp') {
        keysPressed.up = false;
    }

    if (event.key === 'ArrowDown') {
        keysPressed.down = false;
    }

    if (event.key === ' ' || event.code === 'Space') {
        keysPressed.space = false
    }

});


let counter = 0
let prev = 0

// The main game loop
function gameLoop() {
    console.log(gameState.currentState)
    if (gameState.currentState === 'running') {
        update(); 
    }
    draw(); //this still needs to work on pause so the screen doesn't go blank
    counter++
    requestAnimationFrame(gameLoop);
}

function show() {
    // console.log(mario.body)
    // console.log(counter-prev)
    prev = counter
}

setInterval(show, 1000)

// Update the game state, only physics
function update() {
    // mario movement

    //running all entities' update function
    for (let entity of allEntities) {
        entity.updateFunc()
    }


    // // Laser movement
    // for (let i = lasers.length - 1; i >= 0; i--) {
    //   const laser = lasers[i];
    //   laser.position.y -= laserSpeed;

    //   if (laser.position.y < 0) {
    //     laser.element.remove();
    //     lasers.splice(i, 1);
    //   }
    // }
}

// Draw the game, only updating visual elements based on their objects
function draw() {

    for (let entity of allEntities) {
        //body debug visual update
        for (const circle of entity.body) {
            circle.div.style.left = circle.x + 'px';
            circle.div.style.bottom = circle.y + 'px';
        }

        if (entity.drawFunc != undefined) {
            entity.drawFunc()
        }
    }
}

// Start the game
gameLoop();