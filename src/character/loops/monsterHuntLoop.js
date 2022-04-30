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
            id: bot.createTaskId("getMonsterHunt"),
            script: "getMonsterHunt", 
            user: bot.name
        })
        return
    }
    if(bot.character.s?.monsterhunt?.c == 0 && !tasks.find((task) => task.script == "finishMonsterHunt")){
        bot.addTask({
            id: bot.createTaskId("finishMonsterHunt"),
            script : "finishMonsterHunt", 
            user: bot.name, 
            priority: 80
        })
        return
    }
    if(scripts[bot.character.s?.monsterhunt?.id]){ // If we've got a script for bot monster
        bot.addTask({
            id: bot.createTaskId("monsterHunt"),
            script: "monsterHunt", 
            user: bot.name, 
            priority: 80
        })
    }

    return Promise.resolve("OK");
}