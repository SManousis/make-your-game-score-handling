import { createMario, marioShoot, updateMarioHealthBar } from './mario.js'
//import * as floaters from './floaters.js'
//import * as walkables from './walkables.js'
import * as collision from './collision.js'
import { stage1, stageControllerTicker, eventQueue, stage2, stage3 } from './stagecontroller.js'
import * as utils from "./utils.js"
import { createBomb } from './explosion.js'
import { AudioManager, xToPan } from './audio.js'
import { Tiles } from './Tiles.js'
import { stage1Map, renderTileMap, stage2Map, stage3Map } from './tilesMap.js'
import { cinematicTicker } from './cinematics.js'

//import * as lasers from './lasers'
//import * as utils from './utils.js'
const backImage = new Image();
// backImage.src = "./assets/backgrounds/background.png";
const TILE_SIZE = 32;
const tiles = new Tiles();
const tileMap = []
const mainMenu = document.getElementById('main-menu');
const pauseMenu = document.getElementById('pause-menu');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const powerupText = document.getElementById('powerup-text');
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
const playerRankInfo = document.getElementById('player-rank-info');
const leaderboardContainer = document.getElementById('leaderboard-container');
const leaderboardBody = document.getElementById('leaderboard-body');
const paginationInfo = document.getElementById('pagination-info');
const prevButton = document.getElementById('leaderboard-prev-button');
const nextButton = document.getElementById('leaderboard-next-button');

const leaderboardMenu = document.getElementById('leaderboard-menu');
const backFromLeaderboardButton = document.getElementById('back-from-leaderboard-button');

let endGame = false;

const leaderboard = {
    currentPage: 1,
    totalPages: 1,
    async fetchAndDisplay(page) {
        //show loading message
        leaderboardBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        leaderboardContainer.classList.remove('hidden');
        try {
            const response = await fetch(`http://localhost:8000/scores?page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json();
            //clear loading message
            leaderboardBody.innerHTML = '';

            if (!data.scores || data.scores.length === 0) {
                leaderboardBody.innerHTML = '<tr><td colspan="4">No scores yet!</td></tr>';
            } else {
                data.scores.forEach(score => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${score.rank}</td>
                        <td>${score.name}</td>
                        <td>${score.score}</td>
                        <td>${score.time}</td>
                    `;
                    leaderboardBody.appendChild(row);
                });
            }
            this.currentPage = data.currentPage;
            this.totalPages = data.totalPages;

            paginationInfo.textContent = `Page ${this.currentPage} / ${this.totalPages}`;
            prevButton.disabled = (this.currentPage <= 1);
            nextButton.disabled = (this.currentPage >= this.totalPages);

        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            leaderboardBody.innerHTML = '<tr><td colspan="4">Error loading scores.</td></tr>';
        }
    },

    addPaginationListeners() {
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.fetchAndDisplay(this.currentPage - 1);
            }
        });
        nextButton.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.fetchAndDisplay(this.currentPage + 1);
            }
        });
    }
};

leaderboard.addPaginationListeners();



let lastTime = 0;

export const audio = {
    music: true,
    sounds: true,
    musicVolume: 0.2,
    soundsVolume: 0.1,
    manager: new AudioManager({
        bomb: "./assets/audio/bomb.wav",
        bubble: "./assets/audio/bubble.wav",
        catching_sandwich: "./assets/audio/catching_sandwich.wav",
        cicada_hit: "./assets/audio/cicada_hit.wav",
        destroy_fly: "./assets/audio/destroy_fly.wav",
        mario_bullet_hit: "./assets/audio/bullet_hit.wav",
        game_over: "./assets/audio/game_over.wav",
        health_short: "./assets/audio/health_short.wav",
        health: "./assets/audio/health.wav",
        lazer_short: "./assets/audio/lazer_short.wav",
        lazer: "./assets/audio/lazer.wav",
        lose_life: "./assets/audio/lose_life.wav",
        swarm: "./assets/audio/swarm.wav",
        tick: "./assets/audio/time_tick.wav",
        turtle_hit: "./assets/audio/turtle_hit.wav",
        vending_rising: "./assets/audio/vending_rising.wav",

        // vocal
        mario_death: "./assets/audio/mario_death.wav",
        mario_hit1: "./assets/audio/mario_hit1.wav",
        mario_hit2: "./assets/audio/mario_hit2.wav",
        mario_hit3: "./assets/audio/mario_hit3.wav",
        mario_hit4_rare: "./assets/audio/mario_hit4_rare.wav",
        mario_jump1: "./assets/audio/mario_jump1.wav",
        mario_jump2: "./assets/audio/mario_jump2.wav",
        mario_jump3: "./assets/audio/mario_jump3.wav",

        // narration
        nar1: "./assets/audio/nar1.mp3",
        nar2: "./assets/audio/nar2.mp3",
        nar3: "./assets/audio/nar3.mp3",
        nar4: "./assets/audio/nar4.mp3",
        nar5: "./assets/audio/nar5.mp3",
        nar6: "./assets/audio/nar6.mp3",
        nar7: "./assets/audio/nar7.mp3",
        nar8: "./assets/audio/nar8.mp3",
        nar9: "./assets/audio/nar9.mp3",
        nar10: "./assets/audio/nar10.mp3",
        nar11: "./assets/audio/nar11.mp3",
        nar12: "./assets/audio/nar12.mp3",
    }, 4),
    tracks: [
        { url: "./assets/audio/mario.mp3", overlapDuration: 7.742 },
        { url: "./assets/audio/intro.mp3" },
    ],
    initialized: false,
    xToPan: xToPan,
    setUp: async function () {
        this.manager.resume();
        await this.manager.loadSamples();
        for (let i = 0; i < this.tracks.length; i++) {
            await this.manager.getOrLoadMusicBuffer(this.tracks[i].url);
        }
    }
}

//master
export let gameState = undefined




//adding our created entities to allEntities if they are not static







export function updateMenuVisibility() {
    //hide all menus by default
    mainMenu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    gameOverMenu.classList.add('hidden');
    helpMenu.classList.add('hidden');
    leaderboardMenu.classList.add('hidden');

    if (gameState.currentState === 'mainMenu') {
        mainMenu.classList.remove('hidden');
    } else if (gameState.currentState === 'paused') {
        pauseMenu.classList.remove('hidden')
    } else if (gameState.currentState === 'gameOver') {
        gameOverMenu.classList.remove('hidden');
    } else if (gameState.currentState === 'help') {
        helpMenu.classList.remove('hidden');
    } else if (gameState.currentState === 'leaderboard') {
        leaderboardMenu.classList.remove('hidden')
    }
}



function restartGame() {
    console.log("RESTART CALLED")
    throw Error("WTF")
    return

    //TODO delete everything under stage-resources

    gameState.currentGameGen++; // In

    // suppressing destroy sounds for restart
    let soundsTemp = audio.sounds;
    audio.sounds = false;

    // crement at every restart
    for (let entity of gameState.allEntities) {
        if (entity.countdownDiv) {
            entity.countdownDiv.remove()
            utils.destroyUnit(entity)
        }
        if (entity.dom) entity.dom.remove();
        if (entity.body) entity.body.forEach(body => body.div.remove());
    }
    audio.sounds = soundsTemp;

    gameState.allEntities.length = 0;
    gameState.groundedEnemies.length = 0;
    gameState.ghosts.ghosts.length = 0;
    gameState.unicorns.length = 0;
    gameState.cupids.cupids.length = 0;
    gameState.cicadas.cicadas.length = 0;
    gameState.turtles.turtles.length = 0;
    gameState.bullets.allBullets.length = 0;
    gameState.powerUps.length = 0;
    gameState.flowers.length = 0;
    gameState.tetros.length = 0;

    eventQueue.length = 0;

    utils.setUnit(mario, 500, 500);
    gameState.mario.health = 100;
    gameState.allEntities.push(mario);

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
    leaderboardContainer.classList.add('hidden');
    playerRankInfo.textContent = '';


    startStorymode()

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
    endGame = true;
    finalScoreElement.textContent = gameState.score;
    finalTimeElement.textContent = utils.formatTime(gameState.gameTime);
    audio.manager.stopMusic();
    if (audio.sounds) {
        audio.manager.killSamples();
        audio.manager.playSample("mario_death", {
            gain: audio.soundsVolume,
            pan: audio.xToPan(gameState.mario.x, gameArea.offsetWidth),
        })
        setTimeout(() => {
            audio.manager.playSample("game_over", { gain: audio.soundsVolume });
        }, 1000);
    }

    updateMenuVisibility();
}

export function lifeLostFanfare() {
    if (audio.sounds) {
        audio.manager.playSample("lose_life", { gain: audio.soundsVolume });
    }
    livesElement.classList.add('life-lost-flash');
    setTimeout(() => {
        livesElement.classList.remove('life-lost-flash');
    }, 600);
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

window.addEventListener("keydown", function (e) {
    const keysToPrevent = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
    if (keysToPrevent.includes(e.key)) {
        e.preventDefault(); // Stops scrolling
    }
}, false);

// Main menu buttons
playButton.addEventListener('click', async () => {
    if (!audio.initialized) {
        await audio.setUp();
        audio.initialized = true;
        audio.playSampleDeb = utils.opDebounce(audio.manager.playSample.bind(audio.manager), 100, { leading: true });
    }

    if (audio.music) {
        audio.manager.playMusicLoop(audio.tracks[0].url, audio.musicVolume, audio.tracks[0].overlapDuration);
    } else {
        audio.manager.stopMusic();
    }
    if (endGame) {
        restartGame()
        endGame = false;
    } else {

        startStorymode()
        updateMenuVisibility();
    }
});

leaderboardButton.addEventListener('click', () => {
    gameState.currentState = 'leaderboard';
    updateMenuVisibility();

    leaderboardMenu.insertBefore(leaderboardContainer, backFromLeaderboardButton);
    leaderboard.fetchAndDisplay(1);
});

backFromLeaderboardButton.addEventListener('click', () => {
    // move the leaderboard element back to the game over menu
    //    so it's ready for the next time the player dies.
    const restartBtn = gameOverMenu.querySelector('#restart-button');
    gameOverMenu.insertBefore(leaderboardContainer, restartBtn);
    leaderboardContainer.classList.add('hidden');

    // 2. Change the game state back to the main menu.
    gameState.currentState = 'mainMenu';
    updateMenuVisibility();
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
        score: Math.floor(gameState.score),
        time_ms: Math.floor(gameState.gameTime),
    };
    console.log("Submitting this data:", scoreData);
    try {
        const response = await fetch('http://localhost:8000/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        });

        if (response.ok) {
            const result = await response.json();
            const percentile = result.percentile.toFixed(1);
            playerRankInfo.textContent = `Congrats ${playerName}, you are in the top ${percentile}%, on position ${result.rank}.`;

            submitScoreButton.textContent = 'Submitted!';
            playerNameInput.disabled = true;
            leaderboard.fetchAndDisplay(1);
        } else {
            // The server responded with an error
            const errorText = await response.text();
            alert(`Error submitting score:\n\nServer responded with status ${response.status}.\nMessage: "${errorText}"`);
            submitScoreButton.disabled = false; // Re-enable the button
            submitScoreButton.textContent = 'Submit Score';
        }
    } catch (error) {
        // A network error occurred
        console.error('API Error:', error);
        alert(`Failed to submit score. Could not connect to the server.\n\nError: ${error.message}`);
        submitScoreButton.disabled = false; // Re-enable the button
        submitScoreButton.textContent = 'Submit Score';
    }

})

document.querySelectorAll('#back-to-menu-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const result = confirm("All progress will be lost are you sure");
        if (result) {
            endGame = true;
            gameState.currentState = 'mainMenu';
            updateMenuVisibility();
        }
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
    });
});

// Event listeners for Sounds
soundsToggles.forEach(toggle => {
    toggle.addEventListener('input', () => {
        syncToggles(toggle, soundsToggles, val => audio.sounds = val);
    });
});

const fireState = {
    isFiring: false,
    initialDelay: 300,
    repeatRate: 100,
    delayTimer: null,
    repeatTimer: null,
};


// Listen for key presses
document.addEventListener('keydown', (event) => {
    if (gameState.currentState !== 'running' && event.key.toLowerCase() !== 'p') {
        return;
    }

    if (event.key.toLowerCase() === 'p' && (gameState.currentState === 'running' || gameState.currentState === 'paused')) {
        if (gameState.currentState === 'running') {
            gameState.currentState = 'paused';
            if (audio.music) audio.manager.pauseMusic();
            if (audio.sounds) audio.manager.killSamples();

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

    // if (event.key.toLowerCase() === 'u') {
    //     keysPressed.upgrade = !keysPressed.upgrade;
    // }

    if (event.key.toLowerCase() === 'b') {
        if (keysPressed.bomb == false) {
            keysPressed.bomb = true
            if (gameState.mario.bombs > 0) {
                createBomb(gameState.mario.x, gameState.mario.y, gameState.mario.velX, gameState.mario.velY, 'player', 500, 500, 2, true)
                gameState.mario.bombs -= 1
            }
        }
    }



    if (event.key.toLocaleLowerCase() === 'f' && !fireState.isFiring) {

        if (keysPressed.autofire) return;

        fireState.isFiring = true;

        //fire immediately on the initial key press.
        marioShoot();

        //start a timer for the delay. After 100ms, it will start the continuous fire.
        fireState.delayTimer = setTimeout(() => {
            // check if the key is still being held down after the delay.
            if (fireState.isFiring) {
                // start the repeating timer for continuous fire.
                fireState.repeatTimer = setInterval(marioShoot, fireState.repeatRate);
            }
        }, fireState.initialDelay);
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
    // let space = keysPressed.space;
    if (event.key === ' ' || event.code === 'Space') {
        keysPressed.space = true
    }


});

document.addEventListener('keyup', (event) => {
    if (gameState.currentState !== 'running') {
        return;
    }

    if (event.key.toLocaleLowerCase() === 'f') {
        // 1. Mark that we have stopped firing.
        fireState.isFiring = false;

        // 2. IMPORTANT: Clear any running timers to stop the firing sequence.
        clearTimeout(fireState.delayTimer);
        clearInterval(fireState.repeatTimer);
    }

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


let stop = false

// The main game loop
async function GameLoop() {
    if (!stop) {
        requestAnimationFrame(GameLoop);
    }



    if (gameState == undefined) {
        return
    }

    if (gameState.currentState === 'running' && gameState.mapLoaded == false) {
        console.log("loading game state")
        if (gameState == undefined) {
            gameState = createNewGameState()
        }

        if (gameState.mario == undefined) {
            stop = true
        }

        gameState.mario.health = gameState.mario.maxHealth
        gameState.mario.x = 500
        gameState.mario.y = 500

        gameState = createNewGameState(gameState)
        gameState.currentState = 'running'


        switch (gameState.level) {
            case 1:

                renderTileMap(stage1Map());
                stage1(gameState.currentGameGen)
                break;

            case 2:
                renderTileMap(stage2Map());
                stage2(gameState.currentGameGen)
                break;

            case 3:
                renderTileMap(stage3Map());
                stage3(gameState.currentGameGen)
                break;
        }
        gameState.mapLoaded = true
    }


    if (gameState.currentState === 'running') {

        if (updateTimestamp == 0) {
            updateTimestamp = Date.now() - 16.666
        }
        const count = Math.min(10, Math.round((Date.now() - updateTimestamp) / 16.66666))
        for (let i = 0; i < count; i++) {
            update();
        }

        draw();

    } else if (gameState.currentState == 'cinematic') {
        cinematicTicker(gameState)
    }

    for (let unit of queueFree) {
        for (let group of gameState.allGroups) {
            utils.removeUnitFromArray(unit, group)
        }
        unit.body.forEach(b => { if (b.div) b.div.remove(); })
        if (unit.dom) unit.dom.remove();
    }
    queueFree.length = 0
}

let updateCounter = 0
let updateCounterTimestamp = Date.now()
let updatefpsMeter = 0
let updateTimestamp = 0

// Update the game state, only physics
function update() {
    updateTimestamp = Date.now()

    if (gameState.currentState === 'running') {
        gameState.gameTime += 16.666666;
    }

    updateCounter++
    if (updateCounter == 30) {
        updateCounter = 0
        updatefpsMeter = 1000 / ((Date.now() - updateCounterTimestamp) / 30)
        updateCounterTimestamp = Date.now()
    }


    collision.powerUpPicked(gameState.mario) // checks if mario touched a health item//collision.isShot(mario);

    //running all entities' update function
    for (let entity of gameState.allEntities) {
        if (gameState.aoeDamage.length > 0 && (entity.team == 'enemy' || entity.team == 'player') && Object.hasOwn(entity, 'health')) {
            collision.inAoe(entity)
        }

        if (entity.updateFunc) entity.updateFunc(entity);

        if (entity.type !== "powerUp" && entity.type !== "bullet") {
            collision.isShot(entity)
        }

        if (entity.name === "mario") {
            updateMarioHealthBar(entity.health, 100)
        }
    }

    gameState.frameCounter++



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


  

    timeCounterElement.textContent = `Time: ${utils.formatTime(gameState.gameTime)} drawFps: ${parseInt(drawfpsMeter)} simFps: ${parseInt(updatefpsMeter)} debug: allEntities:${gameState.allEntities.length}, debug-visuals:${document.getElementById('debug-visuals').childElementCount}`;
    livesElement.textContent = `Lives: ${gameState.lives}`;

    let indicators = [];
    if (gameState.mario.bombs > 0) {
        indicators.push(`B: ${mario.bombs}`);
    }

    if (gameState.mario.multibulletTimer > 0) {
        indicators.push("U");
    }
    powerupText.textContent = indicators.join(' | ');




    for (let entity of gameState.allEntities) {

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



GameLoop();


// Start the game
function startStorymode(firstTime = false) {
    gameState = createNewGameState()

    if (firstTime) {
        gameState.currentState = 'mainMenu'
    }
}

export const queueFree = []
export const gameArea = document.getElementById('game-area')

function createNewGameState(oldState = undefined) {
    let state = {
        mario: oldState ? oldState.mario : {},
        score: oldState ? oldState.score : 0,
        lives: oldState ? oldState.lives : 5,
        gameTime: oldState ? oldState.gameTime : 0,
        level: oldState ? oldState.level : 0,

        //non persisting
        stageCinematicCounter: 0, //counter used by cinematicTicker to control the speed that cinematics play out
        currentState: 'cinematic', //'cinematic', 'mainMenu', 'paused', 'gameover', 'running'
        previousState: '',
        frameCounter: 0,
        mapLoaded: false,
        allEntities: [],
        groundedEnemies: [],
        aoeDamage: [],
        allBullets: [],
        cicadas: [],
        cupids: [],
        turtles: [],
        powerUps: [],
        walkables: [],
        ghosts: [],
        unicorns: [],
        flowers: [],
        tetros: [],
        allGroups: [],
        currentGameGen: 0,
    }

    state.allGroups = [state.allEntities, state.groundedEnemies, state.aoeDamage, state.allBullets, state.cicadas, state.cupids, state.turtles, state.powerUps, state.walkables, state.ghosts, state.unicorns, state.flowers, state.tetros]

    if (oldState == undefined) {
        state.mario = createMario(state.allEntities)
    } else {
        state.allEntities.push(state.mario)
    }



    return state
}

