
import { allEntities, aoeDamage } from "./game.js";
import { moveAndCollide } from "./physicsStep.js";
import * as utils from "./utils.js"

export function createExplosion(x, y, team, damage = 50, radius = 150, flashDuration = 30) {
    const explosionBody = document.createElement('img');
    explosionBody.className = "explosion-img";
    explosionBody.src = "assets/items/explosion.png";
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


    if (entity.active && entity.aliveFrames == 1){
     
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






export function createBomb(x, y, team, damage = 50, radius = 150, countdownTime = 3, canFall = true){
    const bombBody = document.createElement('img');
    bombBody.className = "bomb-img";
    bombBody.src = "assets/items/bomb.png";
    document.getElementById('game-area').appendChild(bombBody);

    
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'bomb-countdown';
    countdownDiv.textContent = 'yo';
    document.getElementById('game-area').appendChild(countdownDiv);


    const bomb = {
        name: "bomb",
        damage: damage,
        velX: 0,
        velY: 0,
        x: x,
        y: y,
        countdown: countdownTime*60,
        radius: radius,
        exploded: false,
        body: [],
        dom: bombBody,
        countdownDiv: countdownDiv,
        disabled: false,
        gravity: 0.5,
        canFall: canFall,
        updateFunc: function () {bombUpdate(this)},
        drawFunc: function () {bombVisuals(this)},
        team: team,
        physicsPointsOffsets: [
            { x: 0, y: 0 }, // Left foot
       
        ],
    };

    
    

    allEntities.push(bomb);
    return bomb;
}


export function bombUpdate(entity) {
   
    entity.countdown--;
    entity.countdownDiv.textContent = entity.countdown > 5 ? parseInt(1+entity.countdown/60) : '💥' ;
    
    if (entity.countdown <= 0) {
    
        createExplosion(entity.x, entity.y, entity.team, entity.damage, entity.radius)
        entity.countdownDiv.remove()
        utils.destroyUnit(entity)
    }

    if (entity.canFall){
        
        const grounded = moveAndCollide(entity)
        
    }
}


export function bombVisuals(entity) {
    if (!entity || !entity.dom) return;
    entity.dom.style.setProperty('--x', `${entity.x}px`);
    entity.dom.style.setProperty('--y', `${-entity.y}px`);
    entity.countdownDiv.style.setProperty('--x', `${entity.x}px`);
    entity.countdownDiv.style.setProperty('--y', `${-entity.y}px`);
}
