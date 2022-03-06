/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import scout from "./scout.js"
import utils from "../utils/index.js";

const targets = ['phoenix'];

async function phoenix(bot, party, merchant, args = {}) {
    console.log("RUNNING PHOENIX")
    try{
        if(!bot.character.ready) return Promise.reject("Character not ready");

        // Get target if in range, or set to the arg target data
        // Do I have a character target? if not, do I have an arg target? if so set it
        var targetData = bot.character.getTargetEntity() || {}
        if(targetData.type !== "phoenix"){
            console.log("Phoenix no target found from target data", targetData?.type, targetData?.id)
            targetData = utils.findClosestTarget(bot.AL, bot.character, party, targets) || args?.target;
        }
    
        console.log("DO WE HAVE A PHOENIX?", targetData?.type, targetData?.id, bot.character.target);
        if(!targetData?.id){
            bot.setTarget(null)
        }
    
        // If i've got not targetDat, just return
        if(!targetData?.id && bot.character.ctype == "mage"){
            console.log("FINDING PHOENIX", bot.character.target)
            const phoenixSpawns = bot.character.locateMonster("phoenix");
            while (!bot.character.target && bot.character.ready && bot.character.socket && !bot.getTasks().length) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await scout(phoenixSpawns, bot, party).catch(() => {
                    console.log("SCOUT HAS ERRORED")
                })
            }
        }
        
        if(!targetData?.id) return;
    
        // Can I see my target in my immediate surroundings?
        if(bot.character.entities.get(targetData.id)){
            party.forEach((member) => {
                const memberTasks = member.getTasks();
                if(!memberTasks.find((task) => task?.args?.target?.id == targetData.id)){
                    member.addTask({
                        script: "specialMonster", 
                        user: bot.name, 
                        priority: 4, 
                        args: {
                            target: targetData
                        }
                    });
                }
            })
            return;
        }
    
        const distance = bot.AL.Tools.distance(bot.character, targetData);
        // If i'm on the same map, and less than 500m then it's probably dead, remove target, remove task
        if(targetData.map == bot.character.map && distance <= 500){
            bot.setTarget(null)
            return;
        }    
    }catch(error){
        console.log(error)
        return Promise.reject(error)
    }
 
    return Promise.resolve("Finished");
}


export default phoenix;