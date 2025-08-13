let i = 0

//based on gamestate it will understand what cinematic to play
function cinematicTicker(gamestate){
    gamestate.stageCinematicCounter++
    
    i = gamestate.stageCinematicCounter

    switch (gamestate.level){
        case 0:

            //todo, play music, voice over and mutate text

            if (i == 60){
                show(p1.jpg)
                opacity = 0
                opacityDir = 'up'
            }

            if (i == 400){
                opacityDir = 'down'
            }

            if ( i = 500){
                gamestate.currentState = 'running'
                activePanel.remove()
                gamestate.stageCinematicCounter = 0
                opacityDir = ''
            }

            if (opacityDir == 'up'){
                opacity += 1
            } else if (opacityDir = 'down'){
                opacity -= 1 
            }
            if (activePanel != undefined){
                activePanel.style.opacity = opacity+'px'
            }

            break;
    }
}

let activePanel = undefined
let opacity = 0
let opacityDir = ''

function show(panelName){
    let p = document.createElement('img')
    p.classList.add('cinematic-panel')
    p.style.src = `assets/cinematics/${panelName}`
    document.getElementById('game-area').appendChild(p)
}

