import scripts from '../../scripts/index.js';

export default async function monsterHuntLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run monsterHunt loop", error))
    }
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    const tasks = bot.getTasks();

    if(!bot.character.s?.monsterhunt && !tasks.find((task) => task.script == "getMonsterHunt")){
        bot.addTask({
            id: bot.createTaskId("getMonsterHunt", bot.character.serverData.region,  bot.character.serverData.name ),
            script: "getMonsterHunt", 
            user: bot.name, 
            args: {
                serverRegion: bot.character.serverData.region, 
                serverIdentifier:  bot.character.serverData.name
            }
        })
        return
    }
    if(bot.character.s?.monsterhunt?.c == 0 && !tasks.find((task) => task.script == "finishMonsterHunt")){
        bot.addTask({
            id: bot.createTaskId("finishMonsterHunt",  bot.character.serverData.region,  bot.character.serverData.name ),
            script : "finishMonsterHunt", 
            user: bot.name, 
            priority: 80, 
            args: {
                serverRegion: bot.character.serverData.region, 
                serverIdentifier:  bot.character.serverData.name
            }
        })
        return
    }
    if(scripts[bot.character.s?.monsterhunt?.id]){ // If we've got a script for bot monster
        bot.addTask({
            id: bot.createTaskId("monsterHunt",  bot.character.serverData.region,  bot.character.serverData.name ),
            script: "monsterHunt", 
            user: bot.name, 
            priority: 80, 
            args: {
                serverRegion: bot.character.serverData.region, 
                serverIdentifier:  bot.character.serverData.name
            }
        })
    }

    return Promise.resolve("OK");
}