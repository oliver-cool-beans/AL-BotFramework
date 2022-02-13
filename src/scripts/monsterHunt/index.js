/*
    This is a script, it is responsible for setting and removing targets
    as well as any additional logic around aquiring these targets.
    and should not be used for anything else, as the attack and move loops do the rest.
*/

import utils from "../../scripts/utils/index.js";
import scripts from "../index.js";

async function monsterHunt(bot, party, merchant, args = {}) {
    const targetID = args.monsterhunt?.id
    if(!scripts[targetID]) return;
    if(!bot?.character.s?.monsterhunt?.c) {
        bot.removeTask("monsterhunt")
        return;
    }
    
    console.log(`${bot.name} - Monster hunting ${targetID} - ${bot.character.s?.monsterhunt?.c} to go`);

    await scripts[targetID](bot, party, merchant, args).catch((error) => {
        console.log("Failed to run script for monsterhunt", error)
    })

    return Promise.resolve("Finished");
}


export default monsterHunt;