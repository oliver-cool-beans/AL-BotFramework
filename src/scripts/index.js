import goo from "./goo/index.js";
import bee from "./bee/index.js";
import phoenix from "./phoenix/index.js"
import scheduler from "./merchant/scheduler.js";
import ent from "./ent/index.js";
import minimush from "./minimush/index.js";
import squig from "./squig/index.js";

const scripts = {
    goo : goo,
    bee: bee,
    phoenix: phoenix,
    merchant: scheduler, 
    ent: ent, 
    minimush: minimush, 
    squig: squig
}

export default scripts;