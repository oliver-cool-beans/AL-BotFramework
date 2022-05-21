import kiteTarget from "./kiteTarget.js";
import safeAttack from "./safeAttack.js";
import noMove from "./noMove.js";
import attackIfTarget from "./attackIfTarget.js";
import kiteInCircle from "./kiteInCircle.js";
import cburst from "./cburst.js";

export const moveStrategies = {
    "bigbird": kiteTarget,
    "boar": kiteTarget,
    "mvampire": kiteTarget,
    "skeletor": kiteTarget, 
    "cgoo": kiteTarget, 
    "mvampire": kiteTarget, 
    "franky": noMove, 
    "snowman": noMove, 
    "crabx": kiteTarget, 
    "iceroamer": kiteTarget,
    "poisio": kiteInCircle, 
    "scorpion": kiteTarget, 
    "stoneworm": kiteTarget,
    "snowman": kiteInCircle, 
    "bee": noMove
}

export const attackStrategies = {
    "skeletor": safeAttack, 
    "mvampire": safeAttack,
    "cgoo": safeAttack, 
    "franky": attackIfTarget, 
    "crabx": safeAttack, 
    "iceroamer": safeAttack,
    "scorpion": safeAttack,
    "poisio": safeAttack, 
    "stoneworm": safeAttack,
    "goo": cburst,
    "bee": cburst
}
