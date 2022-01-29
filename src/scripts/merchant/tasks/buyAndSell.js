async function buyAndSell(bot){

    const allMerchantData = await bot.AL.Game.getMerchants().catch((error) => {
        console.log("There was an issue getting all merchant data", error)
    })

    // A list of everthing that's selling
    const allSellOrders = [];
    // A list of everything that's buying
    const allBuyOrders = allMerchantData.map((merchant) => {
        const {slots, ...merchantData} = merchant;
        if(!merchant.afk) return false; // Non AFK people are unpredictable, best to avoid;
        return Object.entries(merchant.slots).map(([slot, sale]) => {
            const slotData = {slot: slot, merchant: merchantData, ...sale}
            if(sale.b) return slotData;
            allSellOrders.push(slotData);
            return
        })
    }).flat().filter(Boolean)

    const merchantTrades = merchantToMerchant(bot, allBuyOrders, allSellOrders)
    console.log("MERCHANT TRADES TRADES", merchantTrades)

    const NPCTrades = merchantToNPC(bot, allSellOrders);
    console.log("NPC TRADES", NPCTrades)
   
}

function merchantToNPC(bot, allSellOrders){
    return allSellOrders.map((sellOrder) => {
        const cost = bot.AL.Game.G.items[sellOrder.name].g
        if(sellOrder.price < (cost * 0.6)) return sellOrder;
        return;
    }).filter(Boolean)
}

function merchantToMerchant(bot, allBuyOrders, allSellOrders){
    return allSellOrders.map((sellOrder) => {
        const goodBuyers = allBuyOrders.map((buyOrder) => { // A list of all buyers that'll buy this item for more
            const buyPrice = sellOrder.price
            const sellPrice = buyOrder.price - (buyOrder.price * 0.04) // + 4% tax
            if(buyOrder.name !== sellOrder.name) return
            if(buyOrder.level !== sellOrder.level) return
            if(buyPrice >= sellPrice) return
            return {...buyOrder, margin: sellPrice - buyPrice}
        }).filter(Boolean);
        if(!goodBuyers.length) return;
        return {...sellOrder, buyers: goodBuyers}
    }).filter(Boolean)
    
    /*var vendorToBuy;
    var vendorToSell
    var trade
    for(var index in goodTrades){
        trade = goodTrades[index]
        vendorToBuy = trade.merchant;
        vendorToSell = trade.buyers[0].merchant;
        await buyFromMerchant(bot, vendorToBuy, trade.name).catch((error) => {
            console.log(`Failed to buy ${trade.name} from ${vendorToBuy.name}`, error)
        })
        if(`${bot.serverRegion} ${bot.serverIdentifier}` !== vendorToBuy.merchant.server){

        }
    } */
}
async function buyFromMerchant(bot, merchant) {
    console.log("Buying from merchant", merchant.name);
    const serverProperties = merchant.server.split(" ");
    if(serverProperties[0] !== bot.serverRegion || serverProperties[1] !== bot.serverIdentifier){
        await bot.switchServer(serverProperties[0], serverProperties[1]).catch((error) => {
            console.log(`There was an issue switching to`, serverProperties[0], serverProperties[1])
        })
    }
    await bot.character.smartMove(merchant).catch(() => {});
    console.log("I'm AT THE MERCHANT!!!");
    return Promise.resolve("OK");
}

export default buyAndSell;
