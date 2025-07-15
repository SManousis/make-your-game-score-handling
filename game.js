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

// Listen for key presses
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    keysPressed.left = true;
  } else if (event.key === 'ArrowRight') {
    keysPressed.right = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft') {
    keysPressed.left = false;
  } else if (event.key === 'ArrowRight') {
    keysPressed.right = false;
  }
});

// The main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Update the game state
function update() {
  if (keysPressed.left && spaceshipPosition.x > 0) {
    spaceshipPosition.x -= spaceshipSpeed;
  }
  if (keysPressed.right && spaceshipPosition.x < gameArea.offsetWidth - spaceship.offsetWidth) {
    spaceshipPosition.x += spaceshipSpeed;
  }
}

// Draw the game
function draw() {
  spaceship.style.left = spaceshipPosition.x + 'px';
}

// Start the game
gameLoop();