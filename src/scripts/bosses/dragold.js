import utils from "../../scripts/utils/index.js";


async function dragold(bot, party, merchant, args = {}){
    if(!bot.character?.S?.dragold?.live) {
        console.log("Dragold is no longer live, removing task");
        bot.removeTask("dragold");
        return;
    }

    
    if(!bot.runningScriptName == "dragold") {
        bot.runningScriptName = "dragold"
    }
    
    
    if(!bot.character.target || bot.character.target?.name !== "Dragold"){
        await bot.character.smartMove(args.event).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.character.target || !bot.checkTarget(bot?.target, bot.character.entities, targets)) {
        bot.character.target = utils.findClosestTarget(bot.AL, bot.character, party, "dragold");
    }

    return Promise.resolve("Finished");
}



export default dragold