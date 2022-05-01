/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

async function specialMonster(bot, party, merchant, args = {}, taskId) {
    if(!bot.character.ready) return Promise.reject("Character not ready");
    if(!args.target?.type) return;

    if(!bot.runningScriptName == "specialMonster") {
        bot.runningScriptName = "specialMonster"
    }

    // Get target if in range, or set to the arg target data
    // Do I have a character target? if not, do I have an arg target? if so set it
    var targetData = bot.character.getTargetEntity() || {}

    if(targetData.id !== args.target.id ){
        targetData = utils.findClosestTarget(bot.AL, bot.character, party, [args.target.type]) || args?.target;
    }

    if(!targetData?.id) return;

    // Can I see my target in my immediate surroundings?
    if(bot.character.entities.get(targetData.id)){
        bot.setTarget(targetData.id);
        return;
    }

    const distance = bot.AL.Tools.distance(bot.character, targetData);
    // If i'm on the same map, and less than 500m then it's probably dead, remove target, remove task
    if(targetData.map == bot.character.map && distance <= 500){
        bot.setTarget(null)
        bot.removeTask(taskId);
        console.log(bot.name, "Removed Special Monster task")
        return;
    }

    // If i'm not on the same map or distance, move to the target, repeat above
    await bot.character.smartMove(targetData).catch((error) => {
        console.log(bot.name, "FAILED TO MOVE TO SPECIAL MONSTER", error);
    })


    return Promise.resolve("Finished");
}



export default specialMonster;