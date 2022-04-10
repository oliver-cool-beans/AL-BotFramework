/*
    A class responsible for adding and removing members from the party
*/

import DataPool from "./dataPool.js";

class Party {
    constructor(characters, partyConfig = {}){
        this.members = [];
        this.allCharacters = characters;
        this.config = partyConfig
        this.dataPool = new DataPool(characters);
    }

    energizeMember(bot){
        try{
            const mageInRange = this.members.find((member) => member.character && member.character.ctype == "mage" && bot.AL.Tools.distance(bot.character, member.character) < 1000 && member.character.canUse("energize"))
            if(!mageInRange) return;
            if(mageInRange.character.canUse("energize") && mageInRange?.character?.id){
                const energyToGive = bot.character.max_mp - bot.character.mp
                mageInRange.character.energize(bot.character?.id, energyToGive).catch((error) => {
                })
                return
            }
        }catch(error){
            console.log("Failed to party energize", error)
        }

    }

    getTank() {
        // TODO make this smarter, check for shields or armor value/hp as well as class
        const tank = this.members.find((member) => member.character.ctype == "warrior");
        return tank?.name || null
    }
    addMember(characterName) {
        const character = this.allCharacters.find((char) => characterName == char.name)
        if(!this.members.find((char) => characterName == char.name) && character){
            this.members.push(character);
        }
        return
    }

    removeMember(characterName){
        this.members = this.members.filter((member) => member.name != characterName)
        return
    }

    disconnect(){
        this.members.forEach((char) => {
            console.log("Disconnecting", char.name)
            char.disconnect()
        })
    }
    
    start(party, discord, AL){
        this.members.forEach((member, index) => {
            member.run(party, discord, AL, !index);
        })
        return
    }

}
export default Party;