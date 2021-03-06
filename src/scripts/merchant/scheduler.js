import upgradeItems from "./tasks/upgradeItems.js";
import compoundItems from "./tasks/compoundItems.js";
import buyAndSell from "./tasks/buyAndSell.js";
import sellInStand from "./tasks/sellInStand.js";
import serverWideMluck from "./tasks/serverWideMluck.js";
import mine from "./tasks/mine.js";
import fish from "./tasks/fish.js";
import findAndExchange from "./tasks/findAndExchange.js";
import findAndRecycle from "./tasks/findAndRecycle.js";
import findAndSell from "./tasks/findAndSell.js";
import findAndCraft from "./tasks/findAndCraft.js";

//import exchangeMHTokens from "./tasks/exchangeMHTokens.js";

async function scheduler(bot, force = false){
    if(bot.characterClass !== "merchant") return Promise.resolve(`Not a merchant ${bot.name}, ${bot.characterClass}`);
    const date = new Date();

    if(shouldRunSchedule(bot.scheduleLastRun)){
        console.log("Running schedule")
        if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})
        date.setMinutes(date.getMinutes() + 15);
        bot.scheduleLastRun = date;

        if(bot.character.esize > 5){

            await findAndCraft(bot).catch((error) => {
                console.log("FAILED CRAFT RUN", error)
            })          
            
            await findAndRecycle(bot).catch((error) => {
                console.log("FAILED RECYCLE RUN", error)
            })
     
            await findAndExchange(bot).catch((error) => {
                console.log("FAILED EXCHANGE RUN", error)
            })
            
            await findAndSell(bot).catch((error) => {
                console.log("FAILED SELL RUN", error)
            })
        }

        var shouldUpgrade = true;
        while(shouldUpgrade){
            console.log("Running Upgrade...")
            shouldUpgrade = await upgradeItems(bot).catch(() => {})
        }

        var shouldCompound = true;
        while(shouldCompound){
            console.log("Running Compound...")
            shouldCompound = await compoundItems(bot).catch(() => {});
        }

        
        await bot.character.smartMove('main', {avoidTownWarps: true}).catch(() => {});
            
    }

    await mine(bot).catch(() => {});
    await fish(bot).catch(() => {});

    if(!bot.character.stand){
        await sellInStand(bot);
    }

    return Promise.resolve("OK")
}

function shouldRunSchedule(lastRunTime) {
    if(!lastRunTime) return true;   
    if(new Date() >= lastRunTime) return true;
    return false; 
}



export default scheduler;