import bosses from "../../scripts/bosses/index.js";

export default async function checkEventBossesLoop(bot){
    while(bot.isRunning && bot.character?.ready){
        await new Promise(resolve => setTimeout(resolve, 5000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run checkEventBosses loop", error))

    }
    console.log("Event Boss loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return

    let tasks = bot.getTasks();
    // Load from local data
    bot.log(`Checking Boss Mobs: ${JSON.stringify(bot.character.S)}`)
    Object.entries(bot.character.S).forEach(([event, data]) => {
        if(!data.live || !bosses[event] || (!data.target && !bot.specialMonsters.includes(event))) return;
        if(tasks.find((task) => task.script == event && task.args.serverIdentifier == bot.character.serverData.name && task.args.serverRegion == bot.character.serverData.region)){
            return
        }
        bot.log(`Adding event`);
        bot.addTask({
            script: event, 
            user: bot.name, 
            priority: 3,
            args: {
                event: data, 
                serverRegion: bot.character.serverData.region, 
                serverIdentifier: bot.character.serverData.name
            }
        })
    });

    tasks = bot.getTasks();
    // Now load from external data
    if(bot.party.dataPool.aldata){
        bot.party.dataPool.aldata.forEach((event) => {
            if(!bosses[event.type] || (!event.target && !bot.specialMonsters.includes(event.type)) || !event.map) return;
            console.log("Adding task, we have a target", event.target)
            if(tasks.find((task) => task.script == event.type && task.args.serverIdentifier == event.serverIdentifier && task.args.serverRegion == event.serverRegion)){
                return
            }
            bot.log(`Adding inter-server event for ${event.type}`)
            bot.addTask({
                script: event.type, 
                user: bot.name,
                priority: 3, 
                args: {
                    event: event, 
                    serverRegion: event.serverRegion, 
                    serverIdentifier: event.serverIdentifier
                }
                
            })
            
        })
    }
    
    return Promise.resolve("OK");
}