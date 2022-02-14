/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/
export default {
    load: loadFunctions,
    loop: loopFunctions
}

async function loadFunctions () {
    return Promise.resolve('OK');
}

async function loopFunctions(){
    healParty(this)
}


async function healParty(bot){
    while(bot.character.socket){
        const validMembers = bot.party.members.filter((member) => {
            if(!member.character?.hp) return false
            console.log(member.name, member.character.hp)
            if(member.character.map !== bot.character.map) return false
            if((member.character.max_hp * 0.7) <= member.character.hp ) return false
            return true
        });
        const sortedMembers = validMembers.sort((a, b) => a.character.hp - b.character.hp);
        if(!sortedMembers.length){
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
            continue
        }

        if(bot.character.canUse("heal")){
            console.log("HEALING", sortedMembers[0].name)
            if(bot.AL.Tools.distance(bot.character, sortedMembers[0].character) > bot.AL.Game.G.skills.heal.range && bot.name !== sortedMembers[0].name){
                await bot.character.smartMove(sortedMembers[0], {getWithin: bot.AL.Game.G.skills.heal.range / 2}).catch(() => {})
            }
            bot.character.heal(sortedMembers[0].character.id).catch((error) => {
                console.log("Failed to heal", error)
            })
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
    }

}