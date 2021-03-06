

async function getMonsterHunt(bot, party, merchant, args = {}, taskId){
    if(bot.character.s?.monsterhunt) {
        bot.removeTask(taskId);
        return
    }

    await bot.character.smartMove("monsterhunter", {getWithin: 350, avoidTownWarps: true}).catch(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await bot.character.smartMove("monsterhunter", {getWithin: 350}).catch(() => {})
    });
    await bot.character.getMonsterHuntQuest().catch((error) => {
        console.log("Failed to get monsterhunt", error)
    });
    return;
}

export default getMonsterHunt