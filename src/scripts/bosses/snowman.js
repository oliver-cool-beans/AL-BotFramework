import utils from "../../scripts/utils/index.js";
const rallyPosition = {x: 1143.0969205025276, y: -1043.9478443762375, map: "winterland"}

async function snowman(bot, party, merchant, args = {}, taskId){    
    bot.attackRange = 25;
    bot.kitePositions.snowman = {x: 1164.1348111178727, y: -1074.3045132208767}

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

    
    if(!bot.character?.S?.snowman?.x) {
        console.log("Snowman is no longer live, removing task", taskId);
        bot.removeTask(taskId);
        return;
    }

    
    if(!bot.runningScriptName == "snowman") {
        bot.runningScriptName = "snowman"
    }
    

    if(targetData?.name !== "Snowman"){
        bot.character.target = null;
        await bot.character.smartMove(rallyPosition).catch(() => {});
    }

    bot.attackRange = 40;
    return Promise.resolve("Finished");
}



export default snowman