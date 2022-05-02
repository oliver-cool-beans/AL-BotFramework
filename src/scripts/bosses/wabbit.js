import utils from "../../scripts/utils/index.js";


async function wabbit(bot, party, merchant, args = {}, taskId){    
    bot.attackRange = 25;
    const { maps: gMaps } = bot.AL.Game.G;
    const currentMap = gMaps?.[args.event.map];

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
        bot.removeTask(taskId);
        return;
    }

    
    if(!bot.runningScriptName == "wabbit") {
        bot.runningScriptName = "wabbit"
    }
    

    if(targetData?.name !== "Wabbit"){
        console.log(bot.name, "Target is not wabbit, let's find one", "moving to", args.event)
        bot.character.target = null;
        if(args.event.x) return await bot.character.smartMove({map: args.event.map, x: args.event.x, y: args.event.y}, {getWithin: 50, useBlink: true}).catch(() => {});
        
        while(bot.character?.S?.wabbit?.live && targetData?.name !== "Wabbit"){
            for(var monster in currentMap.monsters){
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log("SEARCHING FOR WABBIT IN", currentMap.monsters[monster].type)
                const wabbit = bot.character.getEntity({ returnNearest: true, type: "wabbit" })
                if(wabbit) console.log("FOUND WABBIT", wabbit?.id, wabbit?.map, wabbit?.x, wabbit?.y)
                if(wabbit?.id){
                    bot.character.target = wabbit?.id
                    targetData = wabbit;
                    return;
                }
                if(!bot.character?.S?.wabbit?.live || targetData?.name == "Wabbit") break;
                await bot.character.smartMove(currentMap.monsters[monster].type, {getWithin: 100, useBlink: bot.character.ctype == 'mage', stopIfTrue: () => { !!bot.character.getEntity({type: "wabbit"}) } } ).catch(() => {})
            }
        }

    }
    

    bot.attackRange = 40;
    return Promise.resolve("Finished");
}



export default wabbit