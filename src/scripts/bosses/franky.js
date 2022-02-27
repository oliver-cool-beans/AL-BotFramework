import utils from "../../scripts/utils/index.js";


async function franky(bot, party, merchant, args = {}){
    this.attackRange = 25;

    if(!bot.character?.S?.franky?.live) {
        console.log("Franky is no longer live, removing task");
        bot.removeTask("franky");
        return;
    }

    
    if(!bot.runningScriptName == "franky") {
        bot.runningScriptName = "franky"
    }
    

    if(!bot.character.target || bot.character.target?.name !== "Franky"){
        await bot.character.smartMove(args.event).catch(() => {});
    }

     // If we've got no target, get a valid target;
    if(!bot.character.target || !bot.checkTarget(bot?.target, bot.character.entities, targets)) {
        bot.character.target = utils.findClosestTarget(bot.AL, bot.character, party, "franky");
    }

    this.attackRange = this.character.range / 2;
    return Promise.resolve("Finished");
}



export default franky