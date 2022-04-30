const bankingPosition = { map: "bank", x: 0, y: -200 };

async function bankItems(bot, party, merchant, args, taskId) {
    console.log("BANKING ITEMS", bot.name)
    const {itemsToHold, goldToHold, nextPosition} = args;
    while(!["bank", "bank_b", "bank_u"].includes(bot.character.map) && !bot.character.moving){
        await bot.character.smartMove(bankingPosition, { avoidTownWarps: true }).catch(() => {})
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await bot.character.smartMove(bankingPosition, { avoidTownWarps: true }).catch(() => {})

    for (let i = 0; i < bot.character.isize; i++) {
        const item = bot.character.items[i]
        if (!item) continue // No item in this slot
        if (item.l == "l") continue // Don't send locked items
        if (itemsToHold.includes(item.name)) continue

        try {
            await bot.character.depositItem(i)
        } catch (e) {
            console.log(e)
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }


    try{
        if (bot.character.gold > goldToHold) await bot.character.depositGold(bot.character.gold - goldToHold)
    }catch(error){
        console.log("Error depositing gold", error)
    }

    if(nextPosition) await bot.character.smartMove(nextPosition).catch(() => {});;
    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    bot.removeTask(taskId);
    return Promise.resolve("Finished")
}

export default bankItems