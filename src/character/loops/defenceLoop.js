export default async function defenceLoop(bot){
    while(bot.isRunning && bot.character?.ready){
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run defence loop", error))

    }
    console.log("Defence loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    // Get anyone attacking me who's we're not prepared to fight
    const attackingMe = bot.character.getEntities({targetingMe: true})?.find((target) => {
        return target.id !== bot.character.target 
        && bot.AL.Tools.distance(bot.character, target) <= bot.character.range
        && !scripts[target.type]
    });
    const isLowHp = (bot.character.hp / bot.character.max_hp) * 100 <= 30 ? true : false; 
    if(attackingMe || isLowHp){
        await bot.character.scare().catch(() => {})
    }

    return Promise.resolve("OK");
}