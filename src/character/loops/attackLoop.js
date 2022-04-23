import scripts from "../../scripts/index.js";

export default async function attackLoop(bot){
    while(bot.isRunning && bot.character?.ready){ 
        await new Promise(resolve => setTimeout(resolve, 50));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run attack loop", error))
    }
    console.log("Attack loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){

    if(!bot.character?.ready) return
    if(!bot.character.target){
        bot.character.target = [...bot.character.entities.values()].find((entity) => entity.hp < bot.character.attack)
        return;
    }
    
    const attackingMe = [...bot.character.entities.values()]?.find((target) => {
        return target.id !== bot.character.target 
        && bot.AL.Tools.distance(bot.character, target) <= bot.character.range
        && scripts[target.type]
        && target.target == bot.character.id
    });

    const targetData = attackingMe || bot.character.getTargetEntity()
    if(bot.strategies?.attack?.[targetData?.type]){
        try{
            await bot.strategies.attack[targetData.type](bot, bot.party.members, targetData)
            return
        }catch(error){
            bot.log(`Failed to run attack strategy ${JSON.stringify(error)}`)
        }
    }
    if(bot.character.canUse("attack")){
        bot.party.energizeMember(bot);
        await bot.character.basicAttack(targetData?.id).catch(async (error) => {});
    }

    return Promise.resolve("OK");
}