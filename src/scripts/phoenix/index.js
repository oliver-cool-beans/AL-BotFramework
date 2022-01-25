import scout from "./scout.js"
import utils from "../utils/index.js";

async function phoenix (bot, party, merchant, arg){
    const {hpot, mpot} = bot.calculatePotionItems();

    if(bot.characterClass == "merchant") return Promise.resolve("Not a combat class");

    if(!bot.runningScriptName == "phoenix") {
        bot.runningScriptName = "phoenix"
    }

    if(!bot.character.party && !bot.isLeader && bot.leader && !bot.sentPartyRequest) {
        await bot.character.sendPartyRequest(bot.leader.name);
        bot.sentPartyRequest = true;
    }

    console.log(bot.characterClass)
    // Get mage to scout for a phoenix
    if(bot.characterClass == "mage" && !bot.target){
        console.log("FINDING PHOENIX", bot.target)
        const phoenixSpawns = bot.character.locateMonster("phoenix");
        while(!bot.target){
            await scout(phoenixSpawns, bot, party);
        }
    } 

    // Check if someone in the party has a phoenix as a target
    if(bot?.target?.name !== "Phoenix"){
        bot.target = party.find((member) => member?.target?.name == "Phoenix"); // Get someone who's got the phoenix target;
    }

    await utils.buyPotionsIfLow(bot, bot.AL, {map: bot.character.map, x: bot.character.x, y: bot.character.y}).catch((error) => {
        console.log("Buy POTIONS ERROR", error)
    })

    if(bot.character.isFull()){
        await utils.goToBank(bot, [hpot, mpot], 20000,  {map: bot.character.map, x: bot.character.x, y: bot.character.y}).catch((error) => {
            console.log("ERROR Banking", error)
        })
    }

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {});
        }
    }

    if(!bot.character.ready) return Promise.reject("Character not ready");

    if(bot.character.canUse("attack") && bot.target){
        await bot.character.basicAttack(bot.target).catch(async (error) => {
            if(error.includes('not found')) {
                console.log("NOT FOUND", bot.target)
                bot.resetTarget();
               if(bot.tasks?.[0]?.script == "phoenix") bot.tasks.unshift(); 
            }
            if(error.includes("too far")) {
                checkTarget(bot?.target, bot.character.entities) && await bot.character.smartMove(bot.character.entities.get(bot.target), { getWithin: bot.character.range }).catch(() => {})
            }
        });
    }

    if(!bot.target) bot.tasks.unshift();
    return Promise.resolve("Finished");
}

export default phoenix;