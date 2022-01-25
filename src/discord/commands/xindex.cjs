async function run (AL, interaction, party, discord) {
    const {value} = interaction.options.get('run');
    await interaction.reply(`Setting party scripts to ${value}. Members: ${party.length + 1}`)
    return await Promise.all(party.map(async (member) => {
        await member.setScript(value);
        return await interaction.followUp(`Script set on character ${member.name}`)
      }))
}

async function disconnect (AL, interaction, party, discord) {
    const {value} = interaction.options.get('disconnect');
    if(value == "all") {
        await interaction.reply(`Disconnecting all ${party.length + 1} characters`);
        return await Promise.all(party.map(async (char) => {
            await interaction.followUp(`Logging in character ${char.name}`);
            char.isRunning && char.disconnect();
            return Promise.resolve("OK")

        }))
    }

    await interaction.reply(`Disconnecting character ${value}.`)
    const character = party.filter((member) => member.name == value)?.[0];
    if(!character) return interaction.reply(`Character ${value}, is not a member of the party`);
    return Promise.resolve(character.disconnect())
}

async function login (AL, interaction, party, characters, discord) {
    const {value} = interaction.options.get('login');

    if(party.config?.[value]){
        await interaction.reply(`Logging in whole party ${value}`);
     //   await party.disconnect();
        return await Promise.all(party.members.map(async (char) => {
            await interaction.followUp(`Logging in character ${char.name}`);
            char.run(party, discord, AL);
            return Promise.resolve("OK")
        }))
    }

    await interaction.reply(`Logging in character ${value}.`)
    const character = party.allCharacters.find((member) => member.name == value)
    if(!character) return interaction.followUp(`Character ${value}, is not a member of the party`);
    character.run(party, discord, AL);
    return Promise.resolve("Started");
}

async function merchantRun(AL, interaction, party, discord) {
    const merchant = party.filter((member) => member.characterClass == 'merchant')?.[0];
    if(!merchant) return;

    await interaction.reply(`Logging in and starting merchant, ${merchant.name}`);
    await merchant.run(party).catch(async (error) => {
        console.log(error)
        await interaction.followUp(`Error running merchant tasks ${error}`);
    });
    return await interaction.followUp(`Completed and disconnected ${merchant.name}`);

}

async function whisper(AL, interaction, party, discord) {
    await interaction.reply("Whispering...");
    const params = interaction.options['_hoistedOptions'].reduce((obj, option) => {
        return {...obj, [option.name]: option.value}
    }, {});
    
    const character = party.find((member) => member.name == params.from);
    if(!character) return await interaction.followUp("Could not find logged in character");
    try{
        await character.sendPrivateMessage(params.to, params.message).catch(() => {
            throw Error
        })
        return await interaction.followUp(`Message Sent to ${params.to}:\n ${params.message}`);
    }catch(error){
        return await interaction.followUp(`Error sending message to ${params.to}`);
    }
}


async function say(AL, interaction, party, discord) {
    await interaction.reply("Saying...");
    const params = interaction.options['_hoistedOptions'].reduce((obj, option) => {
        return {...obj, [option.name]: option.value}
    }, {});

    const character = party.find((member) => member.name == params.from);
    if(!character) return await interaction.followUp("Could not find logged in character");
    try{
        await character.sendPublicMessage(params.message).catch(() => {
            throw Error
        })
        return await interaction.followUp(`Message Sent to chat\n ${params.message}`);
    }catch(error){
        return await interaction.followUp(`Error sending message`);
    }
    
}

module.exports = {
    party: {
        run: run,
        disconnect: disconnect,
        login: login
    }, 
    merchant: {
        run: merchantRun
    }, 
    whisper: whisper, 
    say: say
}