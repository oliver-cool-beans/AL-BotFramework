import scripts from "../../scripts/index.js";

export default async function findSpecialMonsterLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run findSpecialMonster loop", error))
    }
    console.log("Special Monster loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    [...bot.character.entities.values()].forEach((entity) => {
        if(!bot.specialMonsters.includes(entity.type)) return
        const monsterScript = scripts[entity.type] || "specialMonster"
        bot.addTask({
            id: bot.createTaskId(entity.type, bot.serverRegion, bot.serverIdentifier),
            script: monsterScript, 
            user: bot.name, 
            priority: 5,
            args: {
                target: entity, 
                serverRegion: bot.serverRegion, 
                serverIdentifier: bot.serverIdentifier
            }, 
        })
        /*bot.party.members.forEach((member) => {
            if(!member.specialMonsters.includes(entity.type)) return
            if(member.getTasks().find((task) => ["specialMonster", entity.type].includes(task.script) && task.args?.entity?.id == entity.id)) return;
            const monsterScript = scripts[entity.type] || "specialMonster"
            member.addTask({
                script: monsterScript, 
                user: bot.name, 
                priority: 5,
                args: {
                    target: entity
                }, 
            })
        }) */
    })

    return Promise.resolve("OK");
}