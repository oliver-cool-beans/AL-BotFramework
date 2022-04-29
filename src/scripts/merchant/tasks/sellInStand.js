import utils from "../../utils/index.js";

const merchantStandItems = {
    "vitearring": {
        level: 4, 
        qty: "all", 
        price: 50000000
    }, 
    "wbook0" : {
        level: 4, 
        qty: "all", 
        price: 100000000
    },
    "essenceofgreed" : {
        qty: "all", 
        price: 500000000
    },
    "rabbitsfoot" : {
        qty: "all", 
        price: 500000000
    },
    "cryptkey" : {
        qty: "all", 
        price: 5000000
    },
    "tracker": {
        qty: "all", 
        price: 3000000
    }, 
    "ink": {
        qty: "all",
        price: 10000000
    }, 
    "snakefang": {
        qty: "all",
        price: 1000000
    }, 
    "snakeoil": {
        qty: "all",
        price: 500000
    }, 
    "egg0": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg1": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg2": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg3": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg4": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg5": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg6": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg7": {
        qty: "all", 
        price: 99999999999
    }, 
    "egg8": {
        qty: "all", 
        price: 99999999999
    }
}

async function sellInStand(bot){

    console.log("Depositing back in Bank");
    await utils.goToBank(bot, bot.itemsToKeep, 50000000);
    if(bot.character.gold < 5000000) await bot.character.withdrawGold(50000000 - bot.character.gold)
    await utils.withdrawItemsFromBank(bot, {"stand0": {qty: 1}});
    await utils.withdrawItemsFromBank(bot, merchantStandItems);

    await bot.character.smartMove( {map: "main", x: 180.821266, y: -66.94612} ).catch(() => {})
    await bot.character.openMerchantStand().catch((error) => {
        return Promise.reject("failed to open the stand", error);
    });

    var itemData
    for(var i in bot.character.items){
        itemData = bot.character.items[i];
        if(!itemData) continue;
        if(merchantStandItems[itemData?.name] && merchantStandItems[itemData?.name].level == itemData.level ){
            await bot.character.listForSale(i, merchantStandItems[itemData?.name].price, null, itemData.q || 1).catch((error) => {
                console.log("There was an issue listing item", itemData.name, error);
            })
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait
        }
    }

    return Promise.resolve("OK");
}

export default sellInStand;
