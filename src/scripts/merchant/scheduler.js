import upgradeItems from "./tasks/upgradeItems.js";
import compoundItems from "./tasks/compoundItems.js";

async function scheduler(bot, force = false){
    console.log("RUNNING", bot.characterClass)
    if(bot.characterClass !== "merchant") return Promise.resolve(`Not a merchant ${bot.name}, ${bot.characterClass}`);
    
    const date = new Date();
    if(shouldRunSchedule(bot.scheduleLastRun) || force){
        console.log("Running schedule")
        date.setMinutes(date.getMinutes() + 30);
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
    }
    return Promise.resolve("OK")
}

function shouldRunSchedule(lastRunTime) {
    if(!lastRunTime) return true;
    if(Math.abs(new Date() - lastRunTime) / 36e5 > 0.5) return true;
    return false; 
}

export default scheduler;