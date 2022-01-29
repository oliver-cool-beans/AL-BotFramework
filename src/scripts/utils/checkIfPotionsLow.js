function checkIfPotionsLow(bot, amount) {

    const {hpot, mpot} = bot.calculatePotionItems();
    const hpotCount = bot.character.countItem(hpot);
    const mpotCount = bot.character.countItem(mpot);

    if(hpotCount >= amount && mpotCount >= amount) return false
    return true
}

export default checkIfPotionsLow