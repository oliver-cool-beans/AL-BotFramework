
async function kiteTarget(bot, party){
    try{
        console.log("warrior kiting target")
        // Find the target entity
        const target = bot.target
        if(!target) {
        };
        const distance = bot.AL.Tools.distance(bot.character, target);
    
        // Stop smart moving when we can walk to the monster directly
        if (bot.character.smartMoving && (bot.AL.Pathfinder.canWalkPath(bot, target) || distance < bot.character.range)) {
            bot.character.stopSmartMove().catch(() => { /* Suppress errors */ })
        }
    
        const kiteDistance = Math.min(bot.character.range * 2);
        const distanceToMove = distance - kiteDistance
        const angleFromBotToMonster = Math.atan2(target.y - bot.character.y, target.x - bot.character.x)
        let potentialSpot = { map: bot.character.map, x: bot.character.x + distanceToMove * Math.cos(angleFromBotToMonster), y: bot.character.y + distanceToMove * Math.sin(angleFromBotToMonster) }
        let angle = 0
        while (!bot.AL.Pathfinder.canStand(potentialSpot) && angle <= 2 * Math.PI) {
            if (angle > 0) {
                angle = -angle
            } else {
                angle -= Math.PI / 180 // Increase angle by 1 degree
                angle = -angle
            }
            potentialSpot = { map: bot.character.map, x: bot.character.x + distanceToMove * Math.cos(angleFromBotToMonster + angle), y: bot.character.y + distanceToMove * Math.sin(angleFromBotToMonster + angle) }
        }

        if (bot.AL.Pathfinder.canWalkPath(bot, potentialSpot)) {
            bot.character.move(potentialSpot.x, potentialSpot.y).catch(() => { /* Suppress errors */ })
        } else if (bot.AL.Pathfinder.canStand(potentialSpot) && !bot.character.smartMoving) {
            bot.character.smartMove(potentialSpot, { avoidTownWarps: true }).catch(() => { /* Suppress errors */ })
        }
    }catch(error){
        bot.log(`Error kiting target ${target?.name} ERROR`)
    }
    
}


export default kiteTarget