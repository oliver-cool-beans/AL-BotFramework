/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/
import moveStrategies from "./strategies/index.js";

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
    }
    charge(this);
    taunt(this);
    return
}

async function taunt(bot){
    while(bot.isRunning){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait the timeout and try again
        if(bot.character.canUse("taunt") && bot.target){
            // If our target has a target, and that target isn't us and it's someone else in our party
            if(bot.target.target && bot.target.target !== bot.name){ 
                if(!bot.party.members.find((member) => member.name == bot.target.target)) return //check if the target is a member of our party
                bot.character.taunt(bot.target.id).catch((error) => {
                    console.log("Cannot taunt", error)
                })
            }
        }
    }

}

async function charge(bot){
    while(bot.isRunning){
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
        if(bot.character.canUse("charge")){
            bot.character.charge().catch(() => {});
        }
    }

}
