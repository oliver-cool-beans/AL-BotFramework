import utils from "../../scripts/utils/index.js";


async function wabbit(bot, party, merchant, args = {}){    
    bot.attackRange = 25;
    const { maps: gMaps } = bot.AL.Game.G;
    const currentMap = gMaps?.[args.event.map];

    if((args.serverIdentifier !==  bot.character.serverData.name) || (args.serverRegion !==  bot.character.serverData.region)){
        console.log("SWITCHING TO", args.serverIdentifier, args.serverRegion)
        args.serverIdentifier && args.serverRegion && await bot.switchServer(args.serverRegion, args.serverIdentifier)
        return;
    }

    if(!bot.character?.S) {
        console.log("Running wabbit, but no S populated yet")
        return
    }

    var targetData = bot.character.getTargetEntity() || bot.character.getEntity({ returnNearest: true, type: "wabbit" })

     if(targetData?.id && targetData?.id !== bot.character?.target){
        bot.character.target = targetData?.id
    }

    
    if(!bot.character?.S?.wabbit?.live) {
        console.log("Wabbit is no longer live, removing task");
        bot.removeTask("wabbit");
        if((bot.serverIdentifier !==  bot.character.serverData.name) || (bot.serverRegion !==  bot.character.serverData.region)){
            bot.log(`Switching back to home server ${bot.serverRegion} ${bot.serverIdentifier} AM I SWITCHING THO? ${bot.isSwitchingServers}`)
            await bot.switchServer(bot.serverRegion, bot.serverIdentifier)
        }
        return;
    }

    
    if(!bot.runningScriptName == "wabbit") {
        bot.runningScriptName = "wabbit"
    }
    

    if(targetData?.name !== "Wabbit"){
        console.log(bot.name, "Target is not wabbit, let's find one", "moving to", args.event)
        bot.character.target = null;
        if(args.event.x) return await bot.character.smartMove({map: args.event.map, x: args.event.x, y: args.event.y}, {getWithin: 50}).catch(() => {});
        
        while(bot.character?.S?.wabbit?.live && targetData?.name !== "Wabbit"){
            for(var monster in currentMap.monsters){
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log("SEARCHING FOR WABBIT IN", currentMap.monsters[monster].type)
                const wabbit = bot.character.getEntity({ returnNearest: true, type: "wabbit" })
                if(wabbit?.id){
                    bot.character.target = wabbit?.id
                    targetData = wabbit;
                    return;
                }
                if(!bot.character?.S?.wabbit?.live || targetData?.name == "Wabbit") break;
                await bot.character.smartMove(currentMap.monsters[monster].type, {getWithin: 500, useBlink: true}).catch(() => {})
            }
        }

    }
    

    bot.attackRange = 40;
    return Promise.resolve("Finished");
}



export default wabbit