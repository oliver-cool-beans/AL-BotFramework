// Basic find and attack script
import utils from "../../scripts/utils/index.js";

const targets = ["Bee", "Cute bee"];

async function bee(bot, party, merchant, args) {
    if(bot.characterClass == "merchant") return Promise.resolve("Not a combat class");
    
    const rallyPosition = { map: "main", x: 364.259, y: 1054.605 };

    if(!bot.runningScriptName == "bee") {
        bot.runningScriptName = "bee"
        await bot.character.smartMove(rallyPosition);
    }
    
    if(!bot.character.party && !bot.isLeader && bot.leader && !bot.sentPartyRequest) {
        await bot.character.sendPartyRequest(bot.leader.name);
        bot.sentPartyRequest = true;
    }

    await utils.buyPotionsIfLow(bot, bot.AL,  rallyPosition).catch((error) => {
        console.log("Buy POTIONS ERROR", error)
    })

    if(bot.character.isFull()){
        await utils.goToBank(bot, ["mpot0", "hpot0"], 20000,  rallyPosition).catch((error) => {
            console.log("ERROR Banking", error)
        })
    }


    if(bot.character.mp / bot.character.max_mp < 0.7) {
        await bot.character.useMPPot(1).catch((error) => {})
    }

    if(bot.character.hp / bot.character.max_hp < 0.7) {
        await bot.character.useHPPot(0).catch((error) => {})
    }

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            await bot.character.openChest(key).catch((error) => {});
        }
    }
    if(bot.character.map !== "main") await bot.character.smartMove(rallyPosition);

    if(!bot.target || !checkTarget(bot?.target, bot.character.entities)) {
        bot.target = utils.findClosestTarget(bot.AL, bot.character, party, targets);
    }
    if(!bot.target) await bot.character.smartMove(rallyPosition);

    if(!bot.character.ready) return Promise.reject("Character not ready");
    if(bot.character.canUse("attack") && bot.target){
        await bot.character.basicAttack(bot.target).catch(async (error) => {
            if(error.includes('not found')) {
                bot.resetTarget();
            }
            if(error.includes("too far")) {
                checkTarget(bot?.target, bot.character.entities) && await bot.character.smartMove(bot.character.entities.get(bot.target), { getWithin: bot.character.range }).catch(() => {})
            }
        });
    }

    return Promise.resolve("Finished");
}

function checkTarget(target, entities = {}){
    if(!target) return false;
    return !!entities.get(target);
}

export default bee;