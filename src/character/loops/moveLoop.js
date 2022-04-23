export default async function moveLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 500));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run move loop", error))
       
    }
    console.log("Move loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    const tasks = bot.getTasks();

    if(!bot.character.target){
        return;
    }

    const targetData = bot.character.getTargetEntity()
    || bot.party.members.find((member) => member?.character?.target == bot.character?.target && member?.character?.getTargetEntity())?.character.getTargetEntity();
    // If we can't find the target, check if someone in our party has it

    if(Object.keys(bot.character.c).length) return
    if(bot.strategies?.move?.[targetData?.type]){
        await bot.strategies.move[targetData?.type](bot, bot.party.members).catch((error) => {
            bot.log(`Failed to run move strategy ${JSON.stringify(error)}`)
        })
        return
    }

    // If we're out of range, move to the target
    if(bot.AL.Tools.distance(bot.character, targetData) > bot.character.range && !tasks[0]?.force && !bot.character.moving){
        await bot.character.smartMove(targetData, { getWithin: bot.attackRange || bot.character.range / 2, useBlink: true }).catch(() => {});
    }
    
    return Promise.resolve("OK");
}