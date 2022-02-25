/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["minimush"];

async function minimush(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");

    const {hpot, mpot} = bot.calculatePotionItems();

    if(bot.characterClass == "merchant") return Promise.resolve("Not a combat class");
    
    const rallyPosition = "minimush";

    if(!bot.runningScriptName == "minimush") {
        bot.runningScriptName = "minimush"
        await bot.character.smartMove(rallyPosition).catch(() => {});;
    }
    

    await utils.checkIfPotionsLow(bot, 20) && bot.addTask({
        script: "buyPotions", 
        user: bot.name, 
        priority: 2,
        force: true,
        args: {
            nextPosition: rallyPosition, 
            amount: 200
        }
    });

    if(bot.character.isFull()) bot.addTask({
        script: "bankItems", 
        user: bot.name, 
        priority: 1,
        force: true,
        args: {
            itemsToHold: [hpot, mpot, "tracker"], 
            goldToHold: 20000,
            nextPosition: rallyPosition
        }
    })

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {});
        }
    }

    // If we've got no target, get a valid target;
    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, targets);
        if(!bot.target) await bot.character.smartMove("minimush").catch(() => {});
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target || !Object.keys(entities)) return false;
    return entities?.get && !!entities.get(target?.id);
}

export default minimush;