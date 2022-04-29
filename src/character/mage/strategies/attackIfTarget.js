
async function attackIfTarget(bot, party, targetData){

    // If we have a target, and that target is not us, we're safe to attack
    if(targetData.target && targetData.target !== bot.character.id) {
        await bot.character.basicAttack(targetData?.id).catch(async (error) => {});
        return Promise.resolve("OK");
    }

    return Promise.resolve("OK")
}


export default attackIfTarget