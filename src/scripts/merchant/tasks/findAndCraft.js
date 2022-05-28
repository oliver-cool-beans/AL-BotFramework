import utils from "../../utils/index.js";

async function findAndCraft(bot){

    console.log("Finding items to craft");
    
    if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})

    for(var index in bot.itemsToCraft){
        if(bot.character.esize <= 0) return Promise.resolve("Inventory full");
        
        let itemName = bot.itemsToCraft[index];
        let craftCounter = 0;
        let craftLimit = 5;
        const gCraft = bot.character.G.craft[itemName]
        const requiredItems = []
        const itemsToBuy = [];

        gCraft.items.forEach((item) => {
            const itemDetails = {qty: item[0], name: item[1]}
            const closestVendor = utils.findClosestVendor(bot.AL, item[1], bot.character);
            if(closestVendor.npc.id){
                itemDetails.closestVendor = closestVendor.npc.id;
                itemsToBuy.push(itemDetails)
                return
            }
            requiredItems.push(itemDetails)
        });

        if(!bankHasItems(bot, requiredItems)){
            console.log("Do not have required items for", itemName);
            continue
        }

        await utils.goToBank(bot, bot.itemsToKeep, 50000000);

        const withdrawPayload = requiredItems.reduce((payload, item) =>{
            payload[item.name] = {qty: 'all'}
            return payload
        }, {});

        console.log("Withdraw payload is ->", withdrawPayload)

        await utils.withdrawItemsFromBank(bot, withdrawPayload);
    

        console.log("REQUIRED ITEMS IN INVENTORY", hasRequiredInInventory(bot.character.items, requiredItems))
        
        while(hasRequiredInInventory(bot.character.items, requiredItems) && craftCounter < craftLimit){
            await buyItems(bot, itemsToBuy);
    
            await bot.character.smartMove("craftsman", {getWithin: bot.AL.Constants.NPC_INTERACTION_DISTANCE / 2  });
            if(bot.character.canCraft(itemName)){
                console.log("CRAFTING", itemName)
                await bot.character.craft(itemName)
            }
            craftCounter++
        }
    }

    return Promise.resolve("OK");
}


function hasRequiredInInventory(inventory, requiredItems){
    let hasItems = true;
    requiredItems.forEach((reqItem) => {
        const invItem = inventory.find((item) => item && item.name == reqItem.name)
        if(!invItem || invItem.qty < reqItem.qty) hasItems = false;
    })
    return hasItems;
}

async function buyItems(bot, itemsToBuy){
    return await Promise.all(itemsToBuy.map(async (item) => {
        await bot.character.smartMove(item.closestVendor, {getWithin: bot.AL.Constants.NPC_INTERACTION_DISTANCE / 2  })
        .catch((error) => {console.log("CANNOT MOVE TO CLOSEST VENDOR", error)})
        console.log("Moved to vendor", item.closestVendor, "for", item.name)
        if(bot.character.canBuy(item.name)){
            console.log("I AM NOW BUYING", item.name)
            return await bot.character.buy(item.name, item.qty).catch(() => {console.log("CANNOT BUY", error)})
        }
    }))
}

function bankHasItems(bot, requiredItems){
    const itemNames = requiredItems.map((item) => item.name);
    const bankItems = bot.checkBankFor(itemNames)
    let itemData
    for(var i in requiredItems){
        itemData = requiredItems[i]
        if(!bankItems[itemData.name] || bankItems[itemData.name] < itemData.qty){
            return false;
        }
    }

    return true
}

export default findAndCraft;
