import kiteTarget from "./kiteTarget.js";
import safeAttack from "./safeAttack.js";
import noMove from "./noMove.js";

const moveStrategies = {
    "bigbird": kiteTarget,
    "boar": kiteTarget,
    "mvampire": kiteTarget,
    "skeletor": kiteTarget, 
    "cgoo": kiteTarget, 
    "mvampire": kiteTarget, 
    "franky": noMove, 
    "snowman": noMove
}

export const attackStrategies = {
    "skeletor": safeAttack, 
    "mvampire": safeAttack,
    "cgoo": safeAttack
}

export default moveStrategies