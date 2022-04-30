/* This is the Commander script, which will take input from Discord and control bot instances.
    From here, instances of the bot framework can be called individually.
*/

import AL from "alclient"
import {discord} from "./discord/index.cjs";
import logger from "./logger/index.cjs";
import scripts from "./scripts/index.js";
import Character from "./character/index.js";
import Party from "./party/index.js";
import { character } from "./discord/commands/index.cjs";

async function init() {
    const newLogger = logger();
    const {AL_EMAIL, AL_PASSWORD, AUTO_START, PARTY_CONFIG, DEFAULT_SCRIPT} = process.env;
    
    const {DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DISCORD_CHANNEL_ID} = process.env;

    if(!AL_EMAIL || !AL_PASSWORD) return Promise.reject("AL Credentials not provided");

    console.log("Initializing Commander");
    await Promise.all([AL.Game.login(AL_EMAIL, AL_PASSWORD), AL.Game.getGData()]).catch((error) => {
        return Promise.reject(`Unable to Login to AL CLient: ${error}`)
    })

    await AL.Pathfinder.prepare(AL.Game.G)
    const characters = Object.values(AL.Game.characters).map((char, index) => {
        return new Character(char.name, char.type, DEFAULT_SCRIPT, !index, newLogger)
    })
    console.log(`Found ${characters.length} characters`);
    const party = new Party(characters, PARTY_CONFIG);

    characters.forEach((char) => char.party = party); // Assign the party class to each character

    resolveDefaultParty(PARTY_CONFIG, characters, party);

    console.log(`Set default party as ${party.members.map((member) => member.name)}`);

    console.log("Initializing Discord");
    if(!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID || !DISCORD_CHANNEL_ID) return Promise.reject("Discord credentials not provided");
    const discordCredentials = {token: DISCORD_TOKEN, clientID: DISCORD_CLIENT_ID, guildID: DISCORD_GUILD_ID, channelID: DISCORD_CHANNEL_ID};
    await discord(AL, discordCredentials, scripts, characters, party).catch((error) => {
        console.log("Error initializing Discord", error)
    })

}

function resolveDefaultParty(partyConfig, characters, partyClass) {
    try{
        // If the user specified PARTY_CONFIG, get the party called "default" or the first party
        if(!partyConfig) return null
        const parsedPartyConfig = JSON.parse(partyConfig);
        partyClass.config = parsedPartyConfig;
        const party = parsedPartyConfig?.default || parsedPartyConfig?.[0] || []
        return party.map((member) => {
            const character = characters.find((char) => char.name == member);
            if(character){
                partyClass.addMember(character.name);
                return character;
            }
        }).filter(Boolean)
    }catch(error){
        return null
    }
}

init().catch((error) => {
    console.log("ERROR", error)
})