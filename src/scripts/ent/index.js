/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["ent"];

async function ent(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");

    const {hpot, mpot} = bot.calculatePotionItems();
    const leader = party.find((member) => member.isLeader);

    if(bot.characterClass == "merchant") return Promise.resolve("Not a combat class");
    
    const rallyPosition = "ent";

    if(!bot.runningScriptName == "ent") {
        bot.runningScriptName = "ent"
        await bot.character.smartMove(rallyPosition).catch(() => {});
    }
    

    await utils.checkIfPotionsLow(bot, 20) && bot.addTask({
        script: "buyPotions", 
        user: bot.name, 
        force: true,
        args: {
            nextPosition: rallyPosition, 
            amount: 200
        }
    });

    if(bot.character.isFull()) bot.addTask({
        script: "bankItems", 
        user: bot.name, 
        force: true,
        args: {
            itemsToHold: [hpot, mpot], 
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
        const bestTarget = utils.findClosestTarget(bot.AL, bot.character, party, targets, false, false);
        while(bestTarget && !bestTarget?.target){
            console.log(`${bot.name} ${bestTarget?.name} has no target, waiting until it does`)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        bot.target = bestTarget;
        console.log(bot.name, "set target to", bot.target?.name)
        if(!bot.target) await bot.character.smartMove("ent").catch(() => {});
    }

    if(leader.target?.id !== bot.target?.id) bot.target == leader.target;
    
    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return entities?.get && !!entities.get(target?.id);
}

export default ent;