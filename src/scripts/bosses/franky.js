import utils from "../../scripts/utils/index.js";


async function franky(bot, party, merchant, args = {}){    
    bot.attackRange = 25;

    console.log("running franky")
    if((args.serverIdentifier !==  bot.character.serverData.name) || (args.serverRegion !==  bot.character.serverData.region)){
        console.log("SWITCHING", args.serverIdentifier, bot.character.serverData.name, args.serverRegion, bot.character.serverData.region)
        args.serverIdentifier && args.serverRegion && await bot.switchServer(args.serverRegion, args.serverIdentifier)
        return;
    }
    
    if(!bot.character?.S) {
        console.log("Running franky, but no S populated yet")
        return
    }

    var targetData = bot.character.getTargetEntity() || bot.character.getEntity({ returnNearest: true, type: "franky" })

     console.log("TARGET DATA", targetData?.id)
    if(targetData?.id && !bot.character?.target){
        bot.character.target = targetData?.id
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

    bot.attackRange = bot.character.range / 2;
    return Promise.resolve("Finished");
}



export default franky