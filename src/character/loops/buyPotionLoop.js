import utils from '../../scripts/utils/index.js';

export default async function buyPotionLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run buyPotionLoop loop", error))

    }
    console.log("Buy Potion loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return

    const {hpot, mpot} = bot.calculatePotionItems();
    const hpotCount = bot.character?.countItem(hpot);
    const mpotCount = bot.character?.countItem(mpot);
    if(hpotCount < 200) {
        if(bot.character && bot.character.canBuy(hpot)){
          //  await bot.character.buy(hpot, 200 - hpotCount).catch(() => {})
        }
    }
    // Check again just in case
    if(!bot.character?.ready) return

    if(mpotCount < 200) {
        if(bot.character && bot.character.canBuy(mpot)){
           // await bot.character.buy(mpot, 200 - mpotCount).catch(() => {})
        }
    
    }
    
    if(bot.character && !bot.character.canBuy(hpot) || !bot.character?.canBuy(mpot)){
        await utils.checkIfPotionsLow(bot, 20) && bot.addTask({
            script: "buyPotions", 
            user: bot.name, 
            priority: 2,
            force: true,
            args: {
                nextPosition: {x: bot.character.x, y: bot.character.y, map: bot.character.map}, 
                amount: 200
            }
        });
    }
    
    return Promise.resolve("OK");
}