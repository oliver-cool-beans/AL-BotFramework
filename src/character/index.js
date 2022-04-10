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
import bosses from "../scripts/bosses/index.js";

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
        this.serverRegion = "EU", 
        this.serverIdentifier = "PVP"
        this.itemsToSell = [{name: "hpbelt", level: 0}, {name: "hpamulet", level: 0}, {name: "vitscroll"}, {name: "mushroomstaff", level: 0}, {name: "stinger", level: 0}, {name: "ringsj", level: 0}, {name: "beewings"}, {name: "whiteegg"}, {name: "slimestaff", level: 0}, {name: "phelmet", level: 0}, {name: "gphelmet", level: 0}] // TODO put this in dynamic config accessable by discord
        this.specialMonsters = ["greenjr", "wabbit", "skeletor"]
        this.partyMonsters = []
        this.isSwitchingServers = false;
    }

    async start(AL) {
        if(!AL) return Promise.reject("Missing AL Client")
        this.log("Starting")
        this.AL = AL;
        this.character = this.character || await common.startCharacter(this, "EU", "PVP").catch(() => {});
        if(characterFunctions[this.characterClass]?.load) await characterFunctions[this.characterClass].load.apply(this).catch((error) => {
            this.log(`Error Loading class functions, ${error}`)
        })
        return Promise.resolve("OK");
    };

    async run(party, discord, AL, isLeader){

        if(discord) this.discord = discord;
        if(party) this.party = party;
        this.isLeader = isLeader;
        
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
            this.lootLoop(); // Loots chests  
            this.findSpecialMonsterLoop(); // Check for special monsters and attack them
            this.checkEventBossesLoop(); // Check for boss events
            this.monsterHuntLoop(); // Check for monster hunts
            this.defenceLoop(); // Defensive actions like scare
        }

        this.adminLoop(); // Resurrect if we need to
        this.sellLoop(); // Sell junk when we can
        this.randomEmotionLoop(); // Just random emotions for fun
        this.logLoop();
        
        if(characterFunctions[this.characterClass]?.loop) await characterFunctions[this.characterClass].loop.apply(this).catch((error) => this.log(`ERROR: ${error}`))
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
        this.log("Existing Run... this bot is now stopped")
        return Promise.resolve("OK")
    }

    log(log, labels){
        this.logger.info(log, {
            ...labels, 
            character: this.name
        })
    }

    async logLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 5000));
            if(!this.character) continue;
            this.log(`DATA: ${JSON.stringify({
                tasks: this.tasks, 
                hp: this.character.hp, 
                mp: this.character.mp, 
                ready: this.character.ready,
                disconnected: this.character.disconnected,
                targetName: this.character.target && this.character.target.type,
                targetId: this.character.target && this.character.target.id,
                monsterHunt: this.character.s?.monsterhunt
            })}`)
        }
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
        this.disconnect();
        this.log("Disconnected, waiting 5 seconds then reconnecting")
        await this.start(this.AL)
        await this.run(this.party, this.discord, this.AL, this.isLeader);
    }

    async disconnect(){
        if(!this.character) return "Character not connected";
        this.isRunning = false;
        this.character.disconnect();
        this.character = false;
        await new Promise(resolve => setTimeout(resolve, 5000));
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

    async potionLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 2000));
            if(!this.character) continue
            if(!Object.keys(this.character.c).length) await utils.usePotionIfLow(this);
        }
    }

    // Sell junk when we can.
    async sellLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 200));
            if(!this.character) continue
            if(this.character.canSell()){
                const itemsToSell = this.character.items.map((item, index) => {
                    if(!item) return
                    if(this.itemsToSell.find((listItem) => listItem.name == item.name && listItem.level == item.level) ){
                        return {...item, index: index}
                    } 
                }).filter(Boolean);
                for(var item in itemsToSell){
                    await this.character.sell(itemsToSell[item].index).catch((error) => {
                        this.log(`${this.name} errored selling item ${itemsToSell[item].name} ${JSON.stringify(error)}`)
                    });
                }
            }
        }
    }

    async adminLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue
            if(!this.character.party && !this.isLeader && this.leader && !this.sentPartyRequest) {
                this.log(`Sending party request to, ${this.leader.name}`)
                await this.character.sendPartyRequest(this.leader.name);
                this.sentPartyRequest = true;
            }
            if(this.character.map == "jail") {
                await this.character.leaveMap().catch((error) => this.log(`JAIL PORT ERRORED ${JSON.stringify(error)}`));
            }
            if(this.character.rip) {
                this.character.target = null
                await this.character.respawn().catch(() => {});
            }

            if(!this.character.ready || !this.character.socket || this.character.disconnected){
                this.log(`Has no socket or is not ready or is disconnected, reconnecting...`);
                await this.reconnect();
                continue;
            }

            if(this.character.esize <= 0 && this.character.ctype !== "merchant") {
                const {hpot, mpot} = this.calculatePotionItems();
                this.addTask({
                    script: "bankItems", 
                    user: this.name, 
                    priority: 1,
                    force: true,
                    args: {
                        itemsToHold: [hpot, mpot, "tracker"].concat(this.itemsToHold), 
                        goldToHold: 100000,
                        nextPosition: {x: this.character.x, y: this.character.y, map: this.character.map}
                    }
                })
            }

            if(this.character.gold < 100000 && this.character.ctype !== "merchant"){
                this.addTask({
                    script: "withdrawGold", 
                    user: this.name, 
                    priority: 1, 
                    args: {
                        goldToHold: 100000, 
                        nextPosition: {x: this.character.x, y: this.character.y, map: this.character.map}
                    }
                })
            }
        }

    }
    
    async defenceLoop(){
        while(this.isRunning && this.character){
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue
            // Get anyone attacking me who's we're not prepared to fight
            const attackingMe = this.character.getEntities({targetingMe: true})?.find((target) => {
                return target.id !== this.character.target 
                && this.AL.Tools.distance(this.character, target) <= this.character.range
                && !scripts[target.type]
            });
            const isLowHp = (this.character.hp / this.character.max_hp) * 100 <= 30 ? true : false; 
            if(attackingMe || isLowHp){
                await this.character.scare().catch(() => {})
            }
        }
    }

    async attackLoop(){
        while(this.isRunning && this.character){ 
            await new Promise(resolve => setTimeout(resolve, 50));
            if(!this.character) continue
            if(!this.character.target){
              //  console.log("Character has no target", this.character.target)
                continue;
            }
            
            const attackingMe = this.character.getEntities({targetingMe: true})?.find((target) => {
                return target.id !== this.character.target 
                && this.AL.Tools.distance(this.character, target) <= this.character.range
                && scripts[target.type]
            });

            const targetData = attackingMe || this.character.getTargetEntity()
            if(this.strategies?.attack?.[targetData?.type]){
                try{
                    await this.strategies.attack[targetData.type](this, this.party.members, targetData)
                    continue
                }catch(error){
                    this.log(`Failed to run attack strategy ${JSON.stringify(error)}`)
                }
            }
            if(this.character.canUse("attack")){
                this.party.energizeMember(this);
                await this.character.basicAttack(targetData?.id).catch(async (error) => {});
            }
        }
    }

    async moveLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 500));
            if(!this.character) continue

            if(!this.character.target){
                continue;
            }

            const targetData = this.character.getTargetEntity()
            || this.party.members.find((member) => member?.character?.target == this.character?.target && member?.character?.getTargetEntity())?.character.getTargetEntity();
            // If we can't find the target, check if someone in our party has it
        
            if(Object.keys(this.character.c).length) continue
            if(this.strategies?.move?.[targetData?.type]){
                await this.strategies.move[targetData?.type](this, this.party.members).catch((error) => {
                    this.log(`Failed to run move strategy ${JSON.stringify(error)}`)
                })
                continue
            }

            // If we're out of range, move to the target
            if(this.AL.Tools.distance(this.character, targetData) > this.character.range && !this.#tasks[0]?.force && !this.character.moving){
                await this.character.smartMove(targetData, { getWithin: this.attackRange || this.character.range / 2, useBlink: true }).catch(() => {});
            }
        }
    }

    async buyPotionLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue

            const {hpot, mpot} = this.calculatePotionItems();
            const hpotCount = this.character?.countItem(hpot);
            const mpotCount = this.character?.countItem(mpot);
            if(hpotCount < 200) {
                if(this.character && this.character.canBuy(hpot)){
                    await this.character.buy(hpot, 200 - hpotCount).catch(() => {})
                }
            }
            if(mpotCount < 200) {
                if(this.character && this.character.canBuy(mpot)){
                    await this.character.buy(mpot, 200 - mpotCount).catch(() => {})
                }
            
            }
            
            if(!this.character?.canBuy(hpot) || !this.character?.canBuy(mpot)){
                await utils.checkIfPotionsLow(this, 20) && this.addTask({
                    script: "buyPotions", 
                    user: this.name, 
                    priority: 5,
                    force: true,
                    args: {
                        nextPosition: {x: this.character.x, y: this.character.y, map: this.character.map}, 
                        amount: 200
                    }
                });
            }
        }
    }

    async lootLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue

            if(this.character.chests.size){
                for(let [key, value] of this.character.chests){
                    this.character && await this.character.openChest(key).catch((error) => {console.log("Failed to loot", error)});
                }
            }
        }
    }

    async findSpecialMonsterLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue
            [...this.character.entities.values()].forEach((entity) => {
                if(!this.specialMonsters.includes(entity.type)) return
                if(entity.target && !this.party.members.find((member) => entity.target == member.name)) return // If it has a target, and it's our party
                this.party.members.forEach((member) => {
                    if(!member.specialMonsters.includes(entity.type)) return
                    if(member.getTasks().find((task) => ["specialMonster", entity.type].includes(task.script) && task.args?.entity?.id == entity.id)) return;
                    const monsterScript = scripts[entity.type] || "specialMonster"
                    member.addTask({
                        script: monsterScript, 
                        user: this.name, 
                        priority: 5,
                        args: {
                            target: entity
                        }, 
                    })
                })

            })
        }
    }

    async randomEmotionLoop(){
        const validEmotions = Object.keys(this.character.emx);
        if(!validEmotions.length) return;
        while(this.isRunning && this.character){
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue;
            const emotionIndex = Math.floor(Math.random() * validEmotions.length)
            this.character.socket.emit("emotion",{name: validEmotions[emotionIndex]})
        }
    }

    async checkEventBossesLoop(){
        while(this.isRunning && this.character){
            await new Promise(resolve => setTimeout(resolve, 5000));
            if(!this.character) continue

            // Load from local data
            this.log(`Checking Boss Mobs: ${JSON.stringify(this.character.S)}`)
            Object.entries(this.character.S).forEach(([event, data]) => {
                if(!data.live || !bosses[event] || !data.target) return;
                if(this.#tasks.find((task) => task.script == event && task.args.serverIdentifier == this.character.serverData.name && task.args.serverRegion == this.character.serverData.region)){
                    return
                }
                this.log(`Adding event`);
                this.addTask({
                    script: event, 
                    user: this.name, 
                    priority: 3,
                    args: {
                        event: data, 
                        serverRegion: this.character.serverData.region, 
                        serverIdentifier: this.character.serverData.name
                    }
                })
            });

            // Now load from external data
            if(this.party.dataPool.aldata){
                this.party.dataPool.aldata.forEach((event) => {
                    if(!bosses[event.type] || (!event.target && !this.specialMonsters.includes(event.type)) || !event.map) return;
                    if(this.#tasks.find((task) => task.script == event.type && task.args.serverIdentifier == event.serverIdentifier && task.args.serverRegion == event.serverRegion)){
                        return
                    }
                    this.log(`Adding inter-server event for ${event.type}`)
                    this.addTask({
                        script: event.type, 
                        user: this.name,
                        priority: 3, 
                        args: {
                            event: event, 
                            serverRegion: event.serverRegion, 
                            serverIdentifier: event.serverIdentifier
                        }
                        
                    })
                    
                })
            }
        }
    }

    async switchServer(region, identifier){
        try{
            if(region == this.serverRegion && identifier == this.identifier) return false;
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

    async monsterHuntLoop(){
        while(this.isRunning){ 
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.character) continue
            if(!this.character.s?.monsterhunt && !this.#tasks.find((task) => task.script == "getMonsterHunt")){
                this.addTask({
                    script: "getMonsterHunt", 
                    user: this.name
                })
                continue
            }
            if(this.character.s?.monsterhunt?.c == 0 && !this.#tasks.find((task) => task.script == "finishMonsterHunt")){
                this.addTask({
                    script : "finishMonsterHunt", 
                    user: this.name, 
                    priority: 80
                })
                continue
            }
            if(scripts[this.character.s?.monsterhunt?.id]){ // If we've got a script for this monster
                this.addTask({
                    script: "monsterHunt", 
                    user: this.name, 
                    priority: 80
                })
            }
        }
    }

    checkPartyPresence(party){
        return party.map((member) => {
            if(member.character.map == this.character.map) return member
            return
        }).filter(Boolean)
    }
    
}
export default Character;