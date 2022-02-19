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
        this.target = null;
        this.merchant = null;
        this.notificationBuffer = [];
        this.serverRegion = "ASIA", 
        this.serverIdentifier = "I"
        this.itemsToSell = [{name: "hpbelt", level: 0}, {name: "hpamulet", level: 0}, {name: "vitscroll"}, {name: "mushroomstaff", level: 0}] // TODO put this in dynamic config accessable by discord
        this.specialMonsters = ["goldenbat", "cutebee", "skeletor", "mvampire"]
        this.partyMonsters = []
    }

    async start(AL) {
        if(!AL) return Promise.reject("Missing AL Client")
        this.log("Starting")
        this.AL = AL;
        this.character = this.character || await common.startCharacter(this, "ASIA", "I").catch(() => {});
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
            this.sellLoop(); // Sell junk when we can
            this.findSpecialMonsterLoop(); // Check for special monsters and attack them
            this.checkEventBossesLoop(); // Check for boss events
            this.monsterHuntLoop(); // Check for monster hunts
        }

        this.adminLoop(); // Resurrect if we need to
        if(characterFunctions[this.characterClass]?.loop) await characterFunctions[this.characterClass].loop.apply(this).catch((error) => this.log(`ERROR: ${error}`))
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 500)); 
            this.log(`DATA: ${JSON.stringify({
                tasks: this.tasks, 
                hp: this.character.hp, 
                mp: this.character.mp, 
                ready: this.character.ready,
                hasSocket: !!this.character.socket, 
                targetName: this.character.target?.name,
                botTargetName: this.character.target?.name, 
                monsterHunt: this.character.s?.monsterhunt
            })}`)

            if(!this.character.socket){
                this.log(`Has no socket, reconnecting...`);
                await this.reconnect();
                continue;
            }

            if(!this.character.socket || this.character.disconnected) return;
            if(this.#tasks.length){
                if(!await {...scripts, ...tasks}[this.#tasks[0].script]){
                    this.removeTask(this.#tasks[0].script);
                    continue
                }
                await {...scripts, ...tasks}[this.#tasks[0].script](this, party.members, this.merchant, this.#tasks[0].args).catch((error) => {
                    this.log(`task error with, ${error}`)
                    this.removeTask(this.#tasks[0].script)
                });
                continue;
            }

            try{
                await scripts[this.scriptName](this, party.members, this.merchant, this.scriptArgs)
            }catch(error){
                this.log(`${this.name} errored running script ${this.scriptName} error: ${JSON.stringify(error)}`)
            }
         
        }
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
        this.log(`Added Task ${task.script}`)
        return
    }

    getTasks(){
        return this.#tasks;
    }

    removeTask(name){
        this.#tasks = this.#tasks.filter((queue) => queue.script !== name); // This'll remove them all. May want to just remove first later
        this.log(`Removed Task: ${name} ${JSON.stringify(this.#tasks)}`)
        return;
    }

    async reconnect(){
        this.disconnect();
        return await common.startCharacter(this, "ASIA", "I");
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
            if(!Object.keys(this.character.c).length) await utils.usePotionIfLow(this);
        }
    }

    // Sell junk when we can.
    async sellLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 2000));
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
            await new Promise(resolve => setTimeout(resolve, 20000));
            if(!this.character.party && !this.isLeader && this.leader && !this.sentPartyRequest) {
                this.log(`Sending party request to, ${this.leader.name}`)
                await this.character.sendPartyRequest(this.leader.name);
                this.sentPartyRequest = true;
            }
            if(this.character.map == "jail") {
                this.log("PORTING OUT OF JAIL")
                await this.character.leaveMap().catch((error) => this.log(`JAIL PORT ERRORED ${JSON.stringify(error)}`));
            }
            if(this.character.rip) {
                this.target = null
                await this.character.respawn().catch(() => {});
            }

        }

    }

    async attackLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 500));
            if(!this.target || (this.character.type == "priest" && (this.character.max_hp * 0.7) >= this.character.hp )){
                await new Promise(resolve => setTimeout(resolve, 1500));
                continue;
            }
            if(this.character.canUse("attack")){
                await this.character.basicAttack(this.target?.id).catch(async (error) => {});
            }
        }
    }

    async moveLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 500));
            if(!this.target){
                continue;
            }
            if(this.strategies?.move?.[this.target.type]){
                await this.strategies.move[this.target.type](this, this.party.members).catch((error) => {
                    this.log(`Failed to run move strategy ${JSON.stringify(error)}`)
                })
                continue
            }
            // If we're out of range, move to the target
            if(this.AL.Tools.distance(this.character, this.target) > this.character.range && !this.#tasks[0]?.force && !this.character.moving){
                this.log(`Trying to move to, ${this.target?.id}, IS MOVING: ${this.character.moving}`)
                await this.character.smartMove(this.target, { getWithin: this.attackRange || this.character.range / 2 }).catch(() => {});
            }
        }
    }

    async buyPotionLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 1000));
            const {hpot, mpot} = this.calculatePotionItems();
            const hpotCount = this.character.countItem(hpot);
            const mpotCount = this.character.countItem(mpot);
            if(hpotCount < 200) {
                if(this.character.canBuy(hpot)){
                    await this.character.buy(hpot, 200 - hpotCount).catch(() => {})
                }
            }
        
            if(mpotCount < 200) {
                if(this.character.canBuy(mpot)){
                    await this.character.buy(mpot, 200 - mpotCount).catch(() => {})
                }
            
            }
        }
    }

    async findSpecialMonsterLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 4000));
            [...this.character.entities.values()].forEach((entity) => {
                if(!this.specialMonsters.includes(entity.type)) return
                if(entity.target && !this.party.members.find((member) => entity.target == member.name)) return // If it has a target, and it's our party
                this.party.members.forEach((member) => {
                    if(member.getTasks().find((task) => task.script == "specialMonster" && task.args?.entity?.id == entity.id)) return;
                    member.addTask({
                        script: "specialMonster", 
                        user: this.name, 
                        args: {
                            target: entity
                        }
                    })
                })

            })
        }
    }

    async checkEventBossesLoop(){
        while(this.character.socket && this.character.S){
            await new Promise(resolve => setTimeout(resolve, 20000));
            this.log(`Checking Boss Mobs: ${JSON.stringify(this.character.S)}`)
            Object.entries(this.character.S).forEach(([event, data]) => {
                if(!data.live || !bosses[event] || this.#tasks.find((task) => task.script == event) && data?.target) return;
                this.log(`Adding event ${JSON.stringify(event)}`);
                this.addTask({
                    script: event, 
                    user: this.name, 
                    args: {
                        event: data
                    }
                })
            })
        }
    }

    async switchServer(region, identifier){
        if(region == this.serverRegion && identifier == this.identifier) return false;
        this.log(`Switching servers to ${region} ${identifier}`);
        this.disconnect();
        return await common.startCharacter(this, region, identifier)
    }

    async monsterHuntLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 1000));
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
                    user: this.name
                })
                continue
            }
            if(scripts[this.character.s?.monsterhunt?.id]){ // If we've got a script for this monster
                this.addTask({
                    script: "monsterHunt", 
                    user: this.name
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