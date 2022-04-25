const bankingPosition = { map: "bank", x: 0, y: -200 };

async function goToBank(bot, itemsToHold, goldToHold, nextPosition) {
    await bot.character.smartMove(bankingPosition, { avoidTownWarps: true }).catch(() => {});;

    for (let i = 0; i < bot.character.isize; i++) {
        const item = bot.character.items[i]
        if (!item) continue // No item in this slot
        if (item.l == "l") continue // Don't send locked items
        if (itemsToHold.includes(item.name)) continue

        try {
            await bot.character.depositItem(i)
        } catch (e) {
            console.log("BANKING ERROR", e)
            if(e && e.indexOf("nowhere to place") !== -1) return Promise.resolve("Bank full")

        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (bot.character.gold > goldToHold) await bot.character.depositGold(bot.character.gold - goldToHold);

    if(nextPosition){
        await bot.character.smartMove(nextPosition).catch(() => {})
        while(bot.character.moving){
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
  
    return Promise.resolve("Finished")
}

export default goToBank