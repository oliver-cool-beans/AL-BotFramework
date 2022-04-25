async function depositItemsInBank(bot, items) {
    console.log("Depositing back in bank")
    if(!["bank", "bank_b", "bank_u"].includes(bot.character.map)){
        await bot.character.smartMove("bank").catch(() => {})
    }

    for (let i = 0; i < bot.character.isize; i++) {
        const item = bot.character.items[i]
        if (!item) continue // No item in this slot
        if (!Object.keys(items).includes(item.name)) continue
        try {
            await bot.character.depositItem(i)
        } catch (e) {
            console.log("BANKING ERROR", e)
            if(e && e.indexOf("nowhere to place") !== -1) return Promise.resolve("Bank full")
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return Promise.resolve('OK')
}

export default depositItemsInBank