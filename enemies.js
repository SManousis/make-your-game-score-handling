import * as utils from "./utils.js";
import * as mario from './mario.js'
import * as game from './game.js'
import * as bullets from './bullets.js'

let preloadedFiringImage = new Image();
preloadedFiringImage.src = "assets/enemies/TrumpCupidFired.png";

export function createCupid(x, y, index) {
    let cupidBody = document.createElement("img");
    cupidBody.className = "cupid-img";
    cupidBody.src = "assets/enemies/TrumpCupid.png";
    document.getElementById("game-area").appendChild(cupidBody);
     // store reference in object
    
    let cupid = {
       index: index,
       health: 20,
       damage: 10,
       moveSpeed: 0.1,
       x: x,           // use the parameters!
       y: y,       
       bullet_count: 1,
       aimDirection: "down",
       state: "airborne",
       velX: 1.2,
       velY: 0,
       touched: false,
       rand1: Math.random()*10,
       rand2: Math.random()*10,
       body: [utils.createCircle(x,  y+20, 30)],
       updateFunc: function() { cupidUpdate(this) },   
       drawFunc: function() { cupidVisuals(this) },
       dom: cupidBody,
       parallelMoveCount: 0,
       team: "enemy",
       reset(){
        this.health = 20;
        this.moveSpeed = 0.1;
        this.velX = 1;
        this.velY = 0;
        this.x = x;
        this.y = y;
        // this.dom.remove();
        // this.body.forEach(body => body.div.remove());
        // this.body = [utils.createCircle(x,  y+20, 30)];
       }
    }
    console.log("I was created at ", x, y)
    game.cupids.push(cupid)
    game.allEntities.push(cupid)
    return cupid
 }


 

//let  parallelmovecount = 0

export function cupidUpdate(cupid) {
   
    cupid.parallelMoveCount++

    //what does this do? (alex)
    // if (cupid.parallelMoveCount % 3 === 0){ 
    //     cupid.moveSpeed === 0 ? cupid.moveSpeed = 1 : cupid.moveSpeed = 0
    // }

    const distance = 100
    if (cupid.parallelMoveCount === distance) {
        cupid.velX = -cupid.velX
        
    }
    if (cupid.parallelMoveCount === distance*2) {
        cupid.velX = -cupid.velX
        cupid.velY = -3
        cupid.parallelMoveCount = 0
        cupid.velY = -3
    }

    if (Math.abs(cupid.velY) > 0){
        utils.moveUnit(cupid, 0, cupid.velY)
        cupid.parallelMoveCount--
    }else{
        utils.moveUnit(cupid, cupid.velX, cupid.velY)
    }
    
    
    if (Math.abs(cupid.velY) > 1){
        cupid.velY /= 1.05
    }

    if (Math.abs(cupid.velY) < 1){
        cupid.velY = 0
    }




    //decide if cupid will fire
    // if (cupid.index*100 == game.gameState.frameCounter%(game.cupids.length*100)){
    if (parseInt(Math.random()*2000) == 0){
        cupid.dom.src=preloadedFiringImage.src
        let bullet = bullets.createBullet("down", "enemy", cupid.x, cupid.y, 4, 8)
        game.allEntities.push(bullet);
        bullets.allBullets.push(bullet);
        setTimeout(() => {
            cupid.dom.src="assets/enemies/TrumpCupid.png"
        }, 300)   
    }
}



export function cupidVisuals(cupid) {
    cupid.dom.style.opacity = "100%";
    cupid.dom.style.setProperty('--cupid-x', `${cupid.x}px`);
    cupid.dom.style.setProperty('--cupid-y', `${-cupid.y}px`);
}


