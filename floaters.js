import * as utils from './utils.js'
import {mario} from './mario.js'

export let floatingTest = []

export let floaterCircle = {
    body: [utils.createCircle(900, 150, 50)],
    updateFunc: floaterCircleUpdate
}

export function floaterCircleUpdate() {
    if (utils.IsBodyCollidingWithUnit(floaterCircle.body[0], mario)) {
        floaterCircle.body[0].div.style["background-color"] = "black";
    } else {
        floaterCircle.body[0].div.style["background-color"] = "white";
    }
}

export let floaterRect = {
    body: [utils.createRect(200, 200, 50, 50)],
    updateFunc: floaterRectUpdate
}

export function floaterRectUpdate() {
    if (utils.IsBodyCollidingWithUnit(floaterRect.body[0], mario)) {
        floaterRect.body[0].div.style["background-color"] = "black";
    } else {
        floaterRect.body[0].div.style["background-color"] = "white";
    }
}

