/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/
import {moveStrategies, attackStrategies} from "./strategies/index.js";

export default {
    load: loadFunctions,
    loop: loopFunctions
}

async function loadFunctions () {
    this.strategies = {
        move: {...moveStrategies}, 
        attack: {...attackStrategies}
    }
    this.elixirs = ['elixirint2', 'elixirint1', 'elixirint0']
    return Promise.resolve('OK');
}


async function loopFunctions() {
    console.log("RUNNING LOOPS")
    if(!this?.character) return;
    energize(this)
    return
}

async function energize(bot){
    while(bot.isRunning && bot.character){
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait the timeout and try again
        if(!bot.character) continue
        if(bot.scriptName !== 'bee') continue;
        if(bot.character.mp <= (bot.character.max_mp * 0.3)) continue;

        const lowEnergyPlayers = Array.from(bot.character.players.values()).filter((member) => {
            return member.mp <= (member.max_mp * 0.8) 
            && bot.AL.Tools.distance(bot.character, member) <= 320
            && bot.name != member.id
            && member.ctype == 'ranger' // For bee farm
        });

        if(bot.character.canUse("energize") && lowEnergyPlayers.length){
            const energyToGive = lowEnergyPlayers[0].max_mp - lowEnergyPlayers[0].mp
            bot.character.energize(lowEnergyPlayers[0]?.id, energyToGive).catch(() => {})
        }
    }
}
