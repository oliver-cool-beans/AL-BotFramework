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
            bot.character.target = null;
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
    bot.character.target = bot.character.getTargetEntity() || null;
    if(!target?.id) return Promise.reject("No Entity");


    const rallyPosition = args.entity

    if(!bot.runningScriptName == "specialMonster") {
        bot.runningScriptName = "specialMonster"
        await bot.character.smartMove(rallyPosition).catch((error) => {
            console.log("FAILED TO SMART MOVE IN SPECIAL", error)
        });;
    }

    if(!bot.character.target && bot.character.target?.id !== target.id){
        bot.character.target = target;
    }

    // If we've got no target, get a valid target;
    if(!bot.character.target || !bot.checkTarget(bot?.target, bot.character.entities, targets)) {
        bot.character.target = utils.findClosestTarget(bot.AL, bot.character, party, [target.type]);
    }

    return Promise.resolve("Finished");
}



export default specialMonster;