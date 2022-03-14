import kiteTarget from "./kiteTarget.js";
import kiteBoss from "./kiteTarget.js";
import cleave from "./cleave.js";
import agitate from "./agitate.js";

export const moveStrategies = {
    "skeletor": kiteBoss, 
    "mvampire": kiteBoss,
    "boar": kiteTarget, 
}

export const attackStrategies = {
    "bee": cleave,
    "osnake": cleave, 
    "snake": cleave,
    "crab": cleave
}

export const supportStrategies = {
    "osnake": agitate, 
    "snake": agitate
}
