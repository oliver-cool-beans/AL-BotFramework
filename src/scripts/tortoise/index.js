/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["tortoise"];

async function tortoise(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");
    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, targets);

    if(!bot.checkTarget(targetData, bot.character.entities, targets)) {
        bot.setTarget(null);
        targetData = utils.findClosestTarget(bot.AL, bot.character, party, targets);
    }

    if(bot.character.target !== targetData?.id) bot.setTarget(targetData?.id);

    const rallyPosition = "tortoise";

    if(!bot.runningScriptName == "tortoise") {
        bot.runningScriptName = "tortoise"
        await bot.character.smartMove(rallyPosition).catch(() => {});;
    }
    
    // If we've got no target, get a valid target;
    if(!bot.character.target) {
        await bot.character.smartMove("tortoise").catch(() => {});
    }

    return Promise.resolve("Finished");
}


export default tortoise;