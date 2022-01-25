// A script to create all the discord commands
const {character, say, party} = require("./commands/index.cjs");

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
      party.create(scriptChoices, partyNames)
    ]

    return commands

    return [
      {
        name: 'say', 
        description: 'Send message in public chat', 
        options: [
          {
            name: 'from', 
            description: 'The character to send from',
            type: 3, 
            choices: characterNames,
            required: true
          }, 
          {
            name: 'message', 
            description: 'The message to send',
            type: 3, 
            required: true
          }, 
        ]
      },
      {
        name: 'whisper', 
        description: 'Send a private message from a character to another player', 
        options: [
          {
            name: 'from', 
            description: 'The character to send from',
            type: 3, 
            choices: characterNames,
            required: true
          }, 
          {
            name: 'to', 
            description: 'The character to send to',
            type: 3, 
            required: true
          }, 
          {
            name: 'message', 
            description: 'The message to send',
            type: 3, 
            required: true
          }, 
        ]
      },
      {
        name: 'merchant', 
        description: 'merchant specific commands', 
        options: [
          {
            name: 'run',
            description: 'Run merchant tasks', 
            type: 1
          }
        ]
      },
      {
        name: 'character', 
        description: "Character commands",
        options : characterNames.map((character) => {
          return {
            name: character.name, 
            description: `Select character ${character.name}`, 
            type: 2, 
            options: [
              {
                name: "run", 
                description: "Run a script by name", 
                type: 1, 
                options: scriptChoices.map((script) => {
                  console.log(script)
                  return {name: script.name, description: `Run script: ${script.name}`, type: 3, required: true}
                })
              }
            ]
          }
        })
      },
    ]
  }