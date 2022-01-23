// A script to create all the discord commands

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

    const allPartiesAndNames = characterNames.concat(partyNames);

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
        name: 'party',
        description: 'Run commands for main party',
        options: [
          {
            name: "run", 
            description: "Run a script by name", 
            type: 3, 
            required: false,
            choices: scriptChoices
          },
          {
            name: "disconnect", 
            description: "Disconnect a character", 
            type: 3, 
            required: false,
            choices: allPartiesAndNames
          },
          {
            name: "login", 
            description: "Login and start a character", 
            type: 3, 
            required: false,
            choices: allPartiesAndNames
          }
        ]
      }
    ]
  }