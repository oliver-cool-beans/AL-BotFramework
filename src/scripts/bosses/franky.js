import utils from "../../scripts/utils/index.js";


async function franky(bot, party, merchant, args = {}){
    bot.attackRange = 25;
    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, "franky");

    if(!bot.character?.S?.franky?.live) {
        console.log("Franky is no longer live, removing task");
        bot.removeTask("franky");
        return;
    }

    
    if(!bot.runningScriptName == "franky") {
        bot.runningScriptName = "franky"
    }
    

    if(targetData?.name !== "Franky"){
        bot.character.target = null;
        await bot.character.smartMove(args.event).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.character.target) {
        bot.character.target = utils.findClosestTarget(bot.AL, bot.character, party, "franky");
    }

    bot.attackRange = bot.character.range / 2;
    return Promise.resolve("Finished");
}



export default franky