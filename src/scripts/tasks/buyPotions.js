
const buySpot = {x: 13.604555354248062, y: 29.177212829039163, map: 'main'}

async function buyPotions(bot, party, merchant, args = {}, taskId) {
    const {nextPosition, amount = 200} = args
    const {hpot, mpot} = bot.calculatePotionItems();
    const hpotCount = bot.character.countItem(hpot);
    const mpotCount = bot.character.countItem(mpot);
    
    if(bot.character.map == buySpot.map && bot.character.canUse('blink')){
        await bot.character.blink(buySpot.x, buySpot.y);
    }

    await bot.character.smartMove("fancypots", { avoidTownWarps: true, getWithin: bot.AL.Constants.NPC_INTERACTION_DISTANCE / 2  }).catch(() => {});
 
    if(nextPosition){
        if(bot.character.map == nextPosition.map && bot.character.ctype == 'mage'){
            let isTimedOut
            setTimeout(() => isTimedOut = true, parseInt(10000));

            while(!bot.character.canUse('blink') && !isTimedOut){
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            if(bot.character.canUse('blink')) {
                bot.character.blink(nextPosition.x, nextPosition.y).catch(async () => {
                    await bot.character.smartMove(nextPosition).catch(() => {})
                })
            }else{
                await bot.character.smartMove(nextPosition).catch(() => {})
            }
        }else{
            await bot.character.smartMove(nextPosition).catch(() => {})
        }
    }

    bot.removeTask(taskId);
    return Promise.resolve(true)
}
export default buyPotions;