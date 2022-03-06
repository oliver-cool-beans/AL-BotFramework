import utils from "../utils/index.js";

// Scout phoenix positions
async function scout(spawns, bot, party) {
    var nearbyPhoenix = bot.character.getEntity({ returnNearest: true, type: "phoenix" })
    while(!nearbyPhoenix && !bot.getTasks().length){
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("SEARCHING SPAWNS FOR PHOENIX ************", !!bot.character.socket, bot.character.ready, bot.character.map)
        if(!bot.character.socket || !bot.character.ready || bot.character.map == "jail") {
            console.log("Returning in scout")
            return await new Promise(resolve => setTimeout(resolve, 2000));
        };
        for(var index in spawns){
            if(nearbyPhoenix) break;
            var success = false;
            console.log("*** Moving to ", spawns[index], "***")
            while(!success && bot.isRunning){
                await new Promise(resolve => setTimeout(resolve, 500));
                while(bot.character.map == "jail" && bot.character.ready && bot.isRunning){
                    console.log("Waiting to port out of jail, then returning to scout", bot.character.ready, bot.isRunning, bot.character.map);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                const result = await bot.character.smartMove(spawns[index], {getWithin: 50, useBlink: true}).catch((error) => {
                    console.log("MOVE FAILED!?", "have we hung?")
                    return false
                });
                console.log("AFTER")
                if(!result) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue
                }
                nearbyPhoenix = bot.character.getEntity({ returnNearest: true, type: "phoenix" })
                success = result;
            }
            // Is there an issue with smart move? rejects when blinkTimout 1000, but it should really keep going after that. 

        }
    }

    if(nearbyPhoenix) {
        if(!nearbyPhoenix.target) {
            console.log(`This ${nearbyPhoenix.name} has no target, waiting until it does, or 30 seconds`)
            const expireWait = new Date()
            expireWait.setSeconds(expireWait.getSeconds() + 0);
            while(!nearbyPhoenix.target){
                console.log("Waiting...")
                if(expireWait - new Date() <= 0) break;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        bot.character.target = nearbyPhoenix?.id;
        bot.addTask({
            script: "specialMonster", 
            user: bot.name, 
            priority: 4, 
            args: {
                target: nearbyPhoenix
            }
        });
        await magiportParty(bot, party, nearbyPhoenix); 
    }
    return Promise.resolve(nearbyPhoenix);
}

async function magiportParty(bot, party, target) {
    for(var index in party){
        if(party[index].characterClass == "merchant") continue
        if(!party[index]?.character?.ready || party[index].name == bot.name) continue;
        while(bot.character.mp < 900){ // The cost required for magiport
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
        }
        while(!bot.character.canUse("magiport")){
            console.log(`${bot.name} cannot use magiport, waiting until we can`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait the timeout and try again
        }
        
        console.log("Attempting to magiport", party[index].name, party[index].character.id);
        await bot.character.magiport(party[index].character.id).catch((error) => {
            console.log("Error magiporting", party[index].name, error)
        })
        party[index].addTask({
            script: "specialMonster", 
            user: bot.name, 
            priority: 4, 
            args: {
                target: target
            }
        });
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait the timeout and try again
    }
    return Promise.resolve("OK")
}

export default scout