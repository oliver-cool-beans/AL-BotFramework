import utils from "../../scripts/utils/index.js";


async function franky(bot, party, merchant, args = {}){
    if(!bot.character?.S?.franky?.live) {
        console.log("Franky is no longer live, removing task");
        bot.removeTask("franky");
        return;
    }

    
    if(!bot.runningScriptName == "franky") {
        bot.runningScriptName = "franky"
    }
    
    
    await utils.checkIfPotionsLow(bot, 20) && bot.addTask({
        script: "buyPotions", 
        user: bot.name, 
        force: true,
        args: {
            nextPosition: rallyPosition, 
            amount: 200
        }
    });

    if(bot.character.isFull()) bot.addTask({
        script: "bankItems", 
        user: bot.name, 
        force: true,
        args: {
            itemsToHold: [hpot, mpot, "tracker"], 
            goldToHold: 20000,
            nextPosition: rallyPosition
        }
    })

    
    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {});
        }
    }


    if(!bot.target || bot.target?.name !== "Franky"){
        await bot.character.smartMove(args.event, { getWithin: bot.AL.Game.G.skills.mluck.range / 2}).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, "franky");
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return entities?.get && !!entities.get(target?.id);
}

export default franky