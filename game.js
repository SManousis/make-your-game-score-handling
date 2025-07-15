const spaceship = document.getElementById('spaceship');
const gameArea = document.getElementById('game-area');

let spaceshipPosition = {
  x: spaceship.offsetLeft,
};

const keysPressed = {
  left: false,
  right: false,
};

const spaceshipSpeed = 5;
const laserSpeed = 8;
let lasers = [];

// Listen for key presses
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    keysPressed.left = true;
  } else if (event.key === 'ArrowRight') {
    keysPressed.right = true;
  }

  if (event.key === ' ' || event.code === 'Space') {
    fireLaser();
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft') {
    keysPressed.left = false;
  } else if (event.key === 'ArrowRight') {
    keysPressed.right = false;
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

// The main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Update the game state
function update() {
  // Spaceship movement
  if (keysPressed.left && spaceshipPosition.x > 0) {
    spaceshipPosition.x -= spaceshipSpeed;
  }
  if (keysPressed.right && spaceshipPosition.x < gameArea.offsetWidth - spaceship.offsetWidth) {
    spaceshipPosition.x += spaceshipSpeed;
  }

  // Laser movement
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.position.y -= laserSpeed;

    if (laser.position.y < 0) {
      laser.element.remove();
      lasers.splice(i, 1);
    }
  }
}

// Draw the game
function draw() {
  spaceship.style.left = spaceshipPosition.x + 'px';

  for (const laser of lasers) {
    laser.element.style.top = laser.position.y + 'px';
  }
}

// Start the game
gameLoop();