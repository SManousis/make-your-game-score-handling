
export let id = 0
//creates a circle collision body, it automatically created a debug div to help with visuals
export function createCircle(centerX, centerY, radius) {
    let div = document.createElement("div")
    div.classList.add("circle")
    div.style.width = radius * 2 + "px";
    div.style.height = radius * 2 + "px";
    div.style.bottom = centerY + "px";
    div.style.left = centerX + "px";
    div.id = "debug-circle-" + id
    id++
    let debugDiv = document.getElementById("debug-visuals")
    debugDiv.append(div)
    return { type: "circle", "x": centerX, "y": centerY, "radius": radius, "active": true, "div": div }
}

export function createRect(x, y, width, height) {
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
export function IsBodyCollidingWithUnit(body, unit) {
    for (const unitBody of unit.body) {
        if (IsBodyCollidingWithBody(body, unitBody)) {
            return true
        }
    }
    return false;
}

export function IsBodyCollidingWithBody(bodyA, bodyB) {
    if (!bodyA.active || !bodyB.active) return false;

    if (bodyA.type === "circle" && bodyB.type === "circle") {
        const dx = bodyA.x - bodyB.x;
        const dy = bodyA.y - bodyB.y;
        const distance = Math.hypot(dx, dy);
        return distance <= bodyA.radius + bodyB.radius;
    }

    if (bodyA.type === "rectangle" && bodyB.type === "rectangle") {
        return (
            bodyA.x < bodyB.x + bodyB.width &&
            bodyA.x + bodyA.width > bodyB.x &&
            bodyA.y < bodyB.y + bodyB.height &&
            bodyA.y + bodyA.height > bodyB.y
        );
    }

    const circle = bodyA.type === "circle" ? bodyA : bodyB;
    const rect = bodyA.type === "rectangle" ? bodyA : bodyB;

    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

export function isPointCollidingWithBody(pointX, pointY, body) {
    if (!body.active) return { vertical: 0, horizontal: 0 };

    if (body.type === "circle") {
        const dx = pointX - body.x;
        const dy = pointY - body.y;
        const distSquared = dx * dx + dy * dy;
        const radiusSquared = body.radius * body.radius;

        if (distSquared <= radiusSquared) {
            const distance = Math.sqrt(distSquared);
            const penetrationDepth = body.radius - distance;

            if (distance > 0) {
                const normalX = dx / distance;
                const normalY = dy / distance;
                return {
                    vertical: penetrationDepth * normalY,
                    horizontal: penetrationDepth * normalX
                };
            } else {
                return { vertical: body.radius, horizontal: body.radius };
            }
        }
        return { vertical: 0, horizontal: 0 };
    }

    if (body.type === "rectangle") {
        if (
            pointX >= body.x &&
            pointX <= body.x + body.width &&
            pointY >= body.y &&
            pointY <= body.y + body.height
        ) {
            const left = -(pointX - body.x);
            const right = body.x + body.width - pointX;
            const top = -(pointY - body.y);
            const bottom = body.y + body.height - pointY;

            return {
                vertical: minMag(top, bottom),
                horizontal: minMag(left, right)
            };
        }
        return { vertical: 0, horizontal: 0 };
    }

    return { vertical: 0, horizontal: 0 };
}


export function largestMag(a, b) {
    if (Math.abs(a) > Math.abs(b)) {
        return a
    }
    return b
}

export function minMag(a, b) {
    if (Math.abs(a) < Math.abs(b)) {
        return a
    }
    return b
}


//moves a general unit by a specific vector and w/e circles constist of it's body
export function moveUnit(unit, x, y) {
    unit.x += x
    unit.y += y
    for (const bod of unit.body) {
        bod.x += x
        bod.y += y
    }
}

// Sets a general unit's position to specific position and w/e circles constist of it's body
export function setUnit(unit, x, y) {
    const diffx = x - unit.x;
    const diffy = y - unit.y;
    unit.x = x;
    unit.y = y;
    for (const bod of unit.body) {
        bod.x += diffx;
        bod.y += diffy;
    }
}
