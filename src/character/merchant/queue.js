// Basic merchant script

async function queue(bot, party) {
    const queue = bot.getQueue();
    if(!bot.runningScriptName) {
        bot.runningScriptName = "queue"
    }

    if(queue.length) {
        console.log("Starting queue -- Awaiting for any straggler incoming jobs")
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds for anyone elses jobs to come in
        await bot.runQueue();
    }

   /* const closestVendor = bot.character.findClosestVendor("hpot0");
    if(closestVendor) {
        console.log("Moving to vendor", closestVendor)
      //  await bot.character.smartMove(closestVendor.npc.id).catch(() => {});
    } */
    
  //  await bot.character.smartMove("goo");
    //await bot.character.smartMove("fancypots")
    
    return Promise.resolve("Finished");
}

export default queue;