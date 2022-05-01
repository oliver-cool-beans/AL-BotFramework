/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["cgoo"];

async function cgoo(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");
    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, targets);

    if(!bot.checkTarget(targetData, bot.character.entities, targets)) {
        bot.setTarget(null);
        targetData = utils.findClosestTarget(bot.AL, bot.character, party, targets);
    }

    if(bot.character.target !== targetData?.id) bot.setTarget(targetData?.id);

    const rallyPosition = "cgoo";

    if(!bot.runningScriptName == "cgoo") {
        bot.runningScriptName = "cgoo"
        await bot.character.smartMove(rallyPosition).catch(() => {});;
    }
    
    // If we've got no target, get a valid target;
    if(!bot.character.target) {
        await bot.character.smartMove("arena").catch(() => {});
    }

    const tasks = bot.getTasks();
    const itemPosition = bot.character.locateItem("gem1");

    if(itemPosition !== undefined && bot.character.items[itemPosition]?.q >= 50 && !tasks.find((task) => task.script == "bankItems")){
        const {hpot, mpot} = bot.calculatePotionItems();

        bot.addTask({
            id: bot.createTaskId("bankItems", bot.character.serverData.region, bot.character.serverData.name),
            script: "bankItems", 
            user: bot.name, 
            priority: 1,
            force: true,
            args: {
                itemsToHold: [hpot, mpot, "tracker"].concat(bot.itemsToHold), 
                goldToHold: 100000,
                nextPosition: {x: bot.character.x, y: bot.character.y, map: bot.character.map}, 
                serverRegion: bot.character.serverData.region, 
                serverIdentifier: bot.character.serverData.name
            }
        })
    }

    return Promise.resolve("Finished");
}


export default cgoo;