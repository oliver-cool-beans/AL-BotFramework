// Basic find and attack script
import utils from "../utils/index.js";

const targets = ['Goo'];

async function goo(bot, party, merchant, args) {
    if(!bot.runningScriptName == "goo") {
        bot.runningScriptName = "goo"
        await bot.character.smartMove("goo");
    }
    
    await utils.checkIfPotionsLow(bot, 20) && bot.addTask({
        script: "buyPotions", 
        user: bot.name, 
        force: true,
        args: {
            nextPosition: "goo", 
            amount: 300
        }
    });

    if(bot.character.isFull()) bot.addTask({
        script: "bankItems", 
        user: bot.name, 
        force: true,
        args: {
            itemsToHold: [hpot, mpot], 
            goldToHold: 20000,
            nextPosition: "goo"
        }
    })

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {})
        }
    }
    if(bot.character.map !== "main") await bot.character.smartMove("goo");

    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, targets);
    }
    if(!bot.target) await bot.character.smartMove("goo");

    if(!bot.character.ready) return Promise.reject("Character not ready");

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return !!entities.get(target);
}

export default goo;