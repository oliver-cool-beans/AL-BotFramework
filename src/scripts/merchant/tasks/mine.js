const miningSpot = { map: "tunnel", x: -280, y: -10 }


async function mine(bot){

    if(!bot.character) return;
    if(!bot.character.canUse("mining", { ignoreEquipped: true})) return;
    if(!bot.character.hasItem("pickaxe") && !bot.character.isEquipped("pickaxe")) return
    bot.character.closeMerchantStand();

    await bot.character.smartMove(miningSpot).catch(() => {});

//    const mainHand = bot.character.slots.mainhand?.name;
    const offhand = bot.character.slots.offhand?.name;
    
    if(!bot.character.isEquipped("pickaxe")){
        if(offhand) await bot.character.unequip("offhand");
        const mainHandSlot = bot.character.locateItem("pickaxe", bot.character.items);
        await bot.character.equip(mainHandSlot);
    }

    await bot.character.mine().catch((error) => {
        console.log(bot.name, "Failed to mine", error)
    })

    await bot.character.unequip("mainhand");

    return Promise.resolve()
}

export default mine;
