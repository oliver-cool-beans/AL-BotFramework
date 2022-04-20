import utils from "../../utils/index.js";


async function findAndSell(bot){

    console.log("Finding items and sell");
    if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})
    const itemsToSell = bot.itemsToSell.reduce((acc, item) => {
        if(!acc[item.name]) acc[item.name] = {qty: "all", level: 0}
        return acc
    }, {})
    await utils.goToBank(bot, bot.itemsToKeep, 50000000);
    await utils.withdrawItemsFromBank(bot, itemsToSell);
    console.log("Moving to vendor to sell....")
    await bot.character.smartMove("fancypots").catch(() => {})
    await new Promise(resolve => setTimeout(resolve, 10000));

    return Promise.resolve("OK");
}

export default findAndSell;
