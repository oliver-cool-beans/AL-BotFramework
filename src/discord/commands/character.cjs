
function create(scriptChoices, characterNames) {
    return  {
        name: 'character', 
        description: 'Commands on a specific character', 
        options: [
          {
            name: 'name', 
            description: 'The character to send from',
            type: 3, 
            choices: characterNames,
            required: true
          }, 
          {
            name: 'script', 
            description: 'The script to run',
            type: 3, 
            choices: scriptChoices,
            required: false
          }, 
          {
            name: "disconnect", 
            description: "Disconnect a character", 
            type: 3, 
            required: false, 
            choices: [{name: "true", value: "true"}]

          },
          {
            name: "login", 
            description: "Login and start a character", 
            type: 3, 
            required: false, 
            choices: [{name: "true", value: "true"}]
          }
        ]
      };
}

async function run(AL, interaction, characters, party, discord) {
    const name = interaction.options.get('name');
    
    if(!name || !script) return interaction.editReply({ephemeral: true, content: `Missing name or script`})
    const character = characters.find((char) => char.name == name.value);
    if(!character) return interaction.editReply({ephemeral: true, content: `Character ${name.value} not found`});

    const options = interaction.options['_hoistedOptions'].reduce((obj, opt) => {
      return {...obj, [opt.name]: opt.value} 
  }, {});

    if(options.disconnect) await disconnect(character);
    if(options.login) await login(character, discord, AL, party);
    if(options.script) await script(options.script, character);
    if(options.run) await script(options.run);

    return interaction.editReply({ephemeral: true, content: `Finished running tasks  ${interaction.options['_hoistedOptions'].map((opt) => opt.name)}`})
}

async function script(scriptName, character){
  return  await character.setScript(scriptName);
}

async function login(character, discord, AL, party){
  character.run(party, discord, AL)
  return Promise.resolve("OK")
}

async function disconnect(character){
  character.disconnect();
  return Promise.resolve("OK")
}

module.exports = {create, run};