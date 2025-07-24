export function createHealthItem(x, y, healthAdd = 20){
    let healthItemBody = document.createElement("img");
    healthItemBody.className = "health-item-img";
    healthItemBody.src = "assets/items/healthItem.png";
    document.getElementById("game-area").appendChild(healthItemBody);

    let healthItem = {
        x: x,
        y: y,
        velY: 5,
        healthAdd: healthAdd,
        body: [utils.createCircle(x, y, 10)],
        updateFunc: function() { healthItemUpdate(this) },
        drawFunc: function() { healthItemVisuals(this) },
        dom: healthItemBody,
        team: "player",
    }
    allEntities.push(healthItem);
    return healthItem
}

export function healthItemUpdate(healthItem) {
    utils.moveUnit(healthItem, 0, healthItem.velY)
    setTimeout(() => {
        healthItem.dom.remove()
        healthItem.body.forEach(body => body.div.remove())
        allEntities = allEntities.filter(t => t !== healthItem)
    }, 10000)
}

export function healthItemVisuals(healthItem) {
    healthItem.dom.style.opacity = "100%";
    healthItem.dom.style.setProperty('--health-item-x', `${healthItem.x}px`);
    healthItem.dom.style.setProperty('--health-item-y', `${-healthItem.y}px`);
}
