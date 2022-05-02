/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["snake", "osnake"];

async function snake(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");
    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, targets);

    if(!bot.checkTarget(targetData, bot.character.entities, targets)) {
        bot.setTarget(null);
        targetData = utils.findClosestTarget(bot.AL, bot.character, party, targets);
    }

    if(bot.character.target !== targetData?.id) bot.setTarget(targetData?.id);

    const rallyPosition = {x: -541.2208544380876, y: -536.1707341024603, map: 'halloween'};

    if(!bot.runningScriptName == "snake") {
        bot.runningScriptName = "snake"
                await bot.character.smartMove(rallyPosition, {useBlink: bot.character.ctype == 'mage'}).catch(() => {});
;
    }
    
    // If we've got no target, get a valid target;
    if(!bot.character.target) {
                await bot.character.smartMove(rallyPosition, {useBlink: bot.character.ctype == 'mage'}).catch(() => {});

    }

    return Promise.resolve("Finished");
}


export default snake;