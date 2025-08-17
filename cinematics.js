import { audio, gameState, keysPressed } from "./game.js"

let i = 0

let started = false
let textShown = 0
let abort = false

const lines = {
    1: 'After spending hours working on a malfunctioning vending machine with no progress in sight, El Mario decided to call it a day.',
    2: 'Discouraged by the unexplained difficulty of this repair, El Mario sat down to watch tv and have a good time.',
    3: 'And then it happened, the alien invasion of earth began.',
    4: 'Out of nowhere, a beam of light pulled El Mario through the window into the air.',
    5: 'Unexpectedly the unrelenting waves of enemies stopped. As El Mario was catching his breath, he heard a thud behind him.',
    6: `A familiar friend was standing looking at him. It was the vending machine he was repairing earlier that day. The vending machine vowed to assist El Mario in his fight with the aliens. But because it was malfunctioning, El Mario would need to shake it for healing items to drop. Unbeknownst to El Mario some of its products weren't in fresh condition.`,
    7: 'Before they could talk further, another swarm of enemies appeared. "You will never reach our leader", they proclaimed as they flew into battle.',
    8: 'El Mario could feel that he was close to their leader. Defeating him would mean saving the world.',
    9: `So with the last and most formidable swarm of enemies in the distance, he turned to the vending machine and said. "Thank you weird fridge-san, I swear I'll fix you when we get back home.`,
    10: ``,
    11: `El Mario left devastated by the vending machine's betrayal. Kneeling among his former partners remains, he closes his eyes as he's saying the final goodbye`,
    12: 'IN MEXICAN: Oh damn! These magic mushroom are amazing!',

}

//based on gameState it will understand what cinematic to play
export function cinematicTicker() {
    let reduction = audio.musicVolume - audio.soundsVolume;
    if (reduction < 0) {
        reduction = 0;
    }
    let fadeTime = reduction * 3;

    //cinematic preperation
    if (started == false) {
        audio.manager.playMusicLoop(audio.tracks[1].url, audio.musicVolume, audio.tracks[1].overlapDuration);
        started = true
        document.getElementById('game-cover').style.opacity = `${100}%`
        gameState.cinematicStep = 0
        gameState.cinematicTimer = 0
        abort = false

        document.getElementById('mario-img-cont').style.opacity = `${0}%`
        document.getElementById('mario-healthBar-container').style.opacity = `${0}%`
        document.getElementById('stage-resources').innerHTML = ""
        document.getElementById('debug-visuals').innerHTML = ""
    }

    //always run
    gameState.stageCinematicCounter++

    if (opacityDir == 'up') {
        opacity += 1
        opacity = Math.min(100, opacity)
    } else if (opacityDir = 'down') {
        opacity -= 1
        opacity = Math.max(0, opacity)
    }
    if (activePanel != undefined) {
        activePanel.style.opacity = `${opacity}%`
    }

    if (wordsShown < currentWords.length) {
        document.getElementById('cinematic-text').textContent =
            currentWords.slice(0, Math.ceil(wordsShown)).join(" ")
        wordsShown += 0.08
    }
    // document.getElementById('cinematic-text').textContent = currentText.substring(0, textShown)
    // textShown += 0.25



    //cinematic specific choreography
    if (gameState.cinematicTimer > 0) {
        if (keysPressed.esc == true && abort == false) {
            abort = true
            hidePanel()
            hideText()
            audio.manager.killSamples();
            wait(20)
            gameState.cinematicStep = 50
        }
        gameState.cinematicTimer -= 1
    } else {
        switch (gameState.level) {
            case 1: //cinematic for level 1
                switch (gameState.cinematicStep) {
                    case 0:
                        startText('.  .  .  .  .  .  . L o c a t i o n: M e x i c o .  .  .  .  .  .  .', '25%')
                        wait(280)
                        break;
                    case 1:
                        hideText()
                        showPanel("p1.jpg")
                        wait(150)
                        break;
                    case 2:
                        startText(lines[1])
                        wait(30)
                        break;
                    case 3:
                        audio.manager.playSample('nar1', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(8 * 70)
                        break;
                    case 4:
                        hidePanel()
                        wait(20)
                        break;
                    case 5:
                        hideText()
                        wait(150)
                        break;
                    //==================================
                    case 6:
                        showPanel('p2.jpg')
                        wait(150)
                        break;
                    case 7:
                        startText(lines[2])
                        wait(30)
                        break;
                    case 8:
                        audio.manager.playSample('nar2', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(7.5 * 72)
                        break;
                    case 9:
                        hidePanel();
                        wait(20);
                        break;
                    case 10:
                        hideText();
                        wait(150)
                        break;
                    //===================================
                    case 11:
                        showPanel('p3.jpg')
                        wait(150)
                        break;
                    case 12:
                        startText(lines[3])
                        wait(30)
                        break;
                    case 13:
                        audio.manager.playSample('nar3', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(6 * 65)
                        break;
                    case 14:
                        hidePanel();
                        wait(20)
                        break;
                    case 15:
                        hideText();
                        wait(150)
                        break;
                    //===================================
                    case 16:
                        showPanel('p4.jpg')
                        wait(150)
                        break;
                    case 17:
                        startText(lines[4])
                        wait(30)
                        break;
                    case 18:
                        audio.manager.playSample('nar4', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(6.5 * 60)
                        break;
                    case 19:
                        hidePanel();
                        wait(20)
                        break;
                    case 20:
                        hideText();
                        wait(150)
                        break;
                    //===================================


                    default:
                        endCinematic()
                        break;
                }
                break;


            case 2: //cinematic for level 2
                switch (gameState.cinematicStep) {
                    case 0:
                        wait(100)
                        break;
                    case 1:
                        showPanel("p5.jpg")
                        wait(150)
                        break;
                    case 2:
                        startText(lines[5])
                        wait(30)
                        break;
                    case 3:
                        audio.manager.playSample('nar5', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(8 * 70)
                        break;
                    case 4:
                        hidePanel()
                        wait(20)
                        break;
                    case 5:
                        hideText()
                        wait(150)
                        break;
                    //==================================
                    case 6:
                        wait(100)
                        break;
                    case 7:
                        showPanel("p6.jpg")
                        wait(150)
                        break;
                    case 8:
                        startText(lines[6])
                        wait(30)
                        break;
                    case 9:
                        audio.manager.playSample('nar6', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(21 * 70)
                        break;
                    case 10:
                        hidePanel()
                        wait(20)
                        break;
                    case 11:
                        hideText()
                        wait(150)
                        break;
                    //==================================
                    case 12:
                        wait(100)
                        break;
                    case 13:
                        showPanel("p7.jpg")
                        wait(150)
                        break;
                    case 14:
                        startText(lines[7])
                        wait(30)
                        break;
                    case 15:
                        audio.manager.playSample('nar7', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(10 * 67)
                        break;
                    case 16:
                        hidePanel()
                        wait(20)
                        break;
                    case 17:
                        hideText()
                        wait(150)
                        break;
                    //==================================
                    default:
                        endCinematic()
                        break;
                }
                break;



            case 3: //cinematic for level 3
                switch (gameState.cinematicStep) {
                    case 0:
                        wait(100)
                        break;
                    case 1:
                        showPanel("p8.jpg")
                        wait(150)
                        break;
                    case 2:
                        startText(lines[8])
                        wait(30)
                        break;
                    case 3:
                        audio.manager.playSample('nar8', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(8 * 65)
                        break;
                    case 4:
                        hidePanel()
                        wait(20)
                        break;
                    case 5:
                        hideText()
                        wait(150)
                        break;
                    //==================================
                    case 6:
                        wait(100)
                        break;
                    case 7:
                        showPanel("p9.jpg")
                        wait(150)
                        break;
                    case 8:
                        startText(lines[9])
                        wait(30)
                        break;
                    case 9:
                        audio.manager.playSample('nar9', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(11.5 * 70)
                        break;
                    case 10:
                        wait(20)
                        break;
                    case 11:
                        hideText()

                        wait(10)
                        break;
                    //==================================
                    case 12:
                        wait(30)
                        break;
                    case 13:
                        showPanel("p10.jpg", 100)
                        wait(10)
                        break;
                    case 14:
                        startText(lines[10])
                        audio.manager.stopMusic(2)
                        wait(1)
                        break;
                    case 15:
                        audio.manager.playSample('nar10', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(2 * 70)
                        break;
                    case 16:
                        hidePanel()
                        wait(20)
                        break;
                    case 17:
                        hideText()
                        wait(60)
                        break;
                    //==================================
                    default:
                        endCinematic()
                        break;
                }
                break;

            case 4: //end cinematic
                switch (gameState.cinematicStep) {
                    case 0:
                        wait(100)
                        break;
                    case 1:
                        showPanel("p11.jpg")
                        wait(150)
                        break;
                    case 2:
                        startText(lines[11])
                        wait(30)
                        break;
                    case 3:
                        audio.manager.playSample('nar11', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(14 * 65)
                        break;
                    case 4:
                        hidePanel()
                        wait(20)
                        break;
                    case 5:
                        hideText()
                        wait(150)
                        break;
                    //==================================
                    case 6:
                        wait(100)
                        break;
                    case 7:
                        showPanel("p2.jpg")
                        wait(50)
                        break;
                    case 8:
                        audio.manager.stopMusic(2)
                        wait(130)
                        break;
                    case 9:
                        startText(lines[12])
                        wait(30)
                        break;
                    case 10:
                        audio.manager.playSample('nar12', { gain: audio.soundsVolume, reduction: reduction, fadeTime: fadeTime })
                        wait(5 * 70)
                        break;
                    case 11:
                        wait(20)
                        break;
                    case 12:
                        hideText()
                        wait(60)
                        break;
                    //=========================
                    default:
                        audio.manager.stopMusic(2);
                        endCinematic('gameOver')
                        break;
                }
                break;
        }
        gameState.cinematicStep++
    }
}

function wait(n) {
    gameState.cinematicTimer = n
}

let activePanel = undefined
let opacity = 0
let opacityDir = ''

function showPanel(panelName, preOpacity = 0) {
    console.log("show panel")
    if (activePanel) {
        activePanel.remove()
    }
    let p = document.createElement('img')
    p.className = 'cinematic-panel'
    p.src = `assets/cinematics/${panelName}`
    console.log(p.style.src)
    document.getElementById('game-area').appendChild(p)
    activePanel = p


    opacity = preOpacity
    opacityDir = 'up'
}

function hidePanel() {
    opacityDir = 'down'
}

function endCinematic(nextState = 'running') {
    if (activePanel) {
        activePanel.remove()
    }
    gameState.currentState = nextState

    gameState.stageCinematicCounter = 0
    opacityDir = ''
    document.getElementById('game-cover').style.opacity = '0%'
    audio.manager.playMusicLoop(audio.tracks[0].url, audio.musicVolume, audio.tracks[0].overlapDuration);
    document.getElementById('cinematic-text').textContent = ''

    started = false
}

let currentWords = []
let wordsShown = 0

function startText(text, left = '20%') {
    currentWords = text.split(" ")   // split by spaces
    wordsShown = 0
    document.getElementById('cinematic-text').style.opacity = '100%'
    document.getElementById('cinematic-text').style.left = left
}

function hideText() {
    document.getElementById('cinematic-text').style.opacity = '0%'
    currentWords = []
    wordsShown = 0
}

// let currentText = ''
// function startText(text, left = '20%') {
//     currentText = text
//     textShown = 0
//     document.getElementById('cinematic-text').style.opacity = '100%'
//     document.getElementById('cinematic-text').style.left = left
// }

// function hideText() {
//     document.getElementById('cinematic-text').style.opacity = '0%'
//     currentText = ''
// }

