import { mario, marioShoot, updateMarioHealthBar } from './mario.js'
//import * as floaters from './floaters.js'
import * as cupids from './cupids.js'
import * as turtles from './turtles.js'
import * as cicadas from './cicadas.js'
import * as walkables from './walkables.js'
import * as bullets from './bullets.js'
import * as collision from './collision.js'
import { stage1, stageControllerTicker } from './stagecontroller.js'
import { createVendingStatic } from "./vending.js"
import { healthItems } from './healthItem.js'
import * as utils from "./utils.js"
import { ghosts } from './ghosts.js'
import { createBomb } from './explosion.js'
import { audioManager, track1, audioSetUp } from './audio.js'

//import * as lasers from './lasers'
//import * as utils from './utils.js'

const mainMenu = document.getElementById('main-menu');
const pauseMenu = document.getElementById('pause-menu');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverMenu = document.getElementById('game-over-menu');
const helpMenu = document.getElementById('help-menu');
const mainHelpButton = document.getElementById('main-help-button');
const pauseHelpButton = document.getElementById('pause-help-button');
const backFromHelpButton = document.getElementById('back-from-help-button');
const timeCounterElement = document.getElementById('time-counter');

const playButton = document.getElementById('play-button');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
//const backToMenuButton = document.getElementById('back-to-menu-button');
const leaderboardButton = document.getElementById('leaderboard-button');
const mainMuteButton = document.getElementById('main-mute-button');
const playMusicButtonMain = document.getElementById('play-music-button-main');
const playSoundsButtonMain = document.getElementById('play-sounds-button-main');
const playMusicButtonPause = document.getElementById('play-music-button-pause');
const playSoundsButtonPause = document.getElementById('play-sounds-button-pause');
const pauseMuteButton = document.getElementById('pause-mute-button');
const gameOverMuteButton = document.getElementById('game-over-mute-button');


export let gameState = {
    currentState: 'mainMenu', //'mainMenu', 'paused','gameover','running'
    previousState: '',
    score: 0,
    lives: 5,
    isMuted: false,
    frameCounter: 0,
    gameTime: 0,
    level: 1,
}

let lastTime = 0;

export let music = true;
export let sounds = true;
export let musicVolume = 1;
export let soundsVolume = 1;


export let allEntities = []
export let groundedEnemies = []
export let aoeDamage = []

export let allGroups = [allEntities, groundedEnemies, bullets.allBullets, cicadas.cicadas, cupids.cupids, turtles.turtles, healthItems, walkables.walkables, ghosts, aoeDamage]

export const gameArea = document.getElementById('game-area');

//adding our created entities to allEntities if they are not static
allEntities.push(mario)






export function updateMenuVisibility() {
    //hide all menus by default
    mainMenu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    gameOverMenu.classList.add('hidden');
    helpMenu.classList.add('hidden');

    if (gameState.currentState === 'mainMenu') {
        mainMenu.classList.remove('hidden');
    } else if (gameState.currentState === 'paused') {
        pauseMenu.classList.remove('hidden')
    } else if (gameState.currentState === 'gameOver') {
        gameOverMenu.classList.remove('hidden');
    } else if (gameState.currentState === 'help') {
        helpMenu.classList.remove('hidden');
    }
}



function restartGame() {

    for (let entity of allEntities) {
        if (entity.dom) entity.dom.remove();
        if (entity.body) entity.body.forEach(body => body.div.remove());
    }
    mario.reset();
    cupids.reset();
    allEntities = [];

    bullets.allBullets.length = 0;
    healthItems.lenght = 0;
    allEntities.push(mario)
    // spawnSwarm(30, cupids.createCupid, 5, 400)
    //whatever is needed to reset Mario 
    //whatever is needed to reset enemies

    for (const key in keysPressed) {
        keysPressed[key] = false;
    }

    gameState.gameTime = 0;
    gameState.score = 0;
    gameState.lives = 5;
    scoreElement.textContent = `Score: ${gameState.score}`;
    livesElement.textContent = `Lives: ${gameState.score}`;

    gameState.currentState = 'running';
    updateMenuVisibility();
    createVendingStatic();
    if (music) audioManager.playMusicLoop(track1.url, volume, track1.overlapDuration)
    stage1();
}


export function updateScore(points) {
    gameState.score += points;
    scoreElement.textContent = `Score: ${gameState.score}`;
}


//keeps track of which buttons are currently held down
export const keysPressed = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    autofire: false,
    upgrade: false,
};

//--- EVENT LISTENERS ----

// Main menu buttons
let audioInitialized = false;

playButton.addEventListener('click', async () => {
    if (!audioInitialized) {
        await audioSetUp();
        audioInitialized = true;
    }
    if (music) audioManager.playMusicLoop(track1.url, musicVolume, track1.overlapDuration);

    gameState.currentState = 'running';
    updateMenuVisibility();
});

leaderboardButton.addEventListener('click', () => {
    alert('Leaderboard coming soon!');
});

resumeButton.addEventListener('click', () => {
    if (music) audioManager.playMusicLoop(track1.url, musicVolume, track1.overlapDuration);
    gameState.currentState = 'running';
    updateMenuVisibility();
});

restartButton.addEventListener('click', () => {
    restartGame();
});

mainHelpButton.addEventListener('click', showHelpMenu);
pauseHelpButton.addEventListener('click', showHelpMenu);

backFromHelpButton.addEventListener('click', () => {
    // Go back to the screen we were on before
    if (music) audioManager.playMusicLoop(track1.url, musicVolume, track1.overlapDuration);
    gameState.currentState = gameState.previousState;
    updateMenuVisibility();
});

document.querySelectorAll('#back-to-menu-button').forEach(btn => {
    btn.addEventListener('click', () => {
        gameState.currentState = 'mainMenu';
        updateMenuVisibility();
    });
});

document.querySelectorAll('#restart-button').forEach(btn => {
    btn.addEventListener('click', () => {
        restartGame();
    });
});

function showHelpMenu() {
    gameState.previousState = gameState.currentState; // IMPORTANT: Remember where we came from
    gameState.currentState = 'help';
    audioManager.pauseMusic();
    updateMenuVisibility();
}

function toggleMute() {
    gameState.isMuted = !gameState.isMuted;
    const muteText = gameState.isMuted ? "Unmute Sound" : "Mute Sound";
    mainMuteButton.textContent = muteText;
    pauseMuteButton.textContent = muteText;
    gameOverMuteButton.textContent = muteText;
    //add actual muting logic
}
mainMuteButton.addEventListener('click', toggleMute);
pauseMuteButton.addEventListener('click', toggleMute);
gameOverMuteButton.addEventListener('click', toggleMute);

playMusicButtonMain.addEventListener('click', () => {
    music = !music;
});

playSoundsButtonMain.addEventListener('click', () => {
    sounds = !sounds;
});

playMusicButtonPause.addEventListener('click', () => {
    music = !music;
});

playSoundsButtonPause.addEventListener('click', () => {
    sounds = !sounds;
});



// Listen for key presses
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'p' && (gameState.currentState === 'running' || gameState.currentState === 'paused')) {
        if (gameState.currentState === 'running') {

            gameState.currentState = 'paused';
            audioManager.pauseMusic();

        } else if (gameState.currentState === 'paused') {
            gameState.currentState = 'running';
            audioManager.playMusicLoop("./assets/audio/mario.mp3")

        }
        updateMenuVisibility();
    }
    if (event.key.toLowerCase() === 'a') {
        keysPressed.autofire = !keysPressed.autofire;
    }

    if (event.key.toLowerCase() === 'u') {
        keysPressed.upgrade = !keysPressed.upgrade;
    }

    if (event.key.toLocaleLowerCase() === 'f') {
        marioShoot();
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
function gameLoop(currentTime) {

    if (lastTime === 0) {
        lastTime = currentTime; //initialize on first frame
    }
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;


    // console.log("Drawing frame", counter);
    // console.log(gameState.currentState)
    if (gameState.currentState === 'running') {
        gameState.gameTime += deltaTime;
        update();
    }

    if (gameState.currentState === 'running' || gameState.currentState === 'paused' || gameState.currentState === 'gameOver') {
        draw();
    }
    counter++

    requestAnimationFrame(gameLoop);
}

let updateCounter = 0
let updateCounterTimestamp = Date.now()
let fpsMeter = 0
// Update the game state, only physics
function update() {
    updateCounter++
    if (updateCounter == 30){
        updateCounter = 0
        fpsMeter = ((Date.now() - updateCounterTimestamp)/30)*60/16.666666
        updateCounterTimestamp = Date.now()
    }
    // mario movement

    // console.log(groundedEnemies)



    collision.healthItemPicked(mario) // checks if mario touched a health item//collision.isShot(mario);

    //running all entities' update function
    for (let entity of allEntities) {
        if (aoeDamage.length > 0 && (entity.team == 'enemy' || entity.team == 'player') && Object.hasOwn(entity, 'health')) {

            collision.inAoe(entity)
        }

        if (entity.updateFunc) entity.updateFunc(entity);

        if (entity.type !== "healthItem" && entity.type !== "bullet") {
            collision.isShot(entity)
        }

        if (entity.name === "mario") {
            updateMarioHealthBar(entity.health, 100)
        }



    }

    gameState.frameCounter++

    stageControllerTicker()

}

// Draw the game, only updating visual elements based on their objects
export function draw() {
    const MarioHealthBar = document.getElementById('mario-healthBar-container');
    const totalSeconds = Math.floor(gameState.gameTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, '0');
    timeCounterElement.textContent = `Time: ${minutes}:${paddedSeconds} fps: ${parseInt(fpsMeter)} debug: ${cupids.cupids.length}, ${document.getElementById('debug-visuals').childElementCount}, ${aoeDamage.length}`;
    livesElement.textContent = `Lives: ${gameState.lives}`;
    MarioHealthBar.style.left = (mario.x - 30) + "px"; // tune offset
    MarioHealthBar.style.bottom = (mario.y + 90) + "px";
    if (mario.crouching) {
        MarioHealthBar.style.bottom = (mario.y + 60) + "px";
    }


    for (let entity of allEntities) {

        if (entity.drawFunc != undefined) {
            entity.drawFunc()
        }

        //body debug visual update
        for (const shape of entity.body) {
            if (shape.active == false) {
                shape.div.style.opacity = "20%"
            } else {
                shape.div.style.opacity = "100%"
            }
            // shape.div.style.left = shape.x + 'px';
            // shape.div.style.bottom = shape.y + 'px';
            shape.div.style.setProperty('--x', `${shape.x}px`);
            shape.div.style.setProperty('--y', `${-shape.y}px`);
            shape.div.bottom = 0
            shape.div.left = 0

        }



    }

}


updateMenuVisibility();

// spawnSwarm(30, cupids.createCupid, 5, 400)
// Start the game
gameLoop();

export function removeFromAllEntities(entity) {
    utils.removeUnitFromArray(entity, allEntities)
}
createVendingStatic()
stage1()

cupids.createCupid(500, 200, 0)
createBomb(800, 500)