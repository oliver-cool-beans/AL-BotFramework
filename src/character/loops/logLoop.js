export default async function logLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 5000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run log loop", error));
    }
    console.log("Log loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return;
    bot.log(`DATA: ${JSON.stringify({
        tasks: bot.tasks, 
        hp: bot.character.hp, 
        mp: bot.character.mp, 
        ready: bot.character.ready,
        disconnected: bot.character.disconnected,
        targetName: bot.character.target && bot.character.target.type,
        targetId: bot.character.target && bot.character.target.id,
        monsterHunt: bot.character.s?.monsterhunt
    })}`)

    return Promise.resolve('OK')
}