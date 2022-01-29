/*
    A Standard character from which all characters are based off. 
    Depending on the character 
*/

import scripts from "../scripts/index.js";
import tasks from "../scripts/tasks/index.js";
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
        this.character = this.character || await common.startCharacter(this, "US", "I");
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

        // Running independant loops means we can perform multiple actions at a time if needed, while keeping the logic independant
        // i.e moving and attacking and using a potion in the same action
        if(this.characterClass !== "merchant"){
            this.buyPotionLoop(); // Buy potions if we can and we need some;
            this.potionLoop(); // Use a potion if we need to
            this.attackLoop(); // Attack our target if we can
            this.moveLoop(); // Move to our target if we should     
        }

        this.adminLoop(); // Resurrect if we need to
        
    
        while(this.isRunning){
            if(!this.character.socket || this.character.disconnected) return;
 
            if(characterFunctions[this.characterClass]?.loop) await characterFunctions[this.characterClass].loop.apply(this).catch((error) => console.log("ERROR", error))

            if(this.tasks.length){
                await {...scripts, ...tasks}[this.tasks[0].script](this, party.members, this.merchant, this.tasks[0].args);
                continue;
            }

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
        if(this.tasks.find((queue) => queue.script = task.script)) return false;
        console.log("ADDED TASK", task.script, this.tasks)
        return this.tasks.push(task)
    }

    removeTask(name){
        this.tasks = this.tasks.filter((queue) => queue.script !== name); // THis'll remove them all. May want to just remove first later
        console.log("REMOVED TASK", name, this.tasks)

        return;
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
            if(!Object.keys(this.character.c).length) await utils.usePotionIfLow(this);
            await new Promise(resolve => setTimeout(resolve, parseInt(2000)));
        }
    }
    async adminLoop(){
        while(this.character.ready){

            if(!this.character.party && !this.isLeader && this.leader && !this.sentPartyRequest) {
                await this.character.sendPartyRequest(this.leader.name);
                this.sentPartyRequest = true;
            }

            if(this.character.rip) await this.character.respawn().catch(() => {});

            await new Promise(resolve => setTimeout(resolve, parseInt(2000)));
        }

    }

    async attackLoop(){
        while(this.character.ready){
            if(!this.target){
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            if(this.character.canUse("attack")){
                await this.character.basicAttack(this.target?.id).catch(async (error) => {});
            }
            await new Promise(resolve => setTimeout(resolve, parseInt(500)));
        }
    }

    async moveLoop(){
        while(this.character.ready){
            if(!this.target){
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            // If we're out of range, move to the target
            if(this.AL.Tools.distance(this.character, this.target) > this.character.range && !this.tasks[0]?.force){
                await this.character.smartMove(this.target, { getWithin: this.character.range }).catch(() => {})
            }
            await new Promise(resolve => setTimeout(resolve, parseInt(500)));
        }
    }

    async buyPotionLoop(){
        while(this.character.ready){
            const {hpot, mpot} = this.calculatePotionItems();
            const hpotCount = this.character.countItem(hpot);
            const mpotCount = this.character.countItem(mpot);
            if(hpotCount < 500) {
                if(this.character.canBuy(hpot)){
                    await this.character.buy(hpot, 500 - hpotCount).catch(() => {})
                }
            }
        
            if(mpotCount < 500) {
                if(this.character.canBuy(mpot)){
                    await this.character.buy(mpot, 500 - mpotCount).catch(() => {})
                }
            
            }
            await new Promise(resolve => setTimeout(resolve, parseInt(1000)));
        }
    }
}
export default Character;