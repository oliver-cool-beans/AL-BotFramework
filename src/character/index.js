/*
    A Standard character from which all characters are based off. 
    Depending on the character 
*/

import scripts from "../scripts/index.js";
import common from "./common.js";
import merchant from "./merchant/index.js";
import warrior from "./warrior/index.js";
import ranger from "./ranger/index.js";
import mage from "./mage/index.js";
import priest from "./priest/index.js";
import paladin from "./paladin/index.js";
import rogue from "./rouge/index.js";
import Bottleneck from "bottleneck";
import utils from "../scripts/utils/index.js";

const characterFunctions = {
    merchant: merchant, 
    warrior: warrior, 
    ranger: ranger,
    mage: mage, 
    priest: priest, 
    paladin: paladin, 
    rogue: rogue
}

class Character {
    constructor(characterName, characterClass, scriptName, isLeader){
        
        const limiter = new Bottleneck({
            minTime: 1,
            maxConcurrent: 1
        });

        this.name = characterName;
        this.limiter = limiter;
        this.characterClass = characterClass;
        this.runningScriptName = null;
        this.isLeader = isLeader;
        this.leader = null;
        this.scriptName = scriptName;
        this.character = null;
        this.isRunning = false;
        this.target = null;
        this.merchant = null;
        this.notificationBuffer = [];
        this.tasks = [];
    }

    async start(AL) {
        if(!AL) return Promise.reject("Missing AL Client")

        this.AL = AL;
        this.character = this.character || await common.startCharacter(this, "ASIA", "I");
        if(characterFunctions[this.characterClass]?.load) await characterFunctions[this.characterClass].load.apply(this).catch((error) => {
            console.log("Error Loading class functions", error)
        })
        return Promise.resolve("OK");
    };

    async run(party, discord, AL){

        if(discord) this.discord = discord;
        if(party) this.party = party;

        if(!this.character) await this.start(AL);
        if(this.isRunning) return "Already running";
        this.isRunning = true
        const leader = party.members?.[0];

        await common.prepareCharacter(this, leader, party.members);

        while(this.isRunning){
            if(!this.character.socket || this.character.disconnected) return;

            if(this.tasks.length){
                console.log(`${this.name} is running task ${task.script}`);
                await scripts[tasks[0].script](this, party.members, this.merchant);
                continue;
            }

            if(characterFunctions[this.characterClass]?.loop) await characterFunctions[this.characterClass].loop.apply(this).catch((error) => console.log("ERROR", error))

            this.potionLoop();
            this.adminLoop();

            await scripts[this.scriptName](this, party.members, this.merchant, this.scriptArgs).catch((error) => {
                console.log("Error running script", this.scriptName, error)
            });   
         
            await new Promise(resolve => setTimeout(resolve, parseInt(500))); // Wait the timeout and try again
        }
        return Promise.resolve("OK")

    }

    setScript(name, args = null){
        this.scriptName = name;
        this.scriptArgs = args;
        console.log("Script is now", this.scriptName)

    }

    addTask(task) {
        if(!task?.script) return false;
        return this.tasks.push(task)
    }

    disconnect(){
        if(!this.character) return "Character not connected";
        this.character.disconnect();
        this.isRunning = false;
        this.character = false;
        return

    }
    resetTarget(){
        this.target = null
    }

    notifyChatMessage(channel, message, map, owner){
        if(!this.discord || !channel || !message) return;
        this.notificationBuffer = this.notificationBuffer.map((msg) => { // Remove messages older than 30 seconds
            if(Math.abs(new Date() - new Date(msg.date)) / 1000 >= 30) return 
            return msg
        }).filter(Boolean);

        const duplicatedMessages = this.party.members.map((member) => {
            const dups = member.notificationBuffer.map((msg) => {
                return (msg.owner == owner && msg.message == message && msg.map == map) && msg
            }).filter(Boolean)
            return dups.length && dups;
        }).flat().filter(Boolean);

        if(duplicatedMessages.length){
            console.log("Duplicate found returning");
            return
        }

        this.notificationBuffer.push({
            date: new Date(),
            owner: owner, 
            message: message,
            map: map
        })

        const payload = `__**PUBLIC chat *overheard* by:**__ ${this.name} on **MAP:**: ${map}\n**WHO:** ${owner}\n**MESSAGE:** ${message}`
        return this.discord.channels.cache.get(channel.toString()).send(payload)
    }

    notifyPrivateMessage(channel, message, owner ) {
        const payload = `__${owner} ***whispered***:__ ${this.name}\n**MESSAGE:** ${message}`
        return this.discord.channels.cache.get(channel.toString()).send(payload)  
    }

    async sendPrivateMessage(to, message){
        return this.character.sendPM(to, message)
    }

    sendPublicMessage(message){
        return this.character.say(message)
    }

    calculatePotionItems() {
        const level = this.character.level < 30 ? 0 : 1;
        return{
            hpot: `hpot${level}`,
            mpot: `mpot${level}`
        }
    }

    async potionLoop(){
        while(this.character.ready){
            if(Object.keys(this.character.c).length) continue;
            await utils.usePotionIfLow(this);
            await new Promise(resolve => setTimeout(resolve, parseInt(2000)));
        }
    }
    async adminLoop(){
        while(this.character.ready){
            if(Object.keys(this.character.c).length) continue;
            if(this.character.rip) {
                await this.character.respawn().catch(() => {});
            }
            await new Promise(resolve => setTimeout(resolve, parseInt(2000)));
        }

    }

}
export default Character;