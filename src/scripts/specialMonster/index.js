/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

async function specialMonster(bot, party, merchant, args = {}) {
    console.log(bot.name, "RUNNING SPECIAL MONSTER FOR", args.target?.type)
    const target = args.target

    // Check if this entity is still alive;
    if(!bot.character.entities.get(target.id)){
        //try moving and try again
        await bot.character.smartMove(target).catch(() => {})
        if(!bot.character.entities.get(target.id) && target.map == bot.character.map){
            console.log("This special monster is no longer alive");
            bot.target = null;
            bot.removeTask("specialMonster");
            return Promise.resolve("OK");
        }
    }

    if(bot.partyMonsters.includes(target?.type)){
        if(bot.checkPartyPresence(party).length <= 1) {
            console.log(bot.name, "the party has not assembled yet")
            return Promise.resolve("Party not present");
        }
    }

    if(!bot.character.ready) return Promise.reject("Character not ready");
    if(!target?.id) return Promise.reject("No Entity");

    const {hpot, mpot} = bot.calculatePotionItems();

    if(bot.characterClass == "merchant") return Promise.resolve("Not a combat class");
    
    const rallyPosition = args.entity

    if(!bot.runningScriptName == "specialMonster") {
        bot.runningScriptName = "specialMonster"
        await bot.character.smartMove(rallyPosition).catch((error) => {
            console.log("FAILED TO SMART MOVE IN SPECIAL", error)
        });;
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



    if(!bot.target && bot.target?.id !== target.id){
        bot.target = target;
    }
    // If we've got no target, get a valid target;
    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, [target.type]);
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return entities?.get && !!entities.get(target?.id);
}

export default specialMonster;