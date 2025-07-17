let cupid = {
    health: 100,
    damage: 10,
    moveSpeed: 2,
    x: 0,
    y: 0,
    bullet_count: 1,
    aimDirection: "down",
    state: "airborne",
    velX: 2,
    body: [createCircle(600, 150 + 25, 10), createCircle(600, 0 + 50 + 25, 25)],
    updateFunc: cupidUpdate
}

function cupidUpdate() {
    
}
