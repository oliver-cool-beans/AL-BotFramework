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


    if(!bot.target || bot.target?.name !== "Snowman"){
        await bot.character.smartMove(args.event, { getWithin: bot.AL.Game.G.skills.mluck.range / 2}).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, "snowman");
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return entities?.get && !!entities.get(target?.id);
}

export default snowman