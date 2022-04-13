import utils from "../../utils/index.js";

const itemsToExchange = [
    "gem0", 
    "gem1",
    "candy1",
    "candy0", 
    "seashell", 
    "armorbox", 
    "weaponbox", 
    "goldenegg", 
    "gemfragment"
]

async function findAndExchange(bot){

    console.log("Finding items and exchange");
    if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})

    for(var item in itemsToExchange){
        await utils.goToBank(bot, bot.itemsToKeep, 50000000);
        await utils.withdrawItemsFromBank(bot, {[itemsToExchange[item]] : {qty: "all"}});

        var itemData, exchangeLocation, itemLoc
        var exchangeLimit = 0;
        for(var i in bot.character.items){
            exchangeLocation = null;
            itemLoc = null;
            itemData = bot.character.items[i];

            if(!itemData) continue;
            const gItem = bot.character.G.items[itemData.name]
            if(gItem.e && itemData.q < gItem.e) continue

            exchangeLimit = gItem.e ?  itemData.q - (gItem.e * 10) : itemData.q - 10 
            if(exchangeLimit < 0) exchangeLimit = gItem.e || itemData.q

            if(itemsToExchange.includes(itemData.name) ){
                exchangeLocation = bot.character.locateExchangeNPC(itemData.name);
                console.log("*** exchange location for", itemData.name, "is", exchangeLocation)
                if(!exchangeLocation) continue;
                await bot.character.smartMove(exchangeLocation).catch(() => {})
                if(!bot.character.canExchange(itemData.name)) {
                    console.log("We are not ready to exchange!!", itemData.name)
                };
                console.log("ITEM DATA IS", itemData)
                while(itemData.q > exchangeLimit){ // Only exchange 10 at a time so we don't flood our inventory and bank
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if(!bot.character.canExchange(itemData.name)) break;

                    itemLoc = bot.character.locateItem(itemData.name, bot.character.items)
                    itemData = bot.character.items[itemLoc]
                    console.log("itemLoc", itemLoc, itemData.name)
                    if(!itemLoc && itemLoc !== 0) break;
                    console.log("QTY LEFT", itemData.q, "exchangeLimit:", exchangeLimit)
                    console.log("** Exchanging ** ", itemData.name, "in slot", itemLoc)

                    if(bot.character.q.exchange) continue
                    bot.character.exchange(itemLoc).catch(() => {})
                }
            }
        }
    }

    return Promise.resolve("OK");
}

export default findAndExchange;
