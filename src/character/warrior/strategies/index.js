import kiteTarget from "./kiteTarget.js";
import kiteBoss from "./kiteTarget.js";
import cleave from "./cleave.js";


export const moveStrategies = {
    "skeletor": kiteBoss, 
    "mvampire": kiteBoss,
    "boar": kiteTarget, 
}

export const attackStrategies = {
    "bee": cleave
}
