/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";

const targets = ["Bee", "Cute bee"];

async function bee(bot, party, merchant, args) {
    if(!bot.character.ready) return Promise.reject("Character not ready");

    const {hpot, mpot} = bot.calculatePotionItems();

    if(bot.characterClass == "merchant") return Promise.resolve("Not a combat class");
    
    const rallyPosition = { map: "main", x: 364.259, y: 1054.605 };

    if(!bot.runningScriptName == "bee") {
        bot.runningScriptName = "bee"
        await bot.character.smartMove(rallyPosition);
    }
    

    await utils.buyPotionsIfLow(bot, bot.AL,  rallyPosition).catch((error) => {
        console.log("Buy POTIONS ERROR", error)
    })

    if(bot.character.isFull()){
        await utils.goToBank(bot, [hpot, mpot], 20000,  rallyPosition).catch((error) => {
            console.log("ERROR Banking", error)
        })
    }

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {});
        }
    }

    // If we've got no target, get a valid target;
    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, targets);
        if(!bot.target) await bot.character.smartMove("bee").catch(() => {});
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return !!entities.get(target?.id);
}

export default bee;