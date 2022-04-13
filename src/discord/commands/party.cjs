
function create(scriptChoices, partyNames){
    return  {
        name: 'party',
        description: 'Run commands for main party',
        options: [
          {
            name: "name", 
            description: "The name of the party", 
            type: 3, 
            choices: partyNames,
            required: true
          },
          {
            name: "run", 
            description: "Run a script by name", 
            type: 3, 
            required: false,
            choices: scriptChoices.slice(0, 24) // Discord only allows 25
          },
          {
            name: "disconnect", 
            description: "Disconnect a party", 
            type: 3, 
            required: false, 
            choices: [{name: "all", value: "all"}]

          },
          {
            name: "login", 
            description: "Login and start a party", 
            type: 3, 
            required: false, 
            choices: [{name: "all", value: "all"}]
          }
        ]
      }
}

async function run (AL, interaction, characters, party, discord) {
    const partyName = interaction.options.get("name")?.value;
    if(!partyName) return await interaction.editReply({ephemeral: true, content: "Invalid Command"});

    const options = interaction.options['_hoistedOptions'].reduce((obj, opt) => {
        return {...obj, [opt.name]: opt.value} 
    }, {});

    if(options.disconnect) await disconnect(party);
    if(options.login) await login(partyName, party, discord, AL);
    if(options.run) await script(options.run, party);

    return interaction.editReply({ephemeral: true, content: `Finished running tasks ${interaction.options['_hoistedOptions'].map((opt) => opt.name)}`})
}

async function script(scriptName, party) {
  return await Promise.all(party.members.map(async (member) => {
    return await member.setScript(scriptName);
  }))
}

async function login(partyName, party, discord, AL){
  party.disconnect();
  await new Promise(resolve => setTimeout(resolve, 1000));
  party.members = [];
  party.config[partyName].forEach((member) => {
      party.addMember(member);
      
  });
  party.start(party, discord, AL);
  return Promise.resolve("OK");
}

async function disconnect(party){
  party.members.forEach((member) => {
    member.disconnect();
  })
  return Promise.resolve("OK");
}

module.exports = {create, run}
