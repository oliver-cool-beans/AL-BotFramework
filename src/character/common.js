import utils from "../scripts/utils/index.js"

const common = {
    prepareCharacter : async (bot, leader, party) => {
        bot.leader = leader;
        bot.merchant = party.filter((member) => member.class == "merchant")?.[0]

        const partyNames = party.map((member) => member.name);;

        if(!bot.isRunning) await bot.start().catch((error) => {
            return Promise.reject(`${bot.name} encounted an error running, ${error}`);
        });

        bot.isLeader && bot.character.socket.on("request", async (data) => {
            try {
                if (partyNames.includes(data.name)) {
                    await bot.limiter.schedule(() => {
                        bot.character.acceptPartyRequest(data.name).catch(() => {})
                    })
                }
            } catch (e) {
                console.log(e)
            }
        });

        // Socket events that all characters should listen to. Character specific events should be declared in their character folders. 

        // On Private Message
        bot.character.socket.on("pm", async (data) => {
            if(partyNames.includes(data.owner)) return;
            bot.notifyPrivateMessage(process.env["DISCORD_CHANNEL_ID"], data.message, data.owner);
        });

        // On public chat log
        bot.character.socket.on("chat_log", async (data) => {
          if(partyNames.includes(data.owner)) return;
          bot.notifyChatMessage(process.env["DISCORD_CHANNEL_ID"], data.message, bot.character.map, data.owner);

        })
        //On magiport request from another player
        bot.character.socket.on("magiport", async (data) => {
            if(!partyNames.includes(data.name)) return // If it's not from a partymember reject
            bot.character.stopSmartMove().catch(() => { /* Suppress errors */ })
            console.log(`Accepting magiport from ${data.name}`)
            bot.character.acceptMagiport(data.name).catch(async () => {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait the timeout and try again
                bot.character.acceptMagiport(data.name).catch(() => {})
            })
        });

        // On hit
        bot.character.socket.on("hit", async (data) => utils.avoidStack(bot, data));

        return Promise.resolve("OK");
    }, 
    startCharacter: async (bot, serverName, serverFlag) => {
        const classFunctionName = `start${bot.characterClass.toLowerCase().charAt(0).toUpperCase()}${bot.characterClass.slice(1)}`
        return await bot.AL.Game[classFunctionName](bot.name, serverName, serverFlag).catch(async (error) => {  // Start the character class from ALClient eg startWarrior
            const waitTime = error.match(/_(.*?)_/)?.[1]
            if(!waitTime) return Promise.reject(error);
            console.log("Timeout detected, waiting", parseInt(waitTime), "seconds");

            await new Promise(resolve => setTimeout(resolve, parseInt(waitTime * 1000))); // Wait the timeout and try again
            return await bot.AL.Game[classFunctionName](bot.name, serverName, serverFlag).catch((error) => Promise.reject(error))
        })
    },

}


export default common;