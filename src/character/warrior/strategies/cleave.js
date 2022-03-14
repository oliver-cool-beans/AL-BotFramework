
async function cleave(bot, party){

    try{
        const nearbyEntities = Array.from(bot.character.entities.values()).filter((entity) => {
            return bot.AL.Tools.distance(bot.character, entity) <= 160 // Entities within range
                && !entity.target // and does not have a target
        }) || [];
    
        console.log(nearbyEntities.length, "Cleave?")
        if(nearbyEntities.length < 3) return Promise.reject("Not enough entities");
    
        if(bot.character.canUse("cleave")){
            await bot.character.cleave();
            return Promise.resolve("OK");
        }
        return Promise.reject("Cannot use cleave");
    }catch(error){
        console.log(error)
        return Promise.reject(error)
    }


}


export default cleave