import utils from "../../scripts/utils/index.js";


async function snowman(bot, party, merchant, args = {}){    
    bot.attackRange = 25;

    if((args.serverIdentifier !==  bot.character.serverData.name) || (args.serverRegion !==  bot.character.serverData.region)){
        console.log("SWITCHING", args.serverIdentifier, bot.character.serverData.name, args.serverRegion, bot.character.serverData.region)
        args.serverIdentifier && args.serverRegion && await bot.switchServer(args.serverRegion, args.serverIdentifier)
        return;
    }
    
    if(!bot.character?.S) {
        console.log("Running snowman, but no S populated yet")
        return
    }

    var targetData = bot.character.getTargetEntity() || bot.character.getEntity({ returnNearest: true, type: "snowman" })

    if(targetData?.id && targetData?.id !== bot.character?.target){
        bot.character.target = targetData?.id
    }

    
    if(!bot.character?.S?.snowman?.live) {
        console.log("Snowman is no longer live, removing task");
        bot.removeTask("snowman");
        if((bot.serverIdentifier !==  bot.character.serverData.name) || (bot.serverRegion !==  bot.character.serverData.region)){
            bot.log(`Switching back to home server ${bot.serverRegion} ${bot.serverIdentifier}`)
            await bot.switchServer(bot.serverRegion, bot.serverIdentifier)
        }
        return;
    }

    
    if(!bot.runningScriptName == "snowman") {
        bot.runningScriptName = "snowman"
    }
    

    if(targetData?.name !== "Snowman"){
        bot.character.target = null;
        await bot.character.smartMove(args.event).catch(() => {});
    }

    bot.attackRange = bot.character.range / 2;
    return Promise.resolve("Finished");
}



export default snowman