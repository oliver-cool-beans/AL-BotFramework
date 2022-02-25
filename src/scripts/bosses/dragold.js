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
    
    
    await utils.checkIfPotionsLow(bot, 20) && bot.addTask({
        script: "buyPotions", 
        user: bot.name, 
        priority: 2,
        force: true,
        args: {
            nextPosition: rallyPosition, 
            amount: 200
        }
    });

    if(bot.character.isFull()) bot.addTask({
        script: "bankItems", 
        user: bot.name, 
        priority: 1,
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


    if(!bot.target || bot.target?.name !== "Dragold"){
        await bot.character.smartMove(args.event).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, "dragold");
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return entities?.get && !!entities.get(target?.id);
}

export default dragold