
function create(scriptChoices, characterNames){
    return {
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
      }
}

async function run(AL, interaction, characters, party, discord) {
    const params = interaction.options['_hoistedOptions'].reduce((obj, option) => {
        return {...obj, [option.name]: option.value}
    }, {});

    const character = party.find((member) => member.name == params.from);
    if(!character) return await interaction.editReply({ephemeral: true, content: `Cannot find logged in character ${character}`})
    try{
        await character.sendPublicMessage(params.message).catch(() => {
            throw Error
        })
        return await interaction.editReply({ephemeral: true, content: `Message Sent to chat\n ${params.message}`})
    }catch(error){
        return await interaction.editReply({ephemeral: true, content: `Error sending message: ${error}`});
    }
    
}

module.exports = {create, run}
