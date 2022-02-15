
async function buyPotions(bot, party, merchant, args) {
    console.log("BUYING POTIONS!!", bot.getTasks())
    const {nextPosition, amount = 200} = args
    const {hpot, mpot} = bot.calculatePotionItems();
    const hpotCount = bot.character.countItem(hpot);
    const mpotCount = bot.character.countItem(mpot);
    
    await bot.character.smartMove("fancypots", { avoidTownWarps: true, getWithin: bot.AL.Constants.NPC_INTERACTION_DISTANCE / 2  }).catch(() => {});
    console.log("Finished moving to potions")

    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 2 seconds for anyone elses jobs to come in
    }

    if(hpotCount < amount) {
        if(bot.character.canBuy(hpot)){
            await bot.character.buy(hpot, amount - hpotCount).catch(() => {})
        }
    }

    if(mpotCount < amount) {
        if(bot.character.canBuy(mpot)){
            await bot.character.buy(mpot, amount - mpotCount).catch(() => {})
        }
    
    }
 
    if(nextPosition){
        console.log("Returning to previous position")
        await bot.character.smartMove(nextPosition).catch(() => {})
    }

    bot.removeTask("buyPotions");
    return Promise.resolve(true)
}
export default buyPotions;