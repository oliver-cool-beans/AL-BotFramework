function findClosestTarget (AL, character, party = [], eligibleTargets = [], avoidPlayerTargets = true) {

    var closestEntity = null;
    const partyTargets = party.map((member) => {
        return member?.target
    }).filter(Boolean);

    const playerTargets = avoidPlayerTargets ? Array.from(character.players.values()).map((player) => player.id !== character.id && player.target).filter(Boolean) : [];
    character.entities.forEach((entity) => {
        if(!eligibleTargets.includes(entity.name)) return
        if(partyTargets.includes(entity.id)) return; // Avoid the same target as a party member
        if(playerTargets.includes(entity.id)) return; // Avoid other players targets;
        if(!closestEntity) {
            closestEntity = entity;
            return;
        }

        if(AL.Tools.distance(character, entity) < AL.Tools.distance(character, closestEntity) ){
            closestEntity = entity;
        }
    });

    return closestEntity?.id;
}

export default findClosestTarget;