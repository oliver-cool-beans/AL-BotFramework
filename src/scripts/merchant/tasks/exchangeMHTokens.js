import utils from "../../utils/index.js";

async function exchangeMHTokens(bot){

    console.log("Exchanging MH Tokens");
    if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})
    await utils.withdrawItemsFromBank(bot, {"monstertoken" : {qty: "all"}});

    await bot.character.smartMove("monsterhunter", {getWithin: 350, avoidTownWarps: true}).catch(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await bot.character.smartMove("monsterhunter", {getWithin: 350}).catch(() => {})
    });

    while(bot.character.canBuy("troll")){
        await new Promise(resolve => setTimeout(resolve, 1000));
        await bot.character.buy("troll");
    }

    await utils.depositItemsInBank(bot,  {"monstertoken": {qty: "all"}, "troll": {qty: "all"}})
    return Promise.resolve("OK");
}

export default exchangeMHTokens;
