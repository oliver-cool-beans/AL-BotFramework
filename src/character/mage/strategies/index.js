import kiteTarget from "./kiteTarget.js";
import safeAttack from "./safeAttack.js";
import noMove from "./noMove.js";
import attackIfTarget from "./attackIfTarget.js";


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
    "poisio": kiteTarget, 
    "scorpion": kiteTarget, 
    "stoneworm": kiteTarget
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
    "stonework": safeAttack
}
