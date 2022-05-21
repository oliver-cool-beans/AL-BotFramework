
const maxManaSpend = 500;

async function cburst(bot, party, targetData) {
    let manaRemaining = maxManaSpend;
    const manaToKill = calcManaCost(targetData.hp);

    await bot.character.basicAttack(targetData?.id).catch(async (error) => { });

    if (bot.character.mp < maxManaSpend || !bot.character.canUse('cburst') || (bot.character.max_mp * 0.7) >= bot.character.mp ) {
        return Promise.resolve("OK");
    }


    const targets = [];
    if(manaToKill > maxManaSpend && bot.AL.Tools.distance(bot.character, targetData) < 200){
        targets.push([targetData.id, manaRemaining]);
        manaRemaining = 0;
    }
    manaRemaining = manaRemaining - calcManaCost(targetData.hp);

    const playerTargets =  [...bot.character.players.values()].map((player) => {
        if(player.id !== bot.character.id && player.target) return player.target
    }).filter(Boolean);

    [...bot.character.entities.values()].forEach((entity) => {
        if (entity.target && entity.target !== bot.character.id) return;
        if(entity.type !== targetData.type) return;
        if (playerTargets.includes(entity.id)) return;
        if(calcManaCost(entity.hp) > manaRemaining) return;
        if(bot.AL.Tools.distance(bot.character, entity) > 200) return;
        targets.push([entity.id, calcManaCost(entity.hp)]);
        manaRemaining = manaRemaining - calcManaCost(entity.hp);    
    });

    targets.length && await bot.character.cburst(targets).catch((error) => {console.log("Failed to cburst", error)});

    return Promise.resolve("OK")
}

const calcManaCost = (hp) => {
    return hp + (hp * 0.80)
}


export default cburst