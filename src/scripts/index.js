import goo from "./goo/index.js";
import bee from "./bee/index.js";
import phoenix from "./phoenix/index.js"
import scheduler from "./merchant/scheduler.js";
import ent from "./ent/index.js";
import minimush from "./minimush/index.js";
import squig from "./squig/index.js";
import bat from "./bat/index.js";
import specialMonster from "./specialMonster/index.js";
import bosses from "./bosses/index.js";

const scripts = {
    goo : goo,
    bee: bee,
    phoenix: phoenix,
    merchant: scheduler, 
    ent: ent, 
    minimush: minimush, 
    squig: squig, 
    bat: bat, 
    specialMonster, 
    ...bosses
}

export default scripts;