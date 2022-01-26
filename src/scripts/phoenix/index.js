/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import scout from "./scout.js"
import utils from "../utils/index.js";

async function phoenix (bot, party, merchant, arg){
    if(bot.character.ctype == "merchant") return Promise.resolve("Not a combat class");
    if(bot.target?.name !== "Phoenix") bot.target = null;

    await utils.buyPotionsIfLow(bot, bot.AL, {map: bot.character.map, x: bot.character.x, y: bot.character.y}).catch((error) => {
        console.log("Buy POTIONS ERROR", error)
    })

    const {hpot, mpot} = bot.calculatePotionItems();
    if(bot.character.isFull()){
        await utils.goToBank(bot, [hpot, mpot], 20000,  {map: bot.character.map, x: bot.character.x, y: bot.character.y}).catch((error) => {
            console.log("ERROR Banking", error)
        })
    }

    // Get mage to scout for a phoenix
    if(bot.character.ctype == "mage" && !bot.target){
        console.log("FINDING PHOENIX", bot.target?.name)
        const phoenixSpawns = bot.character.locateMonster("phoenix");
        while(!bot.target){
            await scout(phoenixSpawns, bot, party);
        }
    } 

    
    while(bot.target?.name != "Phoenix" && party.find((member) => member?.target?.name == "Phoenix")){
        console.log(bot.name, "Finding Phoenix....")
        const memberWithTarget = party.find((member) => member?.target?.name == "Phoenix" && checkTarget(member.target, member.character.entities));
            // Get someone who's got the phoenix target;
        bot.target = memberWithTarget ? memberWithTarget.target : utils.findClosestTarget (bot.AL, bot.character, party, ["Phoenix"], false);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if(bot.target?.name == "Phoenix" && !checkTarget(bot.target, bot.character.entities)) {
        bot.target = null;
    }


    // If the target we have is not a Phoenix (or nothing), see if anyone has a phoenix target and set it.
    if(bot?.target?.name != "Phoenix"){
        const memberWithTarget = party.find((member) => member?.target?.name == "Phoenix" && checkTarget(member.target, member.character.entities)); // Get someone who's got the phoenix target;

        bot.target = memberWithTarget && memberWithTarget.target;
    }

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {});
        }
    }

    if(!bot.character.ready) return Promise.reject("Character not ready");

    if(!bot.target && !party.find((member) => member?.target?.name == "Phoenix" && checkTarget(member.target, member.character.entities))) {
        bot.tasks.shift();
        console.log("bot Tasks for", bot.name, bot.tasks)
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Promise.resolve("Finished");
}


function checkTarget(target, entities = {}){
    if(!target) return false;
    return !!entities.get(target?.id);
}


export default phoenix;