
//https://github.com/earthiverse/adventureland-bots/blob/53bceb0e88a3fdef2a70a786ef64f0f9658980d3/source/base/general.ts#L838

async function kiteInCircle(bot) {
    try{
        const target = bot.character.getTargetEntity()
        if(!target) return Promise.resolve("No Target")
        
        const distance = bot.AL.Tools.distance(bot.character, target);
    
        // Stop smart moving when we can walk to the monster directly
        if (distance > bot.character.range){
            bot.character.smartMove(target).catch(() => { /* Suppress errors */ })
            return
        }

        const center = bot.kitePositions && bot.kitePositions[target.type]
        const radius = 100
        const angle = Math.PI / 2.5

        if(!center) return Promise.resolve("No kite config");
        if (target) {
            const angleFromCenterToMonsterGoing = Math.atan2(target.going_y - center.y, target.going_x - center.x)
            const endGoalAngle = angleFromCenterToMonsterGoing + angle
            const endGoal = { x: center.x + radius * Math.cos(endGoalAngle), y: center.y + radius * Math.sin(endGoalAngle) }
            bot.character.move(endGoal.x, endGoal.y, { resolveOnStart: true }).catch(e => console.error(e))
        }
    }catch(error){
        console.log(error)
    }
}


export default kiteInCircle