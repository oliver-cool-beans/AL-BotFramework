export default async function adminLoop(bot){
    while(bot.isRunning){ 
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot).catch((error) => console.log(bot.name, "Failed to run admin loop", error))
    }
    console.log("Admin loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot){
    if(!bot.character?.ready) return
    const tasks = bot.getTasks();
    if(!bot.character.party && !bot.isLeader && bot.leader && !bot.sentPartyRequest) {
        bot.log(`Sending party request to, ${bot.leader.name}`)
        await bot.character.sendPartyRequest(bot.leader.name).catch(() => {})
        bot.sentPartyRequest = true;
    }
    if(bot.character.map == "jail") {
        await bot.character.leaveMap().catch((error) => bot.log(`JAIL PORT ERRORED ${JSON.stringify(error)}`));
    }
    if(bot.character.rip) {
        bot.character.target = null
        await bot.character.respawn().catch(() => {});
    }

    if(bot.character.esize <= 0 && bot.character.ctype !== "merchant") {
        const {hpot, mpot} = bot.calculatePotionItems();
        bot.addTask({
            script: "bankItems", 
            user: bot.name, 
            priority: 1,
            force: true,
            args: {
                itemsToHold: [hpot, mpot, "tracker"].concat(bot.itemsToHold), 
                goldToHold: 1000000,
                nextPosition: {x: bot.character.x, y: bot.character.y, map: bot.character.map}
            }
        })
    }

    if(bot.character.gold < 200000 && bot.character.ctype !== "merchant"){
        bot.addTask({
            script: "withdrawGold", 
            user: bot.name, 
            priority: 1, 
            args: {
                goldToHold: 1000000, 
                nextPosition: {x: bot.character.x, y: bot.character.y, map: bot.character.map}
            }
        })
    }
    const elixirsInBank = bot.checkBankFor(bot.elixirs)

    // If we've got no elixir, and the bank has elixirs we use
    if(bot.character && !bot.character.slots.elixir && Object.keys(elixirsInBank).length){
        const chosenElixir = Object.keys(elixirsInBank)[0]
        bot.addTask({
            script: "findAndUseElixir", 
            user: bot.name, 
            priority: 8, 
            args: {
                itemsToWithdraw: {[chosenElixir]: {qty: 1}}
            }
        })
    }

    if(tasks.length) return; // If we have tasks, do not continue with the below loop logic

    if((bot.serverIdentifier !==  bot.character.serverData.name) || (bot.serverRegion !==  bot.character.serverData.region)){
        await new Promise(resolve => setTimeout(resolve, 1000));
        bot.log(`Switching back to home server ${bot.serverRegion} ${bot.serverIdentifier}`)
        await bot.switchServer(bot.serverRegion, bot.serverIdentifier)
    }

    return
    
}