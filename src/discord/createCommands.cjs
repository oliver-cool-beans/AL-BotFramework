// A script to create all the discord commands
const {character, say, party, aldata} = require("./commands/index.cjs");

module.exports = function createCommands (scripts, characters, partyConfig) {
    const scriptChoices = Object.keys(scripts)?.map((key) => {
      return {name: key, value: key}
    });
    
    const characterNames = characters.map((char) => {
      return {name: char.name, value: char.name }
    }).filter(Boolean);

    const partyNames = Object.keys(partyConfig).map((key) => {
      return {name: key, value: key}
    })

    const commands = [
      character.create(scriptChoices, characterNames), 
      say.create(scriptChoices, characterNames), 
      party.create(scriptChoices, partyNames), 
      aldata.create()
    ]

    return commands
  }