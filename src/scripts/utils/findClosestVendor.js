
function findClosestVendor(AL, item, character, ignoreMaps = []) {
    const { maps: gMaps, npcs: gNpcs } = AL.Game.G;
    return Object.values(gMaps).reduce((npc, map) => {
        const closestNpcList = Object.values(map.npcs).sort((a, b) => {
            if (!a.position) {
                return -1;
            }
            const compareA = { map: map.name, x: a.position[0], y: a.position[1] };
            const compareB = { map: map.name, x: b.position[0], y: b.position[1] };
            return AL.Tools.distance(character, compareA) - AL.Tools.distance(character, compareB);
        }).filter((npc) => gNpcs[npc.id].items && gNpcs[npc.id].items.includes(item)); // Filter only npc's with the item we want
        if (!closestNpcList.length)
            return npc;
        const closestDistance = AL.Tools.distance(character, { map: map.name, x: closestNpcList[0].position[0], y: closestNpcList[0].position[1] });
        if (!npc.distance || closestDistance < npc.distance) {
            npc = {
                npc: closestNpcList[0],
                distance: closestDistance
            };
        }
        return npc;
    }, { distance: null, npc: {} });
}

export default findClosestVendor;
