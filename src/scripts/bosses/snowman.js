import utils from "../../scripts/utils/index.js";


async function snowman(bot, party, merchant, args = {}){
    if(!bot.character?.S?.snowman?.live) {
        console.log("Snowman is no longer live, removing task");
        bot.removeTask("snowman");
        return;
    }

    
    if(!bot.runningScriptName == "snowman") {
        bot.runningScriptName = "snowman"
    }
    

    if(!bot.character.target || bot.character.target?.name !== "Snowman"){
        await bot.character.smartMove(args.event, { getWithin: bot.AL.Game.G.skills.mluck.range / 2}).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.character.target || !bot.checkTarget(bot?.target, bot.character.entities, targets)) {
        bot.character.target = utils.findClosestTarget(bot.AL, bot.character, party, "snowman");
    }

    return Promise.resolve("Finished");
}



export default snowman