/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/
import moveStrategies from "./strategies/index.js";

export default {
    load: loadFunctions,
    loop: loopFunctions
}

async function loadFunctions () {
    this.strategies = {
        move: {...moveStrategies}, 
    }
    return Promise.resolve('OK');
}


async function loopFunctions() {
    if(!this?.character) return;
    energize(this)
    return
}

async function energize(bot){
    while(bot.isRunning && bot.character){
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
        if(!bot.character) continue
        const lowEnergyPartyMembers = bot.party.members.filter((member) => {
            if(!member.character) return
            return member.character.mp <= (member.character.max_mp * 0.8) 
            && bot.AL.Tools.distance(bot.character, member.character) <= 320
            && bot.name != member.name
        });

        if(bot.character.canUse("energize") && lowEnergyPartyMembers.length){
            const energyToGive = lowEnergyPartyMembers[0].character.max_mp - lowEnergyPartyMembers[0].character.mp
            console.log("Energizing", lowEnergyPartyMembers[0]?.character.id, energyToGive)
            bot.character.energize(lowEnergyPartyMembers[0].character?.id, energyToGive).catch(() => {})
        }
    }
}
