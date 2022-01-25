async function buyPotionsIfLow(bot, AL, nextPosition) {

    const {hpot, mpot} = bot.calculatePotionItems();
    const hpotCount = bot.character.countItem(hpot);
    const mpotCount = bot.character.countItem(mpot);

    if(hpotCount >= 20 && mpotCount >= 20) return Promise.resolve(true);

    await bot.character.smartMove("fancypots", { avoidTownWarps: true, getWithin: AL.Constants.NPC_INTERACTION_DISTANCE / 2  });
    console.log("Finished moving to potions")

    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
    }

    if(hpotCount < 200) {
        if(bot.character.canBuy(hpot)){
            await bot.character.buy(hpot, 200 - hpotCount)
        }
    }

    if(mpotCount < 200) {
        if(bot.character.canBuy(mpot)){
            await bot.character.buy(mpot, 200 - mpotCount)
        }
    
    }
 
    if(nextPosition){
        console.log("Returning to previous position")
        await bot.character.smartMove(nextPosition);
    }
    return Promise.resolve(true)
    
}

export default buyPotionsIfLow