import utils from "../../../scripts/utils/index.js";
const excludeList = [];

async function upgradeItems(bot){
    if (!["bank", "bank_b", "bank_u"].includes(bot.character.map))  await bot.character.smartMove({ map: "bank", x: 0, y: -200 }, { avoidTownWarps: true });

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

    const allUpgradeableItems = Object.entries(bankAndInventory).reduce((bank, [slotName, value]) => {
        if(slotName == "gold") return bank;
        bank[slotName] = value.reduce((acc, slotItem, index) => {
            if(!slotItem) return acc;
            if(!bot.AL.Game.G.items[slotItem.name]?.upgrade) return acc; // If this item is not upgradeable
            if(slotItem.level >= 8) return acc; // If the item is gte level 8
            if(slotItem.p) return acc; // Item is special
            if(slotItem.l) return acc // Item is locked
            if(excludeList.includes(slotItem.name)) return acc // If we've excluded this item
            if(!acc[slotItem.name]) acc[slotItem.name] = {};
            acc[slotItem.name][slotItem.level]?.length ? acc[slotItem.name][slotItem.level].push(index) 
            : acc[slotItem.name][slotItem.level] = [index]
            return acc;
        }, {});
        return bank
    }, {})

    const poppedItems = {}; // A place to keep the buffered items we want to keep
    // Filter down all items, to only ones that have more quantity than 1
    const allSafeItems = Object.entries(allUpgradeableItems).reduce((list, [slotName, value]) => {
        //Loop through each item level for this item
        Object.entries(value).reduce((acc, [itemName, itemsBylevel]) => {
            // For every level of each item, make sure we're above the buffer across all bank slots
            const eligibleItems = Object.entries(itemsBylevel).reduce((obj, [level, items]) => {
                // For each bank tab, count the items at this level
                const allTabsCount = Object.values(allUpgradeableItems).map((bankSlotItems) => {
                    return bankSlotItems?.[itemName]?.[level]
                }).filter(Boolean).flat();

                console.log(`There are ${allTabsCount.length} of ${itemName} in all tabs at level ${level}`)

                const levelAboveCount = Object.values(allUpgradeableItems).map(({[itemName]: itemData}) => {
                    // Get all items above this items level for this item
                    if(!itemData) return;
                    return Object.entries(itemData).map(([lev, array]) => {
                        if(lev > level) return array;
                    }).filter(Boolean).flat();
                }).filter(Boolean).flat();

                console.log(`There are ${levelAboveCount.length} of ${itemName} in all tabs ABOVE level ${level}`)
                if(!items.length) return obj // If we've got no items just return

                if(allTabsCount.length && (levelAboveCount.length || poppedItems?.[itemName]?.[level])) obj[level] = items;
                if(allTabsCount.length > 1 && !levelAboveCount.length) obj[level] = items;
                if(allTabsCount.length > 1 && !levelAboveCount.length && !poppedItems?.[itemName]?.[level]) {
                    obj[level].pop();
                    allTabsCount.pop();
                    poppedItems[itemName] = poppedItems[itemName] ? {...poppedItems[itemName], [level]: true}
                    : {[level]: true}
                }  
                if(!obj[level]?.length) delete obj[level];
                return obj;
            }, {});
            if(Object.keys(eligibleItems).length) list[itemName] = {...list[itemName], [slotName]: eligibleItems}
            return acc
        }, {});

        return list
    }, {});

    console.log("Items to Upgrade", allSafeItems)
    console.log("Popped items", poppedItems);
    
    if(!Object.keys(allSafeItems).length) return Promise.resolve(false);

    for(var safeItemName in allSafeItems){
        console.log("Withdrawing All Of", safeItemName);
        if(bot.character.esize <= 1) continue;
        await withdrawAllOfItem(bot, safeItemName, allSafeItems[safeItemName])  
        console.log("Finished withdrawing", safeItemName)
      
    }

    await bot.character.smartMove("newupgrade", { avoidTownWarps: true }).catch(() => {});
    while(bot.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
    }

    // Upgrade each item
    var item
    for(var index in bot.character.items){
        item = bot.character.items[index];
        if(!item) continue;
        if(item.level >= 8) continue;
        if(bot.itemsToKeep.includes(item.name)) continue;
        if(!bot.AL.Game.G.items[item.name]?.upgrade) continue;
        console.log("Attempting to upgrade", item)
        const requiredScroll = `scroll${bot.character.calculateItemGrade(item)}`
        console.log("RequiredScroll", requiredScroll);
        var scrollPosition = bot.character.locateItem(requiredScroll);
        if(scrollPosition == undefined && !bot.character?.canBuy(requiredScroll)) {
            continue
        }
        if(scrollPosition == undefined) {
            console.log("Buying scroll", requiredScroll)
            await bot.character.buy(requiredScroll).catch((error) => {
                console.log(error)
            })
            scrollPosition = bot.character.locateItem(requiredScroll);
        }
        console.log("We now have a scroll in", scrollPosition, "to upgrade item", item?.name)
        console.log("Upgrading");
        await bot.character.upgrade(index, scrollPosition).catch((error) => {
            console.log("There was an error upgrading", error)
        })
        console.log("finished upgrading")
    }

    console.log("Depositing back in Bank");
    await utils.goToBank(bot, bot.itemsToKeep, 1000000, 'main');
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
    return Promise.resolve(true)
}

export default upgradeItems;