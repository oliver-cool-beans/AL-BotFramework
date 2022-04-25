export default async function lootLoop(bot){
    while(bot.isRunning){
        await new Promise(resolve => setTimeout(resolve, 500));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run loot loop", error))

    }
    console.log("Loot loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return

    if(bot.character.chests.size){
        for(let [key, value] of bot.character.chests){
            bot.character && await bot.character.openChest(key).catch((error) => {console.log("Failed to loot", error)});
        }
    }
    return Promise.resolve("OK")
}