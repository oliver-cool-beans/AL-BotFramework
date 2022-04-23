export default async function sellLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 200));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run sell loop", error))
    }
    console.log("Sell loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    if(bot.character.canSell()){
        const itemsToSell = bot.character.items.map((item, index) => {
            if(!item) return
            if(bot.itemsToSell.find((listItem) => listItem.name == item.name && listItem.level == item.level) ){
                return {...item, index: index}
            } 
        }).filter(Boolean);
        for(var item in itemsToSell){
            await bot.character.sell(itemsToSell[item].index).catch((error) => {
                bot.log(`${bot.name} errored selling item ${itemsToSell[item].name} ${JSON.stringify(error)}`)
            });
        }
    }

    return Promise.resolve("OK")
}