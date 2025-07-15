let allEntities = []
let walkables = []

const marioDiv = document.getElementById('mario');
const gameArea = document.getElementById('game-area');

let id = 0
//creates a circle collision body, it automatically created a debug div to help with visuals
function createCircle(x, y, radius) {
  let div = document.createElement("div")
  div.classList.add("circle")
  div.style.width = radius * 2 + "px";
  div.style.height = radius * 2 + "px";
  div.id = "debug-circle-" + id
  id++
  let debugDiv = document.getElementById("debug-visuals")
  debugDiv.append(div)
  return { type: "circle", "x": x, "y": y, "radius": radius, "active": true, "div": div }
}

function createRect(x, y, width, height) {
  let div = document.createElement("div")
  div.classList.add("rectangle")
  div.style.width = width + "px";
  div.style.height = height + "px";
  div.style.bottom = y + "px";
  div.style.left = x + "px";
  div.id = "debug-rectangle-" + id
  id++
  let debugDiv = document.getElementById("debug-visuals")
  debugDiv.append(div)
  return { type: "rectangle", "x": x, "y": y, "width": width, "height": height, "active": true, "div": div }
}

//give it a circle and an entity, and it will tell you if the circle is intercecting the unit
function IsBodyCollidingWithUnit(body, unit) {
  for (const unitBody of unit.body) {
    const result = IsBodyCollidingWithBody(body, unitBody)
    if (result.colliding) {
      return result
    }
  }
  return { colliding: false, yPenetration: 0 };
}

function IsBodyCollidingWithBody(bodyA, bodyB) {
  if (!bodyA.active || !bodyB.active) return { colliding: false, yPenetration: 0 };

  if (bodyA.type === "circle" && bodyB.type === "circle") {
    const dx = bodyA.x - bodyB.x;
    const dy = bodyA.y - bodyB.y;
    const distance = Math.hypot(dx, dy);
    const overlap = bodyA.radius + bodyB.radius - distance;
    return {
      colliding: distance <= bodyA.radius + bodyB.radius,
      yPenetration: overlap > 0 ? Math.min(overlap, Math.abs(dy)) : 0
    };
  }

  if (bodyA.type === "rectangle" && bodyB.type === "rectangle") {
    const xOverlap = bodyA.x < bodyB.x + bodyB.width && bodyA.x + bodyA.width > bodyB.x;
    const yOverlap = bodyA.y < bodyB.y + bodyB.height && bodyA.y + bodyA.height > bodyB.y;

    if (xOverlap && yOverlap) {
      const topA = bodyA.y;
      const bottomA = bodyA.y + bodyA.height;
      const topB = bodyB.y;
      const bottomB = bodyB.y + bodyB.height;

      const penetration = Math.min(bottomA, bottomB) - Math.max(topA, topB);
      return { colliding: true, yPenetration: penetration };
    }
    return { colliding: false, yPenetration: 0 };
  }

  const circle = bodyA.type === "circle" ? bodyA : bodyB;
  const rect = bodyA.type === "rectangle" ? bodyA : bodyB;

  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSquared = circle.radius * circle.radius;
  const isColliding = distanceSquared <= radiusSquared;

  if (isColliding) {
    const circleTop = circle.y - circle.radius;
    const circleBottom = circle.y + circle.radius;
    const rectTop = rect.y;
    const rectBottom = rect.y + rect.height;

    const overlapY = Math.min(circleBottom, rectBottom) - Math.max(circleTop, rectTop);
    return {
      colliding: true,
      yPenetration: overlapY > 0 ? overlapY : 0
    };
  }

  return { colliding: false, yPenetration: 0 };
}

function isPointCollidingWithBody(pointX, pointY, body) {

  if (!body.active) return 0;

  if (body.type === "circle") {
    const dx = pointX - body.x;
    const dy = pointY - body.y;
    const distSquared = dx * dx + dy * dy;
    const radiusSquared = body.radius * body.radius;

    if (distSquared <= radiusSquared) {
      const distance = Math.sqrt(distSquared);
      const penetrationDepth = body.radius - distance;

      // Calculate y-component of penetration
      if (distance > 0) {
        const normalY = dy / distance;
        return penetrationDepth * normalY;
      } else {
        // Point is at circle center
        return body.radius;
      }
    }
    return 0;
  }

  if (body.type === "rectangle") {

    if (
      pointX >= body.x &&
      pointX <= body.x + body.width &&
      pointY >= body.y &&
      pointY <= body.y + body.height
    ) {
      return Math.abs(  body.y + body.height - pointY);
    }
    return 0;
  }

  return 0;
}

//the character the player controls
let mario = {
  health: 100, //how much health point he has, if it reaches 0 he dies!
  attack_damage: 10, //how damage marios bullets deal to enemies
  accel: 1, //how quickly accelerates in x axis
  maxSpeed: 10, //maximum running speed in x axis
  jump_power: 35,
  state: "standing", //crouch, standing, airborne, dead
  gravity: 0.8, //the speed that which he is pushed down while airborne
  drag: 0.9, //how much mario slows downs in x axis if he's not actively walking left or right
  bullet_count: 1, //how many bullets mario will fire
  aimDirection: "left", //left, right, up
  velX: 0, //his current velocity in x axis
  velY: 0, //his current velocity in y axis
  x: 100, //his current x position 
  y: 100, //his current y position
  body: [createCircle(100, 100, 25), createCircle(100, 100 + 50, 25)], //his gameplay body represented in circles
  visual: document.getElementById("mario-img"), //his visual representation in the game
  updateFunc: marioUpdate
}

function isMarioTouchingGround() {
  for (let walkable of walkables) {
    for (let walkableBody of walkable.body) {
      const result = isPointCollidingWithBody(mario.x, mario.y, walkableBody)

      if (result > 0) {
        return result
      }
    }
  }
  return 0
}

let testCounter = 0

function marioUpdate() {
  //apply gravity to y velocity
  mario.velY -= mario.gravity

  // apply mario's gravity if he's in the air
  moveUnit(mario, 0, mario.velY)

  let resolveUp = isMarioTouchingGround()
  let grounded = (resolveUp < 1.0 && resolveUp != 0)
  
  if (resolveUp > 0){
    moveUnit(mario, 0, resolveUp)
    mario.velY = 0
  }
  // console.log(grounded, resolveUp, mario.x, mario.y, mario.velY)
  console.log(mario.y)
  if (mario.y != 30){
    testCounter++
  }else{
    console.log(testCounter)
    testCounter = 0
  }
  //if mario on the ground and jump button pressed
  if (keysPressed.up && grounded) {
    mario.velY += mario.jump_power
  }


  // add x acceleration
  if (keysPressed.left) {
    mario.velX -= mario.accel
  }
  if (keysPressed.right) {
    mario.velX += mario.accel
  }

  // apply max x speed
  if (mario.velX > mario.maxSpeed) {
    mario.velX = mario.maxSpeed
  }
  if (mario.velX < -mario.maxSpeed) {
    mario.velX = -mario.maxSpeed
  }

  //add x drag when one ground
  if (!keysPressed.left && !keysPressed.right && grounded) {
    if (mario.velX > 0.2) {
      mario.velX -= mario.drag
      if (mario.velX < 0) {
        mario.velX = 0
      }
    } else if (mario.velX < -0.2) {
      mario.velX += mario.drag
      if (mario.velX > 0) {
        mario.velX = 0
      }
    } else {
      mario.velX = 0
    }
  }

  //move mario by x velocity
  moveUnit(mario, mario.velX, 0)

  //don't allow mario to move past screen bounds
  if (mario.x < 0) {
    setUnit(mario, 0, mario.y)
  }
  if (mario.x > gameArea.offsetWidth - 50) {
    setUnit(mario, gameArea.offsetWidth - 50, mario.y)
  }
}

const ground = {
  body: [createRect(-5000, -970, 10000, 1000)]
}

//adding our created entities to allEntities if they are not static
allEntities.push(mario)

//
walkables.push(ground)

//moves a general unit by a specific vector and w/e circles constist of it's body
function moveUnit(unit, x, y) {
  unit.x += x
  unit.y += y
  for (bod of unit.body) {
    bod.x += x
    bod.y += y
  }
}

// Sets a general unit's position to specific position and w/e circles constist of it's body
function setUnit(unit, x, y) {
  const diffx = x - unit.x;
  const diffy = y - unit.y;
  unit.x = x;
  unit.y = y;
  for (const bod of unit.body) {
    bod.x += diffx;
    bod.y += diffy;
  }
}

//keeps track of which buttons are currently held down
const keysPressed = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: true,
};

const laserSpeed = 8;
let lasers = [];

// Listen for key presses
document.addEventListener('keydown', (event) => {
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
    fireLaser();
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

});



function fireLaser() {
  const laser = document.createElement('div');
  laser.className = 'laser';
  gameArea.appendChild(laser);

  const laserPosition = {
    x: spaceshipPosition.x + spaceship.offsetWidth / 2 - 2.5,
    y: gameArea.offsetHeight - spaceship.offsetHeight - 20
  };

  laser.style.left = laserPosition.x + 'px';
  laser.style.top = laserPosition.y + 'px';

  lasers.push({ element: laser, position: laserPosition });
}

let counter = 0
let prev = 0
// The main game loop
function gameLoop() {
  update();
  draw();
  counter++
  requestAnimationFrame(gameLoop);
}

function show() {
  // console.log(mario.body)
  // console.log(counter-prev)
  prev = counter
}

setInterval(show, 1000)

// Update the game state, only physics
function update() {
  // mario movement

  //running all entities' update function
  for (let entity of allEntities) {
    entity.updateFunc()
  }

  // // Laser movement
  // for (let i = lasers.length - 1; i >= 0; i--) {
  //   const laser = lasers[i];
  //   laser.position.y -= laserSpeed;

  //   if (laser.position.y < 0) {
  //     laser.element.remove();
  //     lasers.splice(i, 1);
  //   }
  // }
}

// Draw the game, only updating visual elements based on their objects
function draw() {
  for (let entity of allEntities) {
    //body debug visual update
    for (circle of entity.body) {
      circle.div.style.left = circle.x + 'px';
      circle.div.style.bottom = circle.y + 'px';
    }

    entity.visual.style.left = entity.x - 35 + 'px';
    entity.visual.style.bottom = entity.y + 'px';
  }

}

// Start the game
gameLoop();