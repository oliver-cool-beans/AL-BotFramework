
async function agitate(bot, party){
    if(bot.party.agitator != bot.name) return Promise.resolve("Not the agitator");

    const nearbyEntities = bot.character.entities.values().filter((entity) => {
        return bot.AL.Tools.distance(bot.character, entity) <= 320 // Entities within agitate range
            && !entity.target // and does not have a target
    }) || [];
    
    if(nearbyEntities.length < 5) return Promise.resolve("Not enough entities");
    
    if(bot.character.canUse("agitate")){
        await bot.character.agitate();
        return Promise.resolve("OK");
    }

}


export default agitate