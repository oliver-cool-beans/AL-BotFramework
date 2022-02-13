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
import frog from "./frog/index.js";
import crab from "./crab/index.js";
import snake from "./snake/index.js";
import monsterHunt from "./monsterHunt/index.js";

const scripts = {
    merchant: scheduler,
    goo,
    bee,
    phoenix,
    ent, 
    minimush, 
    squig,
    bat,
    frog,
    crab, 
    snake,
    specialMonster, 
    monsterHunt,
    ...bosses
}

export default scripts;