import utils from "../../utils/index.js";

async function findAndRecycle(bot){

    console.log("Finding items and recycle");
    if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})
    if(bot.character.esize <= 0) return Promise.resolve("Inventory full");

    for(var item in bot.itemsToRecycle){
        if(bot.character.esize <= 0) return Promise.resolve("Inventory full");

        await utils.goToBank(bot, bot.itemsToKeep, 50000000);

        await utils.withdrawItemsFromBank(bot, {[bot.itemsToRecycle[item]] : {qty: "all", level: 0}});

        var itemData
        var itemLoc
        for(var i in bot.character.items){
            itemLoc = null
            itemData = bot.character.items[i];
            if(!itemData) continue;
            if(bot.itemsToRecycle.includes(itemData.name) ){
                await bot.character.smartMove("craftsman").catch(() => {})
                await new Promise(resolve => setTimeout(resolve, 4000));

                itemLoc = bot.character.locateItem(itemData.name, bot.character.items)
                if(!itemLoc && itemLoc !== 0) break;
                console.log("** Recycling ** ", itemData.name, "in slot", itemLoc)
                bot.character.socket.emit("dismantle", { num: itemLoc })
            }
        }
    }
    await utils.goToBank(bot, bot.itemsToKeep, 50000000);

    return Promise.resolve("OK");
}

export default findAndRecycle;
