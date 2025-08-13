let i = 0

//based on gamestate it will understand what cinematic to play
export function cinematicTicker(gamestate){
    console.log("cin ticker")

    gamestate.stageCinematicCounter++
    
    i = gamestate.stageCinematicCounter

    switch (gamestate.level){
        case 0:

            //todo, play music, voice over and mutate text
            
            console.log("i: ",i, activePanel)
            if (i == 60){
                i = 500
                show("p1.jpg")
                opacity = 0
                opacityDir = 'up'
            }

            if (i == 400){
                opacityDir = 'down'
            }

            if ( i == 500){
                console.log("0")
                gamestate.currentState = 'running'
                gamestate.level = 1
                activePanel.remove()
                gamestate.stageCinematicCounter = 0
                opacityDir = ''
            }

            if (opacityDir == 'up'){
                opacity += 1
                opacity = Math.min(100, opacity)
            } else if (opacityDir = 'down'){
                opacity -= 1
                opacity = Math.max(0, opacity)
            }
            if (activePanel != undefined){
                activePanel.style.opacity = `${opacity}%`
            }

            break;
    }
}

let activePanel = undefined
let opacity = 0
let opacityDir = ''

function show(panelName){
    console.log("show called")
    let p = document.createElement('img')
    p.className = 'cinematic-panel'
    p.src = `assets/cinematics/${panelName}`
    console.log(p.style.src)
    document.getElementById('game-area').appendChild(p)
    activePanel = p
    console.log(activePanel)
}

