import * as utils from "./utils.js";
import * as mario from './mario.js'
import * as game from './game.js'
import * as bullets from './bullets.js'
import * as healthItem from './healthItem.js'
import * as walkables from './walkables.js'

export let cupids = [];

let preloadedFiringImage = new Image();
preloadedFiringImage.src = "assets/enemies/TrumpCupidFired.png";

export function createCupid(x, y, index) {
    let cupidBody = document.createElement("img");
    cupidBody.className = "cupid-img";
    cupidBody.src = "assets/enemies/TrumpCupid.png";
    document.getElementById("game-area").appendChild(cupidBody);
    // store reference in object

    let cupid = {
        name: "cupid",
        index: index,
        health: 8,
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
        rand1: Math.random() * 10,
        rand2: Math.random() * 10,
        body: [utils.createCircle(x, y + 20, 30)],
        updateFunc: function () { cupidUpdate(this) },
        drawFunc: function () { cupidVisuals(this) },
        dom: cupidBody,
        parallelMoveCount: 0,
        team: "enemy",
        scoreValue: 10,
        reset() {
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
    cupids.push(cupid)
    game.allEntities.push(cupid)
    return cupid
}


export function reset() {
    cupids.forEach(cupid => cupid.reset());

    cupids.cupids = [];
}


//let  parallelmovecount = 0

export function cupidUpdate(cupid) {
    if (cupid.health <= 0) {
        if (cupid.dom) cupid.dom.remove();
        cupid.body.forEach(b => { if (b.div) b.div.remove(); })
        utils.removeUnitFromArray(cupid, cupids)

        game.removeFromAllEntities(cupid)
        game.updateScore(cupid.scoreValue);
    }

    cupid.parallelMoveCount++

    //what does this do? (alex)
    // if (cupid.parallelMoveCount % 3 === 0){ 
    //     cupid.moveSpeed === 0 ? cupid.moveSpeed = 1 : cupid.moveSpeed = 0
    // }

    const distance = 100
    if (cupid.parallelMoveCount === distance) {
        cupid.velX = -cupid.velX

    }
    if (cupid.parallelMoveCount === distance * 2) {
        cupid.velX = -cupid.velX
        cupid.velY = -3
        cupid.parallelMoveCount = 0
        cupid.velY = -3
    }

    if (Math.abs(cupid.velY) > 0) {
        utils.moveUnit(cupid, 0, cupid.velY)
        cupid.parallelMoveCount--
    } else {
        utils.moveUnit(cupid, cupid.velX, cupid.velY)
    }


    if (Math.abs(cupid.velY) > 1) {
        cupid.velY /= 1.05
    }

    if (Math.abs(cupid.velY) < 1) {
        cupid.velY = 0
    }


    for (const BodyPart of cupid.body) {
        if (utils.IsBodyCollidingWithUnit(BodyPart, mario.mario)) {
            mario.mario.takeDamage(cupid.damage, cupid)
        }
    }
    //decide if cupid will fire
    // if (cupid.index*100 == game.gameState.frameCounter%(cupids.length*100)){
    if (parseInt(Math.random() * 2000) == 0) {
        cupid.dom.src = preloadedFiringImage.src
        let bullet = bullets.createBullet("down", "enemy", cupid.x, cupid.y, 4, 8)

        setTimeout(() => {
            cupid.dom.src = "assets/enemies/TrumpCupid.png"
        }, 300)
    }

    if (parseInt(Math.random() * 6000) == 0) {
        let candy = healthItem.createHealthItem(cupid.x, cupid.y - 60, 20)
    }

    for (let walkable of walkables.walkables) {
        for (let walkableBody of walkable.body) {
            for (let cupidBody of cupid.body) {
                if (utils.IsBodyCollidingWithBody(cupidBody, walkableBody) && !cupid.hasExploded) {
                    cupid.velY = 0;
                    cupid.velX = 0;
                    cupid.hasExploded = true; // prevent future explosions
    
                    setTimeout(() => {
                        const explosionCircle = utils.createCircle(cupid.x, cupid.y, 150);
                        if (explosionCircle.div) explosionCircle.div.style.background = "rgba(255, 0, 0, 0.75)";
                        const explosionDamage = 50;
    
                        for (let entity of game.allEntities) {
                            if (entity === cupid) continue;
                            if (entity.disabled) continue;
    
                            for (let body of entity.body) {
                                if (utils.IsBodyCollidingWithBody(body, explosionCircle)) {
                                    entity.health -= explosionDamage;
    
                                    // Mario-specific check
                                    if (entity.name === "mario" && entity.health <= 0 && !entity.disabled) {
                                        entity.disabled = true;
                                        game.gameState.currentState = 'gameOver';
                                        game.updateMenuVisibility();
                                    }
    
                                    if (entity.health <= 0) {
                                        entity.disabled = true;
                                        if (entity.dom) entity.dom.remove();
                                        entity.body.forEach(b => {
                                            if (b.div) b.div.remove();
                                            b.active = false;
                                        });
                                        const idx = game.allEntities.indexOf(entity);
                                        if (idx !== -1) game.allEntities.splice(idx, 1);
                                    }
                                    break; // no need to keep checking other bodies of same entity
                                }
                            }
                        }
    
                        if (explosionCircle.div) explosionCircle.div.remove();
                        if (cupid.dom) cupid.dom.remove();
                        cupid.body.forEach(b => { if (b.div) b.div.remove(); });
                        const idx = game.allEntities.indexOf(cupid);
                        if (idx !== -1) game.allEntities.splice(idx, 1);
                        cupids = cupids.filter(t => t !== cupid);
    
                    }, 2000); // Shorten delay for explosion (e.g., 500 ms)
                }
            }
        }
    }
}



export function cupidVisuals(cupid) {
    cupid.dom.style.opacity = "100%";
    cupid.dom.style.setProperty('--cupid-x', `${cupid.x}px`);
    cupid.dom.style.setProperty('--cupid-y', `${-cupid.y}px`);

}


