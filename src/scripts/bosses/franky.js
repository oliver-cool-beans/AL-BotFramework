import utils from "../../scripts/utils/index.js";
import moment from "moment";

async function franky(bot, party, merchant, args = {}, taskId){    
    bot.attackRange = 25;
    
    if(!bot.character?.S) {
        console.log("Running franky, but no S populated yet")
        return
    }

    var targetData = bot.character.getTargetEntity() || bot.character.getEntity({ returnNearest: true, type: "franky" })

     if(targetData?.id && targetData?.id !== bot.character?.target){
        bot.character.target = targetData?.id
    }

    
    if(!bot.character?.S?.franky?.live) {
        console.log("Franky is no longer live, removing task");
        bot.removeTask(taskId);
        return;
    }

    
    if(!bot.runningScriptName == "franky") {
        bot.runningScriptName = "franky"
    }
    

    if(targetData?.name !== "Franky"){
        bot.character.target = null;
        await bot.character.smartMove({x: 1.2496361013690418, y: -12.770557914832374, map: "level2w"}, {useBlink: bot.character.ctype == 'mage'}).catch(() => {});
    }

    const timeoutTime = moment().add(10, 'minutes');
    while(targetData && !targetData.target){
        if(moment() >= timeoutTime){
            console.log(bot.name, "Removing franky because it's been 10 minutes with no target");
            bot.removeTask(taskId)
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }


    bot.attackRange = 40;
    return Promise.resolve("Finished");
}



export default franky