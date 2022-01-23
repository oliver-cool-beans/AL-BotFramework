// Basic merchant script

async function upgrade(bot, party, upgradeItems, bufferQuantity = 0) {
    /* const upgradeItems = [
        {
            "name": "staff", 
            "level": 7,
            "quantity": 1
        },
        {
            "name": "bow",
            "level": 7, 
            "quantity": 1
        },
        {
            "name": "blade", 
            "level": 7,
            "quantity": 2
        },
        {
            "name": "helmet", 
            "level": 5,
            "quantity": 3
        },
        {
            "name": "pants", 
            "level": 5,
            "quantity": 3
        },
        {
            "name": "coat", 
            "level": 5,
            "quantity": 3
        },
        {
            "name": "shoes", 
            "level": 5,
            "quantity": 3
        },
        {
            "name": "gloves", 
            "level": 5,
            "quantity": 3
        },
    ]
*/
    const nextItem = upgradeItems.filter((item) => {
        const itemCount =  bot.character.locateItemsByLevel(bot.character.items, {excludeLockedItems: true})?.[item.name]?.[item.level]?.length || 0;
        return itemCount < item.quantity
    })?.[0]

    if(!nextItem) return
    
    const upgradeItem = nextItem.name
    const quantity = nextItem.quantity
    const level = nextItem.level
    console.log("We've got", bot.character.gold, "gold")
    if(bot.character.q.upgrade) return Promise.resolve("Upgrade in progress, we must wait");

    console.log(`Starting upgrade for ${upgradeItem} until quantity ${quantity} of level ${level}`);

    let itemLevel, requiredScroll, itemPositions, scrollPosition

    const itemsByLevel = bot.character.locateItemsByLevel(bot.character.items, {excludeLockedItems: true})?.[upgradeItem];
    // Get an array of available items under the required upgrade level
    const highestLevelItem = itemsByLevel && Object.entries(itemsByLevel).sort((a, b) => b[0] - a[0]).filter((item) => {
        return item[0] < level && item[1].length > bufferQuantity // Require at leave 2 items to upgrade so we've got a spare
    })?.[0] || await purchaseRequiredItem(bot, upgradeItem, level, bufferQuantity);

    console.log("the highest level item is", highestLevelItem)
    if(!highestLevelItem) return Promise.resolve("No items");

    itemLevel = highestLevelItem[0]
    itemPositions = highestLevelItem[1]
    requiredScroll = `scroll${bot.character.calculateItemGrade({level: itemLevel, name: upgradeItem})}`
    scrollPosition = bot.character.locateItem(requiredScroll);
    if(!scrollPosition && !bot.character.canBuy(requiredScroll)) return Promise.resolve("Cannot buy scroll");
    if(!scrollPosition) {
        console.log("Buying scroll", requiredScroll)
        await bot.character.buy(requiredScroll).catch((error) => {
            console.log(error)
        })
        scrollPosition = bot.character.locateItem(requiredScroll);
    }

    console.log("We now have a scroll in", scrollPosition, "to upgrade item", upgradeItem)
    console.log("Upgrading");
    await bot.character.upgrade(itemPositions[0], scrollPosition).catch((error) => {
        console.log("There was an error upgrading", error)
    })

    return Promise.resolve("Finished"); 
}


async function purchaseRequiredItem(bot, item, level, bufferQuantity) {
    console.log("Purchasing items");
    await bot.character.buy(item);
    const botItems = bot.character.locateItemsByLevel(bot.character.items, {excludeLockedItems: true})?.[item]
    return Object.entries(botItems).sort((a, b) => b[0] - a[0] ).filter((item) => {
        return item[0] < level && item[1].length > bufferQuantity // Require at leave 2 items to upgrade so we've got a spare
    })?.[0]
}

export default upgrade;