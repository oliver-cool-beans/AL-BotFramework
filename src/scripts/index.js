import goo from "./goo/index.js";
import bee from "./bee/index.js";
import phoenix from "./phoenix/index.js"
import scheduler from "./merchant/scheduler.js";
import ent from "./ent/index.js";
import minimush from "./minimush/index.js";
import iceroamer from "./iceroamer/index.js";
import squig from "./squig/index.js";
import bat from "./bat/index.js";
import specialMonster from "./specialMonster/index.js";
import bosses from "./bosses/index.js";
import frog from "./frog/index.js";
import crab from "./crab/index.js";
import snake from "./snake/index.js";
import bigbird from "./bigbird/index.js";
import osnake from "./osnake/index.js";
import arcticbee from "./arcticbee/index.js";
import squigtoad from "./squigtoad/index.js";
import croc from "./croc/index.js";
import cgoo from "./cgoo/index.js";
import rat from "./rat/index.js";
import scorpion from "./scorpion/index.js";
import spider from "./spider/index.js";
import gscorpion from "./gscorpion/index.js";
import boar from "./boar/index.js";
import armadillo from "./armadillo/index.js";
import stoneworm from "./stoneworm/index.js";
import monsterHunt from "./monsterHunt/index.js";
import crabx from "./crabx/index.js";
import porcupine from "./porcupine/index.js";
import poisio from "./poisio/index.js";
import tortoise from "./tortoise/index.js";
import nerfedmummy from "./nerfedmummy/index.js";

const scripts = {
    merchant: scheduler,
    goo,
    bee,
    //phoenix,
    ent, 
    minimush, 
    squig,
    bat,
    frog,
    crab, 
    snake,
    arcticbee,
    squigtoad,
    croc,
    rat,
    scorpion,
    gscorpion,
    spider,
    cgoo,
    osnake,
    armadillo,
    crabx,
    porcupine,
    stoneworm,
    iceroamer,
    poisio,
    tortoise,
    nerfedmummy,
   // boar,
   // bigbird,
    specialMonster, 
    monsterHunt,
    ...bosses
}

export default scripts;