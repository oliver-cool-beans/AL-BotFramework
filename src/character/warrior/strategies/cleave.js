
async function cleave(bot, party){

    if(bot.character.canUse("cleave")){
        await bot.character.cleave();
        return Promise.resolve("OK");
    }
    return Promise.reject("Cannot use cleave");

}


export default cleave