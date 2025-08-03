import { mario, marioShoot, updateMarioHealthBar } from './mario.js'
//import * as floaters from './floaters.js'
import * as cupids from './cupids.js'
import * as turtles from './turtles.js'
import * as cicadas from './cicadas.js'
import * as walkables from './walkables.js'
import * as bullets from './bullets.js'
import * as collision from './collision.js'
import { stage1, stageControllerTicker, removeEvent, addEvent, eventQueue } from './stagecontroller.js'
import { createVendingStatic } from "./vending.js"
import { healthItems } from './healthItem.js'
import * as utils from "./utils.js"
import * as ghosts from './ghosts.js'
import { createBomb, createExplosion } from './explosion.js'
import { AudioManager, xToPan } from './audio.js'
import { flowers } from './flowers.js'

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

const finalScoreElement = document.getElementById('final-score');
const finalTimeElement = document.getElementById('final-time');
const playerNameInput = document.getElementById('player-name-input');
const submitScoreButton = document.getElementById('submit-score-button');

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

export const audio = {
    music: true,
    sounds: true,
    musicVolume: 0.2,
    soundsVolume: 0.1,
    manager: new AudioManager({
        bubble: "./assets/audio/bubble.mp3",
        catching_sandwich: "./assets/audio/catching_sandwich.mp3",
        cicada_hit: "./assets/audio/cicada_hit.mp3",
        swarm: "./assets/audio/cicada_swarm.mp3",
        game_over: "./assets/audio/game_over.mp3",
        health_short: "./assets/audio/health_short.mp3",
        health: "./assets/audio/health.mp3",
        lazer_short: "./assets/audio/lazer_short.mp3",
        lazer: "./assets/audio/lazer.mp3",
        tick: "./assets/audio/time_tick.mp3",
        turtle_hit: "./assets/audio/turtle_hit.mp3",
        vending_rising: "./assets/audio/vending_rising.mp3",
    }, 4),
    tracks: [
        { url: "./assets/audio/mario.mp3", overlapDuration: 7.742 },
    ],
    initialized: false,
    xToPan: xToPan,
    setUp: async function () {
        this.manager.resume();
        await this.manager.loadSamples();
        await this.manager.getOrLoadMusicBuffer(this.tracks[0].url);
    }
}


export let allEntities = []
export let groundedEnemies = []
export let aoeDamage = []

export let allGroups = [allEntities, groundedEnemies, bullets.allBullets, cicadas.cicadas, cupids.cupids, turtles.turtles, healthItems, walkables.walkables, ghosts.ghosts, aoeDamage, flowers]

export const gameArea = document.getElementById('game-area');

export const queueFree = []

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

export let currentGameGen = 0;

function restartGame() {
    currentGameGen++; // In
    // crement at every restart

    for (let entity of allEntities) {
        if (entity.countdownDiv) {
            entity.countdownDiv.remove()
            utils.destroyUnit(entity)
        }
        if (entity.dom) entity.dom.remove();
        if (entity.body) entity.body.forEach(body => body.div.remove());
    }

    allEntities.length = 0;
    groundedEnemies.length = 0;
    ghosts.ghosts.length = 0;
    cupids.cupids.length = 0;
    cicadas.cicadas.length = 0;
    turtles.turtles.length = 0;
    bullets.allBullets.length = 0;
    healthItems.length = 0;

    eventQueue.length = 0;

    utils.setUnit(mario, 500, 500);
    mario.health = 100;
    allEntities.push(mario);

    for (const key in keysPressed) {
        keysPressed[key] = false;
    }

    gameState.gameTime = 0;
    gameState.score = 0;
    gameState.lives = 5;
    scoreElement.textContent = `Score: ${gameState.score}`;
    livesElement.textContent = `Lives: ${gameState.lives}`;

    gameState.currentState = 'running';
    updateMenuVisibility();

    if (audio.music) {
        audio.manager.playMusicLoop(audio.tracks[0].url, audio.musicVolume, audio.tracks[0].overlapDuration);
    } else {
        audio.manager.stopMusic();
    }

    //reset game over screen
    playerNameInput.value = '';
    submitScoreButton.disabled = false;
    submitScoreButton.textContent = 'Submit Score';

    stage1(currentGameGen);
    createBomb(800, 500),
        createBomb(300, 500) // pass currentGameGen here


}


export function updateScore(points) {
    gameState.score += points;
    scoreElement.textContent = `Score: ${gameState.score}`;
}

export function triggerGameOver() {
    //check so that it's not called multiple times
    if (gameState.currentState === 'gameOver') {
        return;
    }


    gameState.currentState = 'gameOver';

    finalScoreElement.textContent = gameState.score;
    finalTimeElement.textContent = utils.formatTime(gameState.gameTime);

    audio.manager.stopMusic();
    if (audio.sounds) audio.manager.playSample("game_over", { gain: audio.soundsVolume });

    updateMenuVisibility();
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
    bomb: false,
};

//--- EVENT LISTENERS ----

// Main menu buttons
playButton.addEventListener('click', async () => {
    if (!audio.initialized) {
        await audio.setUp();
        audio.initialized = true;
    }

    if (audio.music) {
        audio.manager.playMusicLoop(audio.tracks[0].url, audio.musicVolume, audio.tracks[0].overlapDuration);
    } else {
        audio.manager.stopMusic();
    }

    gameState.currentState = 'running';
    updateMenuVisibility();
});

leaderboardButton.addEventListener('click', () => {
    alert('Leaderboard coming soon!');
});

resumeButton.addEventListener('click', () => {
    if (audio.music) {
        audio.manager.playMusicLoop(audio.tracks[0].url, audio.musicVolume, audio.tracks[0].overlapDuration);
    } else {
        audio.manager.stopMusic();
    }

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
    gameState.currentState = gameState.previousState;
    updateMenuVisibility();
});

submitScoreButton.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();

    if (!playerName) {
        alert('Please enter your name')
        return;
    }

    //disable the button to prevent multiple submissions
    submitScoreButton.disabled = true;
    submitScoreButton.textContent = 'Submitting...';

    const scoreData = {
        name: playerName,
        score: gameState.score,
    };

    try {
        //TODO use real url
        const response = await fetch('https://actual_endpoint/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        });

        if (response.ok) {
            // The score was submitted successfully
            alert('Score submitted successfully!');
            submitScoreButton.textContent = 'Submitted!';
        } else {
            // The server responded with an error
            alert('Error submitting score. Please try again.');
            submitScoreButton.disabled = false; // Re-enable the button
            submitScoreButton.textContent = 'Submit Score';
        }
    } catch (error) {
        // A network error occurred
        console.error('API Error:', error);
        alert('Could not connect to the server. Please check your connection and try again.');
        submitScoreButton.disabled = false; // Re-enable the button
        submitScoreButton.textContent = 'Submit Score';
    }

})

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



const sliders = {
    music: [
        document.getElementById('music-slider-main'),
        document.getElementById('music-slider-pause')
    ],
    sounds: [
        document.getElementById('sounds-slider-main'),
        document.getElementById('sounds-slider-pause')
    ]
};

function syncSliders(changedSlider, type) {
    const value = parseFloat(changedSlider.value);
    if (type === 'music') {
        audio.musicVolume = value;
    } else {
        audio.soundsVolume = value;
    }
    // Update the other slider to stay in sync
    sliders[type].forEach(slider => {
        if (slider !== changedSlider) slider.value = value;
    });
}

sliders.music.forEach(slider => {
    slider.addEventListener('input', () => syncSliders(slider, 'music'));
});

sliders.sounds.forEach(slider => {
    slider.addEventListener('input', () => syncSliders(slider, 'sounds'));
});

function showHelpMenu() {
    gameState.previousState = gameState.currentState; // IMPORTANT: Remember where we came from
    gameState.currentState = 'help';
    audio.manager.pauseMusic();
    updateMenuVisibility();
}

const musicToggles = [
    document.getElementById('music-toggle-main'),
    document.getElementById('music-toggle-pause')
];

const soundsToggles = [
    document.getElementById('sounds-toggle-main'),
    document.getElementById('sounds-toggle-pause')
];

function syncToggles(changedToggle, group, setValue) {
    const newValue = changedToggle.checked;
    setValue(newValue);

    group.forEach(toggle => {
        if (toggle !== changedToggle) toggle.checked = newValue;
    });
}

// Event listeners for Music
musicToggles.forEach(toggle => {
    toggle.addEventListener('input', () => {
        syncToggles(toggle, musicToggles, val => audio.music = val);
        console.log('Music:', audio.music);
    });
});

// Event listeners for Sounds
soundsToggles.forEach(toggle => {
    toggle.addEventListener('input', () => {
        syncToggles(toggle, soundsToggles, val => audio.sounds = val);
        console.log('Sounds:', audio.sounds);
    });
});



// Listen for key presses
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'p' && (gameState.currentState === 'running' || gameState.currentState === 'paused')) {
        if (gameState.currentState === 'running') {
            gameState.currentState = 'paused';
            if (audio.music) audio.manager.pauseMusic();

        } else if (gameState.currentState === 'paused') {
            gameState.currentState = 'running';

            if (audio.music) {
                audio.manager.playMusicLoop(audio.tracks[0].url, audio.musicVolume, audio.tracks[0].overlapDuration);
            } else {
                audio.manager.stopMusic();
            }
        }
        updateMenuVisibility();
    }
    if (event.key.toLowerCase() === 'a') {
        keysPressed.autofire = !keysPressed.autofire;
    }

    if (event.key.toLowerCase() === 'u') {
        keysPressed.upgrade = !keysPressed.upgrade;
    }

    if (event.key.toLowerCase() === 'b') {
        if (keysPressed.bomb == false) {
            keysPressed.bomb = true
            createBomb(mario.x, mario.y, 'player', 500, 500, 2, true)
        }
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

    if (event.key.toLowerCase() === 'b') {
        keysPressed.bomb = false;
    }

    if (event.key === ' ' || event.code === 'Space') {
        keysPressed.space = false
    }



});


let counter = 0
let prev = 0



// The main game loop
let logicGameLoopTimeNow = Date.now()
function logicGameLoop() {
    if (gameState.currentState === 'running') {
        gameState.gameTime += 16.666666;
        update();
    }

    const diff = Date.now() - logicGameLoopTimeNow //is positive number, means update is early so next update needs to happen later, if negative
    logicGameLoopTimeNow = Date.now() + 16.666666 - diff

    counter++
    setTimeout(logicGameLoop, parseInt(16.666666 - diff))
}

// The main game loop
function visualGameLoop() {
    if (gameState.currentState === 'running' || gameState.currentState === 'paused' || gameState.currentState === 'gameOver') {
        draw();
    }
    requestAnimationFrame(visualGameLoop);
}


let updateCounter = 0
let updateCounterTimestamp = Date.now()
let updatefpsMeter = 0


// Update the game state, only physics
function update() {
    updateCounter++
    if (updateCounter == 30) {
        updateCounter = 0
        updatefpsMeter = 1000 / ((Date.now() - updateCounterTimestamp) / 30)
        updateCounterTimestamp = Date.now()
    }


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

    for (let unit of queueFree) {
        for (let group of allGroups) {
            utils.removeUnitFromArray(unit, group)
        }
        unit.body.forEach(b => { if (b.div) b.div.remove(); })
        if (unit.dom) unit.dom.remove();
    }
    queueFree.length = 0

    stageControllerTicker()

}

let drawCounter = 0
let drawCounterTimestamp = Date.now()
let drawfpsMeter = 0

// Draw the game, only updating visual elements based on their objects
export function draw() {
    drawCounter++
    if (drawCounter == 30) {
        drawCounter = 0
        drawfpsMeter = 1000 / ((Date.now() - drawCounterTimestamp) / 30)
        drawCounterTimestamp = Date.now()
    }


    const MarioHealthBar = document.getElementById('mario-healthBar-container');

    timeCounterElement.textContent = `Time: ${utils.formatTime(gameState.gameTime)} drawFps: ${parseInt(drawfpsMeter)} simFps: ${parseInt(updatefpsMeter)} debug: allEntities:${allEntities.length}, debug-visuals:${document.getElementById('debug-visuals').childElementCount}`;
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


// Start the game
logicGameLoopTimeNow = Date.now()
logicGameLoop();
visualGameLoop();


stage1(currentGameGen)

//cupids.createCupid(500, 200, 0)
createBomb(800, 500)