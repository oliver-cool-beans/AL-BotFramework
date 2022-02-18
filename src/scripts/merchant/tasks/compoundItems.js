import utils from "../../../scripts/utils/index.js";

async function compoundItems(bot){
    if (!["bank", "bank_b", "bank_u"].includes(bot.character.map))  await bot.character.smartMove({ map: "bank", x: 0, y: -200 }, { avoidTownWarps: true }).catch(() => {});;

    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
    }
    
    for (let i = 0; i < 20; i++) {
        console.log("Waiting for bank items to populate")
        if(bot.character.bank){
            if (Object.keys(bot.character.bank).length > 1) break
        }
        await new Promise(resolve => setTimeout(resolve, 250))
    }

    if(bot.character.gold < 5000000){
        await bot.character.withdrawGold(5000000 - bot.character.gold);
    }
    
    const bankAndInventory = {...bot.character.bank, inventory: bot.character.items}

    const allCompoundableItems = Object.entries(bankAndInventory).reduce((bank, [slotName, value]) => {
        if(slotName == "gold") return bank;
        bank[slotName] = value.reduce((acc, slotItem, index) => {
            if(!slotItem) return acc;
            if(!bot.AL.Game.G.items[slotItem.name]?.compound) return acc; // If this item is not compoundable
            if(!acc[slotItem.name]) acc[slotItem.name] = {};
            acc[slotItem.name][slotItem.level]?.length ? acc[slotItem.name][slotItem.level].push(index) 
            : acc[slotItem.name][slotItem.level] = [index]
            return acc;
        }, {});
        return bank
    }, {})

    const poppedItems = {}; // A place to keep the buffered items we want to keep
    // Filter down all items, to only ones that have more quantity than 1

    const allSafeItems = Object.entries(allCompoundableItems).reduce((list, [slotName, value]) => {
        //Loop through each item level for this item
        Object.entries(value).reduce((acc, [itemName, itemsBylevel]) => {
            // For every level of each item, make sure we're above the buffer across all bank slots
            const eligibleItems = Object.entries(itemsBylevel).reduce((obj, [level, items]) => {
                // For each bank tab, count the items at this level
                const allTabsCount = Object.entries(allCompoundableItems).map(([name, bankSlotItems]) => {
                    return bankSlotItems?.[itemName]?.[level]
                }).filter(Boolean).flat();

                 console.log(`There are ${allTabsCount.length} of ${itemName} in all tabs at level ${level} - ${items.length} in this tab - ${slotName} = ${items}`)

                const levelAboveCount = Object.values(allCompoundableItems).map(({[itemName]: itemData}) => {
                    // Get all items above this items level for this item
                    if(!itemData) return;
                    return Object.entries(itemData).map(([lev, array]) => {
                        if(lev > level) return array;
                    }).filter(Boolean).flat();
                }).filter(Boolean).flat();

                // console.log(`There are ${levelAboveCount.length} of ${itemName} in all tabs ABOVE level ${level}`)
                
                if(!items.length) return obj // If we've got no items just return
                if(allTabsCount.length >= 3 && (levelAboveCount.length || poppedItems?.[itemName]?.[level])) obj[level] = items; // If we've got 3 or more, and items exist above this level, process all
                if(allTabsCount.length > 3 && !levelAboveCount.length) obj[level] = items; // If we've got MORE than 3 and no items exist above the level, process all
                if(allTabsCount.length > 3 && !levelAboveCount.length && !poppedItems?.[itemName]?.[level]) { // If we've got MORE than 3 and no items above the level, and we haven't buffered on yet.
                    obj[level].pop();
                    allTabsCount.pop();
                    poppedItems[itemName] = poppedItems[itemName] ? {...poppedItems[itemName], [level]: true}
                    : {[level]: true}
                } 
                // Check if divisible by 3, if it's not then cut off X from the end until it is
                if(allTabsCount.length && obj[level]){
                    if(allTabsCount.length % 3 !== 0) {
                        const spliceAmount = allTabsCount.length % 3 > obj[level]?.length ? obj[level]?.length : allTabsCount.length % 3; // Don't splice more than is in this tab;

                        spliceAmount && obj[level].splice(obj[level].length - spliceAmount, spliceAmount); // Remove X from the end of the array
                    }
                }
                if(!obj[level]?.length) delete obj[level];
                return obj;

            }, {});
            if(Object.keys(eligibleItems).length) list[itemName] = {...list[itemName], [slotName]: eligibleItems}
            return acc
        }, {});

        return list
    }, {});
    console.log("Items to Compound", JSON.stringify(allSafeItems))
    console.log("Popped items", poppedItems);

    if(!Object.keys(allSafeItems).length) return Promise.resolve(false);

    for(var safeItemName in allSafeItems){
        console.log("Withdrawing All Of", safeItemName);
        await withdrawAllOfItem(bot, safeItemName, allSafeItems[safeItemName])        
    }
    

    await bot.character.smartMove("newupgrade", { avoidTownWarps: true }).catch(() => {});
    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
    }

    // Compound each item
    var item
    var itemArray = []
    for(var index in bot.character.items){
        item = bot.character.items[index];
        if(!item) continue;
        if(!bot.AL.Game.G.items[item.name]?.compound) continue;
        console.log("Attempting to compound", item)
        itemArray = bot.character.locateItemsByLevel(bot.character.items, {excludeLockedItems: true})?.[item.name]?.[item.level]?.slice(0, 3);
        if(!itemArray.length == 3) continue;
        const requiredScroll = `cscroll${bot.character.calculateItemGrade(item)}`

        var scrollPosition = bot.character.locateItem(requiredScroll);
        if(scrollPosition == undefined && !bot.character.canBuy(requiredScroll)) {
            console.log("SCROLL POSITION", bot.character.locateItem(requiredScroll))
            console.log("NO SCROLL and can't buy one??", bot.character.canBuy(requiredScroll))
            continue
        }
        if(scrollPosition == undefined) {
            console.log("Buying scroll", requiredScroll)
            await bot.character.buy(requiredScroll).catch((error) => {
                console.log(error)
            })
            scrollPosition = bot.character.locateItem(requiredScroll);
        }
        console.log("Compounding");
        await bot.character.compound(itemArray[0], itemArray[1], itemArray[2], scrollPosition).catch((error) => {
            console.log("There was an error compounding", error)
        })
        console.log("Finished Compounding")
    }
    

    console.log("Depositing back in Bank");
    await utils.goToBank(bot, ['cscroll0', 'cscroll1', 'scroll0', 'scroll1', 'stand'], 1000000, 'main');
    console.log("Finished compound script")

    return Promise.resolve(true)
}

async function withdrawAllOfItem(bot, itemName, bankSlots) {
    var itemsByLevel
    let inventorySpace = bot.character.items.map((item, index) => { 
        if(!item) return index;
    }).filter(Boolean)?.length


    for(var slotName in bankSlots){
        itemsByLevel = bankSlots[slotName]
        const itemSlots = Object.values(itemsByLevel).flat();

        if(itemSlots.length > inventorySpace || slotName == "inventory" || !itemSlots.length) continue

        console.log(inventorySpace, "available space in inventory", itemSlots.length, "Items to withdraw", "slotName is", slotName)

        inventorySpace -= itemSlots.length;

        for (var slot in itemSlots){
            console.log("Withdrawing", itemName, "from", slotName, "slot", itemSlots[slot]);
            bot.character.withdrawItem(slotName, itemSlots[slot], inventorySpace[slot]).catch((error) => {
                console.log("cannot withdraw", error)
            })
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the cooldown
        }
    }
    return Promise.resolve('OK')
}

export default compoundItems;