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
    "gemfragment",
    "lostearring", 
    "troll", 
    "basketofeggs", 
    "candycane", 
    "mistletoe"
]

async function findAndExchange(bot){

    console.log("Finding items and exchange");
    
    if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})
    if(bot.character.esize <= 0) return Promise.resolve("Inventory full");

    for(var item in itemsToExchange){
        if(bot.character.esize <= 0) return Promise.resolve("Inventory full");

        var itemName = itemsToExchange[item]
        var itemData, exchangeLocation, itemLoc
        var exchangeLimit = 0;
        const gItem = bot.character.G.items[itemName]

        await utils.goToBank(bot, bot.itemsToKeep, 50000000);
        const withdrawPayload = {[itemName] : {qty: "all"}}

        if(gItem.compound || gItem.upgrade) withdrawPayload[itemName].level = 0
        console.log("Withdraw payload", withdrawPayload)

        await utils.withdrawItemsFromBank(bot, withdrawPayload );

        console.log("finished withdrawing", itemName)

        for(var i in bot.character.items){
            exchangeLocation = null;
            itemData = bot.character.items[i];

            if(!itemData) continue;
            if(itemData.name !== itemName) continue;

            if((!gItem.upgrade && !gItem.compound) && gItem.e && itemData.q < gItem.e) continue

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
                console.log("Exchange item data is", itemData, "Exchange limit is", exchangeLimit)

                try{
                    if(gItem.compound || gItem.upgrade){
                        console.log("Single exchanging", itemData.name)
                        await exchangeSingle(bot, itemData);
                        continue;
                    }
                    console.log("Exchanging stack", itemData.name)
                    await exchangeStack(bot, itemData, exchangeLimit);
                }catch(error){
                    console.log("Error exchanging", error)
                }
  
                continue
            }
        }
    }

    return Promise.resolve("OK");
}

async function exchangeSingle(bot, itemData){

        if(!bot.character.canExchange(itemData.name)) return Promise.reject(`Can't exchange item ${itemData.name}`);

        const itemLoc = bot.character.locateItem(itemData.name, bot.character.items)
        itemData = bot.character.items[itemLoc]
        console.log("itemLoc", itemLoc, itemData.name)
        if(!itemLoc && itemLoc !== 0) return Promise.reject(`Can't exchange item - no item location for ${itemData.name}`);

        while(bot.character.q.exchange) {
            console.log("We're currently exchanging, waiting a bit... (1s)")
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await bot.character.exchange(itemLoc).catch((error) => {
            console.log("Failed to exchange", error)
        })
    
    await new Promise(resolve => setTimeout(resolve, 4000)); 
    return Promise.resolve('OK')
}

async function exchangeStack(bot, itemData, exchangeLimit){

    while(itemData.q >= exchangeLimit){ // Only exchange 10 at a time so we don't flood our inventory and bank
        await new Promise(resolve => setTimeout(resolve, 1000));
        if(!bot.character.canExchange(itemData.name)) break;

        const itemLoc = bot.character.locateItem(itemData.name, bot.character.items)
        itemData = bot.character.items[itemLoc]
        console.log("itemLoc", itemLoc, itemData.name)
        if(!itemLoc && itemLoc !== 0) break;
        console.log("QTY LEFT", itemData.q, "exchangeLimit:", exchangeLimit)
        console.log("** Exchanging ** ", itemData.name, "in slot", itemLoc)

        if(bot.character.q.exchange) continue
        await bot.character.exchange(itemLoc).catch((error) => {
            console.log("Failed exchange", error)
        })
    }
    
    return Promise.resolve('OK')
}

export default findAndExchange;
