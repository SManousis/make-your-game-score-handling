import { allGroups, soundsVolume } from "./game.js";
import * as audio from "./audio.js"

export let id = 0
//creates a circle collision body, it automatically created a debug div to help with visuals
export function createCircle(centerX, centerY, radius) {
    let div = document.createElement("div")
    div.classList.add("circle")
    div.style.width = radius * 2 + "px";
    div.style.height = radius * 2 + "px";
    div.style.bottom = 0 + "px";
    div.style.left = 0 + "px";
    div.style.setProperty('--x', centerX)
    div.style.setProperty('--y', -centerY)
    div.id = "debug-circle-" + id

    id++
    let debugDiv = document.getElementById("debug-visuals")
    debugDiv.append(div)
    return { type: "circle", "x": centerX, "y": centerY, "radius": radius, "active": true, "div": div }
}


export function createRect(x, y, width, height, statis = false) {
    let div = document.createElement("div")
    div.classList.add("rectangle")
    div.style.width = width + "px";
    div.style.height = height + "px";

    if (statis) {
        div.style.bottom = y + "px";
        div.style.left = x + "px";
    } else {
        div.style.bottom = 0 + "px";
        div.style.left = 0 + "px";
    }

    div.style.setProperty('--x', x)
    div.style.setProperty('--y', -y)

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

export function isPointCollidingWithBody(pointX, pointY, body, velX, velY) {
    if (!body.active) return { vertical: 0, horizontal: 0 };

    if (body.type === "circle") {
        const distX = pointX - body.x;
        const distY = pointY - body.y;
        const distSquared = distX * distX + distY * distY;
        const radiusSquared = body.radius * body.radius;

        if (distSquared <= radiusSquared) {

            // let finalX = pointX;
            // let finalY = pointY;

            // const p1x = pointX - velX;
            // const p1y = pointY - velY;
            // const p2x = pointX;
            // const p2y = pointY;

            // const cx = body.x;
            // const cy = body.y;
            // const r = body.radius;

            // const dx = p2x - p1x;
            // const dy = p2y - p1y;
            // const fx = p1x - cx;
            // const fy = p1y - cy;

            // const a = dx * dx + dy * dy;
            // const b = 2 * (fx * dx + fy * dy);
            // const c = fx * fx + fy * fy - r * r;

            // const delta = b * b - 4 * a * c;

            // if (delta >= 0 && a !== 0) {
            //     const sqrtD = Math.sqrt(delta);
            //     const t1 = (-b - sqrtD) / (2 * a);
            //     const t2 = (-b + sqrtD) / (2 * a);

            //     let t = Number.POSITIVE_INFINITY;

            //     if (t1 >= 0 && t1 <= 1) t = t1;
            //     else if (t2 >= 0 && t2 <= 1) t = t2;

            //     if (t !== Number.POSITIVE_INFINITY) {
            //         finalX = p1x + dx * t;
            //         finalY = p1y + dy * t;
            //     }
            // }

            // return { horizontal: pointX - finalX, vertical: pointY - finalY };


            const distance = Math.sqrt(distSquared);
            const penetrationDepth = body.radius - distance;

            if (distance > 0) {
                const normalX = distX / distance;
                const normalY = distY / distance;
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
                vertical: velY > 0 ? top : bottom,
                horizontal: velX > 0 ? left : right
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

export function opDebounce(fn, wait, options = {}) {
    let timeout;
    let lastCallTime;

    return function (...args) {
        const now = Date.now();
        const callNow = options.leading && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            timeout = null;
            if (!options.leading) {
                fn.apply(this, args);
            }
        }, wait);

        if (callNow) {
            fn.apply(this, args);
        }
    };
}

export function getRandomInt(min = 30, max = 250) {
    return Math.floor((Math.random() + 0.2) * (max - min + 1)) + min;
}



export function removeUnitFromArray(unit, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === unit) {
            array.splice(i, 1); // ✅ Remove at index i
            break;
        }
    }
}

export function destroyUnit(unit) {
    for (let group of allGroups) {
        removeUnitFromArray(unit, group)
    }
    unit.body.forEach(b => { if (b.div) b.div.remove(); })
    if (unit.dom) unit.dom.remove();
}


export function kamikaze(unit, target) {
    const adjacent = unit.x - target.x
    const opposite = unit.y - target.y
    const angle = Math.atan2(opposite, adjacent)
    unit.velX = - unit.kamikazeSpeed * Math.cos(angle)
    unit.velY = -(unit.kamikazeSpeed * Math.sin(angle))
    unit.moveSpeed = unit.kamikazeSpeed
    unit.damage = 90
}