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
import moment from 'moment';

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
    #serverChange = {}
    #serverCooldown = moment().utc().add(120, 'seconds');
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
        this.kitePositions = {};
        this.notificationBuffer = [];
        this.serverRegion = "EU", 
        this.serverIdentifier = "PVP"
        this.taskTimeouts = {};
        this.itemsToSell = [
            {name: "hpbelt", level: 0},  {name: "crabclaw"}, {name: "hpamulet", level: 0}, 
            {name: "vitscroll"}, {name: "mushroomstaff", level: 0}, {name: "stinger", level: 0}, 
            {name: "ringsj", level: 0}, {name: "beewings"}, {name: "whiteegg"}, {name: "slimestaff", level: 0}, 
            {name: "coat", level: 0},  
            {name: "pants", level: 0},  {name: "helmet", level: 0},  {name: "shoes", level: 0},  
            {name: "gloves", level: 0},  {name: "spores", qty: "all"},  {name: "leather"}, 
            {name: "hhelmet", level: 0},  {name: "hgloves", level: 0},  {name: "hpants", level: 0},
            {name: "harmor", level: 0}, {name: "hboots", level: 0}, 
            {name: "spear", level: 0},  {name: "gloves", level: 0},  
            {name: "gloves", level: 0},  {name: "rattail", qty: "all"},  {name: "ascale", qty: "all"},
            {name: "bfur", qty: "all"},{name: "eslippers", level: 0},
            {name: "dagger", level: 0},  {name: "sword", level: 0},  {name: "pmace", level: 0}, 
            {name: "throwingstars", level: 0}, {name: "tshirt0", level: 0}, {name: "tshirt1", level: 0},
            {name: "tshirt2", level: 0}, {name: "smoke", qty: "all"}, {name: "hammer", level: 0}, 
            {name: "gslime"}, {name: "sshield", level: 0}, {name: "epyjamas", level: 0},{name: "eears", level: 0},
             {name: "cscale", qty: "all"}, {name: "carrotsword", level: 0},
            {name: "spores", qty: "all"}, {name: "bwing", qty: "all"}, {name: "spores", qty: "all"},
            {name: "iceskates", level: 0}, {name: "xmace", level: 0}, {name: "carrot", aty: "all"}, {name: "snowball", qty: "all"}, 
            {name: "warmscarf", level: 0}, {name: "rednose", level: 0},
            {name: "cclaw", level: 0}, {name: "strearring", level: 0}, {name: "vitearring", level: 0}, {name: "dexearring", level: 0}, 
            {name: "sstinger", qty: "all"},  {name: "pleather", qty: "all"},  {name: "smush", qty: "all"},
            {name: "dstones", qty: "all"}, {name: "pstem", qty: "all"}, {name: "quiver", level: 0},  {name: "skullamulet", level: 0}, 
            {name: "dexring", level: 0},  {name: "strring", level: 0},  {name: "vitring", level: 0}, 
            {name: "dexbelt", level: 0},  {name: "strbelt", level: 0},  {name: "stramulet", level: 0},  {name: "dexamulet", level: 0}, 
            {name: "staffofthedead", level: 0},  {name: "bowofthedead", level: 0},  {name: "maceofthedead", level: 0},  {name: "spearofthedead", level: 0},
            {name: "pmaceofthedead", level: 0},  {name: "daggerofthedead", level: 0}, {name: "swifty", level: 0}
        ] 

        this.itemsToCraft = [
            "firestaff"
        ]

        this.itemsToExchange = [
            "gem0", 
            "gem1",
            "candy1",
            "candy0", 
            "seashell", 
            "armorbox", 
            "weaponbox", 
            "goldenegg", 
            "gemfragment",
            {name: "lostearring", level: 2}, 
            "troll", 
            "basketofeggs", 
            "candycane", 
            "mistletoe",
            "mysterybox"
        ]
        this.itemsToRecycle = [
            "fireblade"
        ]
        
        // TODO put this in dynamic config accessable by discord
        this.specialMonsters = ["greenjr", "jr", "wabbit", "skeletor", "mvampire", "snowman", "goldenbat", "phoenix"]
        this.partyMonsters = []
        this.isSwitchingServers = false;
        this.isConnecting = false;
        this.loops = [];
        this.elixirs = [];
    }

    async start(AL, region, identifier) {
        
        if(!AL) return Promise.reject("Missing AL Client")

        this.AL = AL;

        this.#serverCooldown = moment().utc().add(60, 'seconds');

        if(characterFunctions[this.characterClass]?.pre){
            console.log(this.name, "Running pre functions")
            await characterFunctions[this.characterClass].pre.apply(this).catch((error) => {})
        }

        if(!region) region = this.serverRegion;
        if(!identifier) identifier = this.serverIdentifier

        try{
            const startedCharacter = await common.startCharacter(this, region, identifier);
            if(startedCharacter) this.character = startedCharacter;
        }catch(error){
            console.log("***", this.name, "Has encountered an error while logging in", error, "***")
            if(error.indexOf("ingame") == -1) return Promise.resolve("ingame");
        }

        if(characterFunctions[this.characterClass]?.load) {
            console.log(this.name, "Running load functions")
                await characterFunctions[this.characterClass].load.apply(this).catch((error) => {
                this.log(`Error Loading class functions, ${error}`)
            });
        }

        console.log(this.name, "Finished starting")
        console.log(this.character?.ready, "Ready?", this.name)
        
        if(!this.character?.ready){
            console.log(this.name, "Attempting to connect not ready, waiting 10s ")
            await new Promise(resolve => setTimeout(resolve, 10000));  
            console.log("Finished waiting...")
            if(!this.character?.ready){
                console.log(this.name, "Attempting to connect still no socket, reconnecting ");
                await this.disconnect();
                await this.start(this.AL);
            } 
        }
        
        console.log("***", this.name, "Has started succesfully! ***")
        return Promise.resolve("OK");
    };

    async run(party, discord, AL, isLeader){

        if(discord) this.discord = discord;
        if(party && !this.party) this.party = party;
        this.isLeader = isLeader;

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
            loops.serverChangeLoop(this), // Controls all server switching
        ])

        
        if(characterFunctions[this.characterClass]?.loop) {
            await characterFunctions[this.characterClass].loop.apply(this).catch((error) => this.log(`ERROR: ${error}`))
        }

        this.loops.concat([this.mainLoop(discord, party)])
      
    }

    async mainLoop(discord, party){
        let currentTask = null;
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 50)); 
            
            //if we have some tasks, and the first task isn't in server change mode
            if(this.#tasks.length && this.#serverChange.taskId !== this.#tasks[0].id){
                currentTask = this.#tasks[0]
                if(!this.character || !this.character.ready || !this.character.serverData) continue;

                if(!await {...scripts, ...tasks}[this.#tasks[0]?.script]){
                    this.removeTask(this.#tasks[0]?.id);
                    continue
                }

                // Check if the task is on a different server
                if((currentTask.args.serverIdentifier !==  this.character.serverData.name) || (currentTask.args.serverRegion !==  this.character.serverData.region)){
                    this.queueServerChange(currentTask.args.serverRegion, currentTask.args.serverIdentifier, currentTask.id);
                    continue;
                }

                await {...scripts, ...tasks}[this.#tasks[0].script](this, party.members, this.merchant, this.#tasks[0].args, this.#tasks[0].id).catch((error) => {
                    this.log(`task ${this.#tasks[0]?.id} - ${this.#tasks[0].script} errored with, ${error}`)
                    this.removeTask(this.#tasks[0]?.id)
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
        if(!task?.script || !task?.id) return false;
        const now = moment().utc();
        if(this.taskTimeouts[task.id] && this.taskTimeouts[task.id] > now) return false;
        delete this.taskTimeouts[task.id];

        if(task.id && this.#tasks.find((queue) => queue.id == task.id)) return false;

        this.#tasks.push(task)
        this.#tasks = this.#tasks.sort((a, b) => (a.priority || 99) - (b.priority || 99))
        this.log(`${this.name} Added Task ${task.id} : ${task.script} First Task is now ${this.#tasks[0].script} at priority, ${this.#tasks[0].priority}`)
        return
    }

    getTasks(){
        return this.#tasks;
    }

    createTaskId(name, region, identifier){
        return Buffer.from(`${name}${region}${identifier}`, 'base64').toString('base64')
    }

    removeTask(taskId){
        const task = this.#tasks.find((queue) => queue?.id == taskId);
        this.#tasks = this.#tasks.filter((queue) => queue?.id !== taskId);

        this.log(`Removed Task: ${taskId}`)
        console.log("There are now", this.#tasks.length, "Tasks in the queue for", this.name);
        this.#tasks = this.#tasks.sort((a, b) => a.priority || 99 - b.priority || 99)

        if(task && task.script == "specialMonster"){
            this.taskTimeouts[task.id] = moment().utc().add(45, 'minutes');
        }
        return;
    }

    async reconnect(){
        await this.disconnect();
        this.log("Reconnecting -> Disconnected, waiting 5 seconds then reconnecting")
        try{
            await this.start(this.AL);
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

    queueServerChange(region, identifier, taskId){
        if(!region || !identifier) return false;
        if(!this.character.serverData.name == identifier && !this.character.serverData.region == region){
            return "Already on this server"
        }

        this.#serverChange = {region: region, identifier: identifier, taskId: taskId}
        return true
    }

    resetServerChange (){
        this.#serverChange = {}
    }

    getQueuedServer(){
        return this.#serverChange
    }

    // A function to prevent the rapid changing of servers
    canSwitchServers(){
        if(this.isSwitchingServers) return false;
        if(this.#serverCooldown && this.#serverCooldown > moment().utc()) return false
        if(!this.#serverChange.region || !this.#serverChange.identifier) return false
        return true;
    }
    
    async switchServer(region, identifier, retry = true){
        try{
            if(region == this.serverRegion && identifier == this.identifier) {
                this.resetServerChange();
                this.isSwitchingServers = false;
                return false;
            }
            this.isSwitchingServers = true;
            this.log(`Switching servers to ${region} ${identifier}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait one second to not interrupt looting

            await this.disconnect();
            await this.start(this.AL, region, identifier);
            await this.run(this.party, this.discord, this.AL, this.isLeader);
        }catch(error){
            this.log(`Error switching servers ${error}`)
            if(retry){
                this.log("Timing out for 10 seconds and retrying")
                await this.disconnect();
                await new Promise(resolve => setTimeout(resolve, 10000));
                await this.switchServer(region, identifier)
            }
        }
        this.isSwitchingServers = false;
        this.resetServerChange();
    }

    checkPartyPresence(party){
        return party.map((member) => {
            if(member.character.map == this.character.map) return member
            return
        }).filter(Boolean)
    }
 
    //TODO Add support for item levels
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

    isLowHp(){
        return(this.character.hp / this.character.max_hp) * 100 <= 30 ? true : false; 
    }

    isReadyToEngage(){
        if( (this.character.hp / this.character.max_hp ) * 100 <= 80 ) return false
        if( (this.character.mp / this.character.max_mp ) * 100 <= 30) return false;
        return true
    }
}

export default Character;