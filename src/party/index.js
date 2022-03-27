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