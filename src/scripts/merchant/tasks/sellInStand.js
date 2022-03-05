import utils from "../../utils/index.js";

const merchantStandItems = {
    "gem0": {
        qty: "all", 
        price: 1000000
    }, 
    "vitearring": {
        level: 4, 
        qty: "all", 
        price: 100000000
    }, 
    "wbook0" : {
        level: 4, 
        qty: "all", 
        price: 400000000
    },
    "tracker": {
        qty: "all", 
        price: 3000000
    }
   /* "intearring": {
        level: 3, 
        qty: "all", 
        price: 20000000
    }, 
    "strearring": {
        level: 3, 
        qty: "all",
        price: 20000000
    }, 
    "dexearring": {
        level: 3, 
        qty: "all",
        price: 40000000
    } */
}

async function sellInStand(bot){

    console.log("Depositing back in Bank");
    await utils.goToBank(bot, ['stand0'], 50000000);
    await bot.character.withdrawGold(50000000 - bot.character.gold).catch(() => {})
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
            await bot.character.listForSale(i, merchantStandItems[itemData?.name].price).catch((error) => {
                console.log("There was an issue listing item", itemData.name, error);
            })
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait
        }
    }

    return Promise.resolve("OK");
}

export default sellInStand;
