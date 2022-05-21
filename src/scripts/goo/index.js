/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["goo"];

const rallyPosition = {x: -22.542455229658678, y: 762.1368823176715, map: 'main'};

async function goo(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");
    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, targets);

    if(!bot.checkTarget(targetData, bot.character.entities, targets)) {
        bot.setTarget(null);
        targetData = utils.findClosestTarget(bot.AL, bot.character, party, targets);
    }

    if(bot.character.target !== targetData?.id) bot.setTarget(targetData?.id);
    
    // If we've got no target, get a valid target;
    if(!bot.character.target) {
        await bot.character.smartMove("goo").catch(() => {});
    }

    return Promise.resolve("Finished");
}


export default goo;