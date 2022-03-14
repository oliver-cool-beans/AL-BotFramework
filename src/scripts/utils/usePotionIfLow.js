
async function usePotionIfLow(bot) {

    const mpot0Loc = bot.character.locateItem("mpot0", bot.items);
    const mpot1Loc = bot.character.locateItem("mpot1", bot.items);
    const hpot0Loc = bot.character.locateItem("hpot0", bot.items);
    const hpot1Loc = bot.character.locateItem("hpot1", bot.items)

    const mpot = mpot1Loc !== undefined ? mpot1Loc : mpot0Loc;
    const hpot = hpot1Loc !== undefined ? hpot1Loc : hpot0Loc;

    if(bot.character.hp / bot.character.max_hp < 0.7 && hpot !== undefined) {
        await bot.character.useHPPot(hpot).catch((error) => {})
    }

    if(bot.character.mp / bot.character.max_mp < 0.7 && mpot !== undefined) {
        await bot.character.useMPPot(mpot).catch((error) => {})
    }

    return Promise.resolve("Finished")
}

export default usePotionIfLow