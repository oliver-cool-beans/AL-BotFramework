/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import scout from "./scout.js"
import utils from "../utils/index.js";

const targets = ['phoenix'];

async function phoenix(bot, party, merchant, args = {}) {
    if(!bot.character.ready) return Promise.reject("Character not ready");

    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, targets)
    if(!targetData){
        console.log(bot.name, "No phoenix in area, setting target from args")
        targetData = args?.target
    }

    console.log(bot.name, "IS RUNNING PHOENIX *****************", targetData?.type, args?.target?.id, targetData?.hp, targetData?.dead)

    if(bot.runningScriptName != "phoenix" && targetData?.id) {
        bot.runningScriptName = "phoenix" 
        await bot.character.smartMove(targetData).catch(() => {});;
    }
    
    if(bot.character.target !== targetData?.id) bot.setTarget(targetData?.id);

    if(!targetData){
         // Get someone who's got the phoenix target;
        const memberWithTarget = party.find((member) => member.character?.getTargetEntity()?.type == "phoenix");
        bot.setTarget(memberWithTarget?.character?.target || null)
        targetData = bot.character.getTargetEntity()
        console.log("TARGET IS NOW MEMBER", bot.character.target, targetData?.type)
    }   

    if (targetData?.map == bot.character.map && !bot.character.entities.get(targetData?.id)) {
        console.log(bot.name, "THIS PHOENIX IS DEAD")
        targetData = null;
        bot.setTarget(null)
        bot.removeTask("phoenix");
        console.log("Removed Phoenix task")
    }else if(!targetData?.id && !bot.character.target){
        bot.setTarget(null)
        bot.removeTask("phoenix")
        console.log("Removed Phoenix task")
    }

    // Get mage to scout for a phoenix
    if (bot.character.ctype == "mage" && !bot.character.target) {
        console.log("FINDING PHOENIX")
        const phoenixSpawns = bot.character.locateMonster("phoenix");
        while (!bot.character.target && bot.character.ready && bot.character.socket && !bot.getTasks().length) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await scout(phoenixSpawns, bot, party).catch(() => {
                console.log("SCOUT HAS ERRORED")
            })
        }
    }

    const validPhoenix = bot.character.entities.get(targetData?.id)
    console.log(bot.name, "Valid Phoenix found", validPhoenix?.map, validPhoenix?.id, validPhoenix?.hp, validPhoenix?.dead)


    await new Promise(resolve => setTimeout(resolve, 2000));
    return Promise.resolve("Finished");
}


export default phoenix;