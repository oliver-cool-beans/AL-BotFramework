function findClosestTarget (AL, character, party = [], eligibleTargets = [], avoidPlayerTargets = true, avoidPartyTargets = true) {

    var closestEntity = null;
    const partyTargets = party.map((member) => {
        return member?.target?.id
    }).filter(Boolean);

    const playerTargets = avoidPlayerTargets ? Array.from(character.players.values()).map((player) => player.id !== character.id && player.target).filter(Boolean) : [];
    const entities = [...character.entities.values() ];
    const validEntities = entities.filter((entity) => {
        if(!eligibleTargets.includes(entity.name)) return
        if(entity.cooperative) return entity; // Ignore all the player/party avoidance if it's a coop monster
        if(avoidPartyTargets && partyTargets.includes(entity.id)) return; // Avoid the same target as a party member
        if(avoidPlayerTargets && playerTargets.includes(entity.id)) return; // Avoid other players targets;
        return entity;
    }).sort((entityA, entityB) => {
        // If the priority is higher in the target array, it comes first
        if(eligibleTargets.indexOf(entityA.name) < eligibleTargets.indexOf(entityB.name) ){
            return -1
        }
        // If it's closer than the previous target, it comes first
        if(AL.Tools.distance(character, entityA) < AL.Tools.distance(character, entityB) ){
            return -1
        }
        // If it's further away, push it back
        if(AL.Tools.distance(character, entityA) > AL.Tools.distance(character, entityB) ){
            return 1
        }
        return 0 // Otheriwse it's equal
    })

    return validEntities[0];
}

export default findClosestTarget;