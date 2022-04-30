

async function finishMonsterHunt(bot, party, merchant, args = {}, taskId){
    if(!bot.character.s?.monsterhunt || bot.character.s?.monsterhunt?.c) {
        bot.removeTask(taskId);
        return
    }

    if((args.serverIdentifier !==  bot.character.serverData.name) || (args.serverRegion !==  bot.character.serverData.region)){
        console.log("SWITCHING", args.serverIdentifier, bot.character.serverData.name, args.serverRegion, bot.character.serverData.region)
        args.serverIdentifier && args.serverRegion && await bot.switchServer(args.serverRegion, args.serverIdentifier)
        return;
    }

    
    await bot.character.smartMove("monsterhunter", {getWithin: 350, avoidTownWarps: true}).catch(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await bot.character.smartMove("monsterhunter", {getWithin: 350}).catch(() => {})
    });
    await bot.character.finishMonsterHuntQuest().catch((error) => {
        console.log("Failed to finish monsterhunt", error)

    });
    return
}

export default finishMonsterHunt