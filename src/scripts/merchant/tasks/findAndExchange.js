import utils from "../../utils/index.js";

const itemsToExchange = [
    "gem0", 
    "candy1",
    "candy0", 
    "seashell" 
]

async function findAndExchange(bot){

    console.log("Finding items and exchange");

    for(var item in itemsToExchange){
        await utils.goToBank(bot, bot.itemsToKeep, 50000000);
        await utils.withdrawItemsFromBank(bot, {[itemsToExchange[item]] : {qty: "all"}});

        var itemData
        var exchangeLocation
        var itemLoc
        for(var i in bot.character.items){
            exchangeLocation = null;
            itemLoc = null
            itemData = bot.character.items[i];
            if(!itemData) continue;
            if(itemsToExchange.includes(itemData.name) ){
                exchangeLocation = bot.character.locateExchangeNPC(itemData.name);
                console.log("*** exchange location for", itemData.name, "is", exchangeLocation)
                if(!exchangeLocation) continue;
                await bot.character.smartMove(exchangeLocation).catch(() => {})
                if(!bot.character.canExchange(itemData.name)) {
                    console.log("We are not ready to exchange!!", itemData.name)
                };
                console.log("ITEM DATA IS", itemData)
                while(itemData.q){
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    if(!bot.character.canExchange(itemData.name)) break;

                    itemLoc = bot.character.locateItem(itemData.name, bot.character.items)
                    console.log("itemLoc", itemLoc, itemData.name)
                    if(!itemLoc && itemLoc !== 0) break;
                    console.log("QTY LEFT", bot.character.items[itemLoc])
                    console.log("** Exchanging ** ", itemData.name, "in slot", itemLoc)

                    await bot.character.exchange(itemLoc).catch((error) => {
                        console.log("FAILED TO EXCHANGE", error)
                    })
                }
            }
        }
    }

    return Promise.resolve("OK");
}

export default findAndExchange;
