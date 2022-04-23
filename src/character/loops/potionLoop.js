import utils from '../../scripts/utils/index.js';

export default async function potionLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 2000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run move loop", error))
    }
    console.log("Potion loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    if(!Object.keys(bot.character.c).length) await utils.usePotionIfLow(bot);

    return Promise.resolve("OK")
}
