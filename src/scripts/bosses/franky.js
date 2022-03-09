import utils from "../../scripts/utils/index.js";


async function franky(bot, party, merchant, args = {}){
    bot.attackRange = 25;
    var targetData = bot.character.getTargetEntity() || utils.findClosestTarget(bot.AL, bot.character, party, "franky");

    if((args.serverIdentifier !==  bot.character.serverData.name) || (args.serverRegion !==  bot.character.serverData.region)){
        bot.log(`Switching servers to ${args.serverRegion} ${args.serverIdentifier}`)
        args.serverIdentifier && args.serverRegion && await bot.switchServer(args.serverRegion, args.serverIdentifier)
    }
    
    if(!bot.character?.S?.franky?.live) {
        console.log("Franky is no longer live, removing task");
        bot.removeTask("franky");
        if((bot.serverIdentifier !==  bot.character.serverData.name) || (bot.serverRegion !==  bot.character.serverData.region)){
            bot.log(`Switching back to home server ${bot.serverRegion} ${bot.serverIdentifier}`)
            await bot.switchServer(bot.serverRegion, bot.serverIdentifier)
        }
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