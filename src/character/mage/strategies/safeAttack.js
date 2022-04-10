
async function safeAttack(bot, party, targetData){

    // If we have a target, and that target is not us, we're safe to attack
    if(targetData.target && targetData.target !== bot.character.id) {
        await this.character.basicAttack(targetData?.id).catch(async (error) => {});
        return Promise.resolve("OK");
    }

    // Otherwise, make sure we're out of range of the target

    if(bot.AL.Tools.distance(bot.character, targetData) > targetData.range) {
        await this.character.basicAttack(targetData?.id).catch(async (error) => {});
        return Promise.resolve("OK");
    }

    return Promise.resolve("OK")
}


export default safeAttack