const fishingSpot = { map: "main", x: -1198, y: -288 }


async function fish(bot){

    if(!bot.character) return;
    if(!bot.character.canUse("fishing", { ignoreEquipped: true})) return;
    if(!bot.character.hasItem("rod") && !bot.character.isEquipped("rod")) return
    bot.character.closeMerchantStand();

    await bot.character.smartMove(fishingSpot).catch(() => {});

//    const mainHand = bot.character.slots.mainhand?.name;
    const offhand = bot.character.slots.offhand?.name;
    
    if(!bot.character.isEquipped("rod")){
        if(offhand) await bot.character.unequip("offhand");
        const mainHandSlot = bot.character.locateItem("rod", bot.character.items);
        await bot.character.equip(mainHandSlot);
    }

    await bot.character.fish().catch((error) => {
        console.log(bot.name, "Failed to fish", error)
    })

    await bot.character.unequip("mainhand");

    return Promise.resolve()
}

export default fish;
