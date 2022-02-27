/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/
import { moveStrategies, attackStrategies } from "./strategies/index.js";

export default {
    load: loadFunctions,
    loop: loopFunctions,
}

async function loadFunctions () {
    return
}

async function loopFunctions() {
    if(!this?.character) return;
    this.strategies = {
        move: {...moveStrategies}, 
        attack: {...attackStrategies}
    }
    charge(this);
    taunt(this);
    return
}

async function taunt(bot){
    while(bot.isRunning && bot.character){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait the timeout and try again
        if(!bot.character) continue
        if(bot.character.canUse("taunt") && bot.character.target){
            // If our target has a target, and that target isn't us and it's someone else in our party
            const targetData = bot.character.getTargetEntity();
            if(targetData?.target?.target && targetData?.target?.target !== bot.name){ 
                if(!bot.party.members.find((member) => member.name == targetData?.target?.target)) return //check if the target is a member of our party
                bot.character.taunt(targetData?.target?.id).catch((error) => {
                    console.log("Cannot taunt", error)
                })
            }
        }
    }

}

async function charge(bot){
    while(bot.isRunning && bot.character){
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
        if(!bot.character) continue
        if(bot.character.canUse("charge")){
            bot.character.charge().catch(() => {});
        }
    }

}
