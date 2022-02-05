import upgradeItems from "./tasks/upgradeItems.js";
import compoundItems from "./tasks/compoundItems.js";
import buyAndSell from "./tasks/buyAndSell.js";
import sellInStand from "./tasks/sellInStand.js";
import serverWideMluck from "./tasks/serverWideMluck.js";

async function scheduler(bot, force = false){
    if(bot.characterClass !== "merchant") return Promise.resolve(`Not a merchant ${bot.name}, ${bot.characterClass}`);
    
    const date = new Date();
    if(shouldRunSchedule(bot.scheduleLastRun)){
        console.log("Running schedule")
        if(bot.character.stand) await bot.character.closeMerchantStand().catch(() => {})
        date.setMinutes(date.getMinutes() + 15);
        bot.scheduleLastRun = date;
        var shouldCompound = true;
       
        while(shouldCompound){
            console.log("Running Compound...")
            shouldCompound = await compoundItems(bot).catch(() => {});
        }
        var shouldUpgrade = true;
        while(shouldUpgrade){
            console.log("Running Upgrade...")
            shouldUpgrade = await upgradeItems(bot).catch(() => {})
        }

        await bot.character.smartMove('main', {avoidTownWarps: true}).catch(() => {});
        
        await serverWideMluck(bot).catch((error) => {
            console.log("ServerWideMluck Failed", error)
        });
    
    }

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