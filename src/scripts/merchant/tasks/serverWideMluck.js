import utils from "../../utils/index.js";

async function serverWideMluck(bot){
    const { maps: gMaps } = bot.AL.Game.G;
    for(var map in gMaps){
     
        console.log("** Server wide Mluck ** moving to", map )
        await bot.character.smartMove(map).catch((error) => {
            console.log("** Server Wide Mluck ** Failed to move to map", map)
        });

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait the timeout and try again
        
        const mluckPlayers = Array.from(bot.character.players.values()).map((player) => {
            if(player.s?.mluck?.f !== bot.name && !player.s?.mluck?.strong && player.ctype !== "merchant" && !player.npc){
                return player;
            }
        }).filter(Boolean);
        console.log("** Server Wide Mluck", `found ${mluckPlayers.length} players in ${map} to mluck`)
        for(var player in mluckPlayers){
            console.log(`Traveling to ${player} to cast mluck`, mluckPlayers[player]?.id);
            await bot.character.smartMove(mluckPlayers[player], {avoidTownWarps: true, getWithin: bot.G.skills.mluck.range / 2}).catch(() => {});
        }
    }
}   

export default serverWideMluck;
