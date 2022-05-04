
export default async function serverChangeLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run serverChange loop", error))

    }
    console.log("Server Change loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    if(!bot.canSwitchServers()) return;
    const tasks = bot.getTasks();

    console.log("OK to switch")
    const {region, identifier} = bot.getQueuedServer()
    
    if(!tasks.length && (!region || !identifier)){
        // If we have no tasks, and we're not on our home server
        if((bot.serverIdentifier !==  bot.character.serverData.name) || (bot.serverRegion !==  bot.character.serverData.region)){
            bot.log(`Switching back to home server ${bot.serverRegion} ${bot.serverIdentifier}`)
            await bot.switchServer(bot.serverRegion, bot.serverIdentifier)
        }
        return
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait one second to not interrupt looting
    await bot.switchServer(region, identifier);




    return Promise.resolve("OK");
}