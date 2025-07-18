
export const laserSpeed = 8;
export let lasers = [];

export function fireLaser() {
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


    // // Laser movement
    // for (let i = lasers.length - 1; i >= 0; i--) {
    //   const laser = lasers[i];
    //   laser.position.y -= laserSpeed;

    //   if (laser.position.y < 0) {
    //     laser.element.remove();
    //     lasers.splice(i, 1);
    //   }
    // }

