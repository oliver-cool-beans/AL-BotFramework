import kiteTarget from "./kiteTarget.js";
import safeAttack from "./safeAttack.js";

const moveStrategies = {
    "bigbird": kiteTarget,
    "boar": kiteTarget,
    "mvampire": kiteTarget,
    "skeletor": kiteTarget, 
    "cgoo": kiteTarget
}

export const attackStrategies = {
    "skeletor": safeAttack, 
    "cgoo": safeAttack
}

export default moveStrategies