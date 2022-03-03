
async function healParty(bot, party){
    let characterToHeal
    try{
        if( (bot.character.max_hp * 0.7) >= bot.character.hp){
            characterToHeal = bot.character.id
        }else{
            const partyMembers = party.map((member) => member.name)
            const nearbyParty = Array.from(bot.character.players.values()).map((player) => {
                console.log(player?.id)
                if(partyMembers.includes(player.id) && (player.max_hp * 0.7) >= player.hp) return player
            }).filter(Boolean).sort((a, b) => a.hp - b.hp)
        
            if(!nearbyParty.length) return Promise.reject("No-one to heal");
            characterToHeal = nearbyParty[0].id
        }

        if(bot.character.canUse("heal")){
            await bot.character.heal(characterToHeal)
        }

    }catch(error){
        console.log(error)
    }
//            if((member.character.max_hp * 0.7) <= member.character.hp ) return false

}


export default healParty