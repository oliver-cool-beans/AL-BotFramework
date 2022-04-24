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

import loops from "./loops/index.js";

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
    #tasks = []
    constructor(characterName, characterClass, scriptName, isLeader, logger){
        
        const limiter = new Bottleneck({
            minTime: 1,
            maxConcurrent: 1
        });

        this.logger = logger;
        this.name = characterName;
        this.limiter = limiter;
        this.characterClass = characterClass;
        this.runningScriptName = null;
        this.isLeader = isLeader;
        this.leader = null;
        this.scriptName = scriptName;
        this.character = null;
        this.isRunning = false;
        this.merchant = null;
        this.notificationBuffer = [];
        this.serverRegion = "ASIA", 
        this.serverIdentifier = "I"
        this.itemsToSell = [
            {name: "hpbelt", level: 0},  {name: "crabclaw"}, {name: "hpamulet", level: 0}, 
            {name: "vitscroll"}, {name: "mushroomstaff", level: 0}, {name: "stinger", level: 0}, 
            {name: "ringsj", level: 0}, {name: "beewings"}, {name: "whiteegg"}, {name: "slimestaff", level: 0}, 
            {name: "phelmet", level: 0}, {name: "gphelmet", level: 0},  {name: "coat", level: 0},  
            {name: "pants", level: 0},  {name: "helmet", level: 0},  {name: "shoes", level: 0},  
            {name: "gloves", level: 0},  {name: "spores"},  {name: "leather"}, 
            {name: "hhelmet", level: 0},  {name: "hgloves", level: 0},  {name: "hpants", level: 0}, 
            {name: "spear", level: 0},  {name: "gloves", level: 0},  {name: "wbook0", level: 0}, 
            {name: "gloves", level: 0},  {name: "rattail"},  {name: "smoke"},  {name: "bwing", level: 0}, 
            {name: "dagger", level: 0},  {name: "sword", level: 0},  {name: "pmace", level: 0}, 
            {name: "throwingstars", level: 0}, {name: "tshirt0", level: 0}, {name: "tshirt1", level: 0},
            {name: "tshirt2", level: 0}, {name: "troll"}, {name: "smoke"}, {name: "hammer", level: 0}, 
            {name: "gslime"}, {name: "sshield", level: 0}, {name: "epyjamas", level: 0},{name: "eears", level: 0},
             {name: "cscale"}, {name: "carrotsword", level: 0},
            {name: "spores"}, {name: "bwing"}, {name: "spores"}, {name: "bwing"}
        ] 
            // TODO put this in dynamic config accessable by discord
        this.specialMonsters = ["greenjr", "wabbit", "skeletor"]
        this.partyMonsters = []
        this.isSwitchingServers = false;
        this.isConnecting = false;
        this.loops = [];
        this.elixirs = [];
    }

    async start(AL) {
        if(!AL) return Promise.reject("Missing AL Client")
        this.log("Starting")
        this.AL = AL;
        this.character = await common.startCharacter(this, "ASIA", "I").catch(() => {});
        if(characterFunctions[this.characterClass]?.load) await characterFunctions[this.characterClass].load.apply(this).catch((error) => {
            this.log(`Error Loading class functions, ${error}`)
        })
        return Promise.resolve("OK");
    };

    async run(party, discord, AL, isLeader){

        if(discord) this.discord = discord;
        if(party) this.party = party;
        this.isLeader = isLeader;

        if(!this.character?.ready) await this.start(AL);
        if(this.isRunning) return "Already running";
        this.isRunning = true
        const leader = party.members?.[0];
        await common.prepareCharacter(this, leader, party.members);
        this.isConnecting = false

        // Running independant loops means we can perform multiple actions at a time if needed, while keeping the logic independant
        // i.e moving and attacking and using a potion in the same action
        if(this.characterClass !== "merchant"){
            this.loops.concat([
                loops.buyPotionLoop(this), // Buy potions if we can and we need some;
                loops.potionLoop(this), // Use a potion if we need to
                loops.attackLoop(this), // Attack our target if we can
                loops.moveLoop(this), // Move to our target if we should   
                loops.lootLoop(this), // Loots chests  
                loops.findSpecialMonsterLoop(this), // Check for special monsters and attack them
                loops.checkEventBossesLoop(this), // Check for boss events
                loops.monsterHuntLoop(this), // Check for monster hunts
                loops.defenceLoop(this), // Defensive actions like scare
            ])
        }
        this.loops.concat([
            loops.adminLoop(this), // Resurrect if we need to
            loops.sellLoop(this), // Sell junk when we can
            loops.randomEmotionLoop(this), // Just random emotions for fun
            loops.logLoop(this),
        ])

        
        if(characterFunctions[this.characterClass]?.loop) {
            await characterFunctions[this.characterClass].loop.apply(this).catch((error) => this.log(`ERROR: ${error}`))
        }

        this.loops.concat([this.mainLoop(discord, party)])
      
    }

    async mainLoop(discord, party){

        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 50)); 
            if(this.#tasks.length){
                if(!await {...scripts, ...tasks}[this.#tasks[0]?.script]){
                    this.removeTask(this.#tasks[0]?.script);
                    continue
                }
                await {...scripts, ...tasks}[this.#tasks[0].script](this, party.members, this.merchant, this.#tasks[0].args).catch((error) => {
                    this.log(`task ${this.#tasks[0]?.script} errored with, ${error}`)
                    this.removeTask(this.#tasks[0]?.script)
                });
                continue;
            }

            try{
                await scripts[this.scriptName](this, party.members, this.merchant, this.scriptArgs)
            }catch(error){
                this.log(`${this.name} errored running script ${this.scriptName} error: ${error}`)
            }
         
        }

        console.log("MAIN LOOP has stopped ...")
        return Promise.resolve("OK")
    }

    log(log, labels){
        this.logger.info(log, {
            ...labels, 
            character: this.name
        })
    }

    setScript(name, args = null){
        this.scriptName = name;
        this.scriptArgs = args;
        this.log(`Script is now, ${this.scriptName}`)
    }

    addTask(task) {
        if(!task?.script) return false;
        if(this.#tasks.find((queue) => queue.script == task.script)) return false;
        this.#tasks.push(task)
        this.#tasks = this.#tasks.sort((a, b) => (a.priority || 99) - (b.priority || 99))
        this.log(`${this.name} Added Task ${task.script} First Task is now ${this.#tasks[0].script} at priority, ${this.#tasks[0].priority}`)
        this.log(`${this.name} Second Task is now ${this.#tasks[1]?.script} at priority, ${this.#tasks[1]?.priority}`)

        return
    }

    getTasks(){
        return this.#tasks;
    }

    removeTask(name){
        this.#tasks = this.#tasks.filter((queue) => queue.script !== name); // This'll remove them all. May want to just remove first later
        this.log(`Removed Task: ${name}`)
        this.#tasks = this.#tasks.sort((a, b) => a.priority || 99 - b.priority || 99)
        return;
    }

    async reconnect(){
        await this.disconnect();
        this.log("Reconnecting -> Disconnected, waiting 5 seconds then reconnecting")
        try{
            await this.start(this.AL)
            await this.run(this.party, this.discord, this.AL, this.isLeader);
        }catch(error){
            console.log(this.name, "Failed to reconnect", error)
        }
    }

    async disconnect(){
        console.log("Waiting for all loops to finish")
        this.isRunning = false;
        await Promise.all(this.loops);
        this.character && this.character.disconnect();
        this.character = false;
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("Finished Disconnecting")
        return
    }

    resetTarget(){
        this.character.target = null
    }

    setTarget(target){
        this.character.target = target
    };

    checkTarget(target, entities = {}, targets){
        if(!target || !Object.keys(entities)) return false;
        if(!targets.includes(target.type)) return false;
        if(this.AL.Tools.distance(this.character, target) < 100 && !this.character.entities.get(target.id)){
            return false;    
        }
        return true;
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
            this.log("Duplicate found returning");
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

    async switchServer(region, identifier){
        try{
            if(region == this.serverRegion && identifier == this.identifier) return false;
            if(this.party.allCharacters.find((char) => char.character && char.character.map == "bank")) return false;
            console.log("running switch server", this.isSwitchingServers)
            if(this.isSwitchingServers && !this.character.ready) return false;
            console.log("AM I SWITCHING?", this.isSwitchingServers)
            this.isSwitchingServers = true;
            this.log(`Switching servers to ${region} ${identifier}`);
            await this.disconnect();
            console.log("Finished disconnecting")
            this.character = await common.startCharacter(this, region, identifier)
            await this.run(this.party, this.discord, this.AL, this.isLeader);
            this.isSwitchingServers = false;
        }catch(error){
            this.log(`Error switching servers ${error}`)
            this.isSwitchingServers = false;
        }
    }

    checkPartyPresence(party){
        return party.map((member) => {
            if(member.character.map == this.character.map) return member
            return
        }).filter(Boolean)
    }
 
    checkBankFor(items){
        const bankData = this.party?.dataPool?.bankData
        if(!bankData) return {}
        delete bankData.gold
        const foundItems = Object.values(bankData).flat().reduce((itemArray, item) => {
            if(item && items.includes(item.name)) {
                itemArray[item.name] = (itemArray[item.name] || 0) + (item.q || 1)
            }
            return itemArray
        }, {})
        return foundItems
    }

}

export default Character;