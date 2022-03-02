const bankingPosition = { map: "bank", x: 0, y: -200 };

async function withdrawGold(bot, party, merchant, args) {
    console.log("WITHDRAWING GOLD", bot.name)
    const {goldToHold, nextPosition} = args;
    while(!["bank", "bank_b", "bank_u"].includes(bot.character.map) && !bot.character.moving){
        await bot.character.smartMove(bankingPosition, { avoidTownWarps: true }).catch(() => {})
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await bot.character.smartMove(bankingPosition, { avoidTownWarps: true }).catch(() => {})

    try{
        if (bot.character.gold < goldToHold) await bot.character.withdrawGold(goldToHold - bot.character.gold)
    }catch(error){
        console.log("Error withdrawing gold", error)
    }

    if(nextPosition) await bot.character.smartMove(nextPosition).catch(() => {});;
    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    bot.removeTask('withdrawGold');
    return Promise.resolve("Finished")
}

export default withdrawGold