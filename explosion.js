
import { allEntities, aoeDamage, audio } from "./game.js";
import { moveAndCollide } from "./physicsStep.js";
import * as utils from "./utils.js"

export function createExplosion(x, y, team, damage = 50, radius = 150, flashDuration = 2) {
    const explosionBody = document.createElement('img');
    explosionBody.className = "explosion-img";
    explosionBody.src = "assets/items/explosion.svg";
    // explosionBody.style.left = (explosion.x  ) + 'px';
    // explosionBody.style.bottom = (explosion.y - 5 ) + 'px';

    

    document.getElementById('game-area').appendChild(explosionBody);

    const explosion = {
        name: "explosion",
        damage: damage,
        x: x,
        y: y,
        active: true,
        aliveFrames: 0,
        radius: radius,
        body: [utils.createCircle(x, y, radius)],
        dom: explosionBody,
        disabled: false,
        flashDuration: flashDuration, //how long the explosion flash will last
        
        updateFunc: function () {explosionUpdate(this)},
        drawFunc: function () {explosionVisuals(this)},
        team: team,
    };

    aoeDamage.push(explosion)
    allEntities.push(explosion);
    return explosion;
}


export function explosionUpdate(entity) {
    entity.flashDuration--

    if (entity.flashDuration == 0){
        utils.destroyUnit(entity)
    }


    if (entity.active && entity.aliveFrames == 10){
     
        entity.active = false
        
        for (let bodyShape of entity.body){
            bodyShape.active = false
        }
    }

    entity.aliveFrames++
}


export function explosionVisuals(entity) {
    if (!entity || !entity.dom) return;
    entity.dom.style.setProperty('--x', `${entity.x}px`);
    entity.dom.style.setProperty('--y', `${-entity.y}px`);
}






export function createBomb(x, y, startVelX, startVelY, team, damage = 50, radius = 150, countdownTime = 3, canFall = true, explodeOnContact = false, countDownVisible = true, img = "assets/items/bomb.svg"){
    const bombBody = document.createElement('img');
    bombBody.className = "bomb-img";
    bombBody.src = img;
    document.getElementById('game-area').appendChild(bombBody);

    
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'bomb-countdown';
    countdownDiv.textContent = 'yo';
    document.getElementById('game-area').appendChild(countdownDiv);


    const bomb = {
        name: "bomb",
        damage: damage,
        velX: startVelX,
        velY: startVelY,
        x: x,
        y: y,
        explodeOnContact: explodeOnContact,
        countdown: countdownTime*60,
        radius: radius,
        exploded: false,
        countDownVisible: countDownVisible,
        body: [],
        dom: bombBody,
        countdownDiv: countdownDiv,
        disabled: false,
        gravity: 0.5,
        canFall: canFall,
        updateFunc: function () {bombUpdate(this)},
        drawFunc: function () {bombVisuals(this)},
        team: team,
        destroySound: "bomb",
        physicsPointsOffsets: [
            { x: 0, y: 0 }, // Left foot
       
        ],
    };

    
    

    allEntities.push(bomb);
    return bomb;
}


export function bombUpdate(entity) {
   
    entity.countdown--;
    if (entity.countDownVisible){
        entity.countdownDiv.textContent = entity.countdown > 5 ? parseInt(1+entity.countdown/60) : '💥' ;
        // TODO: Implement tick sound
        if (audio.sounds && entity.countdown > 5) {
            audio.manager.playSample("tick", {
                gain: audio.soundsVolume,
                throttleMs: 1000,
            })
        }
    }else{
        entity.countdownDiv.textContent = ''
    }
    
    if (entity.countdown <= 0) {
    
        createExplosion(entity.x, entity.y, entity.team, entity.damage, entity.radius)
        entity.countdownDiv.remove()
        utils.destroyUnit(entity)
    }

    if (entity.canFall){
        const grounded = moveAndCollide(entity)
        if (grounded){
            if (Math.abs(entity.velX) < 2){
                entity.velX = 0
            }else if (entity.velX > 0){
                entity.velX -= 2
            }else{
                entity.velX += 2
            }
        }

        if (entity.explodeOnContact && grounded){
            createExplosion(entity.x, entity.y, entity.team, entity.damage, entity.radius)
            entity.countdownDiv.remove()
            utils.destroyUnit(entity)
        }
    }
}


export function bombVisuals(entity) {
     entity.dom.style.opacity = "100%";
    if (!entity || !entity.dom) return;
    entity.dom.style.setProperty('--x', `${entity.x}px`);
    entity.dom.style.setProperty('--y', `${-entity.y}px`);
    entity.countdownDiv.style.setProperty('--x', `${entity.x}px`);
    entity.countdownDiv.style.setProperty('--y', `${-entity.y}px`);
}
