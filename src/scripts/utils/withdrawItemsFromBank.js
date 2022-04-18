async function withdrawItemsFromBank(bot, items) {
    if(!["bank", "bank_b", "bank_u"].includes(bot.character.map)){
        await bot.character.smartMove("bank").catch(() => {})
    }

        
    for (let i = 0; i < 20; i++) {
        console.log("Waiting for bank items to populate")
        if(bot.character.bank){
            if (Object.keys(bot.character.bank).length > 1) break
        }
        await new Promise(resolve => setTimeout(resolve, 250))
    }

    const bank = bot.character.bank;
    var itemToWithdraw, qtyToWithdraw, withdrawItems
    var qty = 0;

    for(var itemName in items){
        itemToWithdraw = items[itemName];
        qtyToWithdraw = itemToWithdraw.qty == "all" ? 9999 : itemToWithdraw.qty;
        for(var slot in bank){
            if(slot == "gold") continue;
            if(qty >= qtyToWithdraw) continue;
            withdrawItems = bank[slot].map((item, index) => {
                if(!item) return;
                if(item.name == itemName && item.level == itemToWithdraw.level && item.s == itemToWithdraw.s){
                    return {...item, index: index}
                }
            }).filter(Boolean)

            for(var item in withdrawItems){
                if(qty >= qtyToWithdraw) break;
                console.log(`Withdrawing ${withdrawItems[item].name} from ${slot}`)
                try{
                    await bot.character.withdrawItem(slot, withdrawItems[item].index, bot.character.getFirstEmptyInventorySlot())
                    qty++
                }catch(error){
                    console.log("there was an error withdrawing", error)
                }
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
    }
    return Promise.resolve('OK')
}

export default withdrawItemsFromBank