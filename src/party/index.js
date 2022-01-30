/*
    A class responsible for adding and removing members from the party
*/

class Party {
    constructor(characters, partyConfig = {}){
        this.members = [];
        this.allCharacters = characters;
        this.config = partyConfig
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