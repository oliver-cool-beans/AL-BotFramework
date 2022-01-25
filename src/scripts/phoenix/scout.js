import { MessageButton } from "discord.js";
import utils from "../utils/index.js";

// Scout phoenix positions
async function scout(spawns, bot, party) {
    var nearbyPhoenix = bot.character.getEntity({ returnNearest: true, type: "phoenix" })
    while(!nearbyPhoenix){
        console.log("SEARCHING SPAWNS FOR PHOENIX ************")
        for(var index in spawns){
            // Is there an issue with smart move? rejects when blinkTimout 1000, but it should really keep going after that. 
            await bot.character.smartMove(spawns[index], {getWithin: 50, useBlink: true}).catch(() => {});
            console.log("I've arrived");
            nearbyPhoenix = bot.character.getEntity({ returnNearest: true, type: "phoenix" })
        }
        await new Promise(resolve => setTimeout(resolve, parseInt(500)));
    }
    console.log("THIS ENDED")
    if(nearbyPhoenix) {
        bot.target = nearbyPhoenix;
        setPartyTasks(bot, party);
        await magiportParty(bot, party); 
    }
    return Promise.resolve(nearbyPhoenix);
}


function setPartyTasks(bot, party){
    party.forEach((member) => {
        if(member.characterClass == "merchant") return;
        member.addTask({
            script: "phoenix", 
            user: bot.name
        })
    })
}   

async function magiportParty(bot, party) {
    for(index in party){
        while(bot.character.mp < 900){ // The cost required for magiport
            await utils.usePotionIfLow(bot)
            await new Promise(resolve => setTimeout(resolve, parseInt(1000))); // Wait the timeout and try again
        }
        while(!bot.character.canUse("magiport")){
            console.log(`${bot.name} cannot use magiport, waiting until we can`);
            await new Promise(resolve => setTimeout(resolve, parseInt(500))); // Wait the timeout and try again
        }
        
        console.log("Attempting to magiport", party[index].name);
        await bot.character.magiport(party[index]).catch(() => {
            console.log("Error magiporting", party[index].name)
        })
    }
    return Promise.resolve("OK")
}

export default scout