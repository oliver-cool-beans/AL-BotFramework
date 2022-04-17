import withdrawItemsFromBank from '../utils/withdrawItemsFromBank.js'
import depositItemsInBank from '../utils/depositItemsInBank.js'

async function findAndUseElixir(bot, party, merchant, args) {
    console.log("Withdrawing elixirs from bank", args.itemsToWithdraw)
    const {itemsToWithdraw} = args;
    await withdrawItemsFromBank(bot, itemsToWithdraw)

    const elixirsInInventory = bot.character.items.filter((item) => {
        if(item && bot.elixirs.includes(item.name)) return item.name
    })

    // Use an elixir
    if(!bot.character.slots.elixir && elixirsInInventory.length){
        console.log(bot.name, "Equipping Elixir", elixirsInInventory[0])
        const elixirLocation = bot.character.locateItem(elixirsInInventory[0].name);
        console.log("Elixir Location is", elixirLocation)
        await bot.character.equip(elixirLocation).catch(() => {})
        console.log("Equipped Elixir in", elixirLocation)
    } 

    // Now put it back in the bank
    console.log("Depositing elixirs back in bank", itemsToWithdraw)
    await depositItemsInBank(bot, itemsToWithdraw)



    bot.removeTask('findAndUseElixir');
    return Promise.resolve("Finished")
}

export default findAndUseElixir