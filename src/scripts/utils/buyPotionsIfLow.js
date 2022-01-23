async function buyPotionsIfLow(bot, AL, nextPosition) {

    const hpotCount = bot.character.countItem("hpot0");
    const mpotCount = bot.character.countItem("mpot0");

    if(hpotCount >= 20 && mpotCount >= 20) return Promise.resolve(true);

    await bot.character.smartMove("fancypots", { avoidTownWarps: true, getWithin: AL.Constants.NPC_INTERACTION_DISTANCE / 2  });
    console.log("Finished moving to potions")

    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
    }

    if(hpotCount < 200) {
        if(bot.character.canBuy("hpot0")){
            await bot.character.buy("hpot0", 200 - hpotCount)
        }
    }

    if(mpotCount < 200) {
        if(bot.character.canBuy("mpot0")){
            await bot.character.buy("mpot0", 200 - mpotCount)
        }
    
    }
 
    if(nextPosition){
        console.log("Returning to previous position")
        await bot.character.smartMove(nextPosition);
    }
    return Promise.resolve(true)
    
}

export default buyPotionsIfLow