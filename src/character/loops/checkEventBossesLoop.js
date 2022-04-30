import scripts from "../../scripts/index.js";

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

    // Load from local data
    bot.log(`Checking Boss Mobs: ${JSON.stringify(bot.character.S)}`)
    Object.entries(bot.character.S).forEach(([event, data]) => {
        const tasks = bot.getTasks();
        if(!data.live || !scripts[event] || (!data.target && !bot.specialMonsters.includes(event))) return;
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

    // Now load from external data
    if(bot.party.dataPool.aldata){
        bot.party.dataPool.aldata.forEach((event) => {
            const tasks = bot.getTasks();
            if(!scripts[event.type] && !bot.specialMonsters.includes(event.type)) return // If we have no script, and it's not a special monster return
            if((!event.target && !bot.specialMonsters.includes(event.type))) return; // if we've got not target, and it's not a special monster return
            if(bot.specialMonsters.includes(event.type) && !event.map) return // If it's a special monster with no map, return
            if(tasks.find((task) => task.script == event.type && task.args.serverIdentifier == event.serverIdentifier && task.args.serverRegion == event.serverRegion)){
                return
            }

            const id = Buffer.from(`${event.type}${event.serverRegion}${event.serverIdentifier}`, 'base64').toString('base64')
            if(tasks.find((task) => task.id == id )) return;
            
            bot.log(`Adding inter-server event for ${event.type} server: ${event.serverRegion} ${event.serverIdentifier}`)

            bot.addTask({
                id: id,
                script: scripts[event.type] && event.type || "specialMonster", 
                user: bot.name,
                priority: 3, 
                args: {
                    target: {
                        type: event.type, 
                        id: event.id,
                        x: event.x, 
                        y: event.y, 
                        map: event.map
                    },
                    event: event, 
                    serverRegion: event.serverRegion, 
                    serverIdentifier: event.serverIdentifier
                }
                
            })
            
        })
    }
    
    return Promise.resolve("OK");
}