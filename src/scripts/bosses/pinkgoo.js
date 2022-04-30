import utils from "../../scripts/utils/index.js";


async function pinkgoo(bot, party, merchant, args = {}, taskId){
    if(!bot.character?.S?.pinkgoo?.live) {
        console.log("Pinkgoo is no longer live, removing task");
        bot.removeTask(taskId);
        return;
    }

    
    if(!bot.runningScriptName == "pinkgoo") {
        bot.runningScriptName = "pinkgoo"
    }
    
    if(!bot.character.target || bot.character.target?.type !== "pinkgoo"){
        console.log("MOVING TO")
        await bot.character.smartMove(args.event, { getWithin: bot.AL.Game.G.skills.mluck.range / 2}).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.character.target || !bot.checkTarget(bot?.target, bot.character.entities, targets)) {
        bot.character.target = utils.findClosestTarget(bot.AL, bot.character, party, "pinkgoo");
    }

    return Promise.resolve("Finished");
}



export default pinkgoo