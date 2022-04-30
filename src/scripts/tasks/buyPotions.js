
async function buyPotions(bot, party, merchant, args = {}, taskId) {
    console.log("BUYING POTIONS!!", bot.getTasks())
    const {nextPosition, amount = 200} = args
    const {hpot, mpot} = bot.calculatePotionItems();
    const hpotCount = bot.character.countItem(hpot);
    const mpotCount = bot.character.countItem(mpot);
    
    await bot.character.smartMove("fancypots", { avoidTownWarps: true, getWithin: bot.AL.Constants.NPC_INTERACTION_DISTANCE / 2  }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    console.log("Finished moving to potions")

    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 2 seconds
    }
 
    if(nextPosition){
        console.log("Returning to previous position")
        await bot.character.smartMove(nextPosition).catch(() => {})
    }

    bot.removeTask(taskId);
    return Promise.resolve(true)
}
export default buyPotions;