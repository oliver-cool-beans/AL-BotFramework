
function create(){
    return  {
        name: 'aldata',
        description: 'Run ALData Functions',
        options: [
          {
            name: "auth", 
            description: "Authentication scripts", 
            type: 3, 
            required: false,
            choices: [{name: "Send Auth via Mail", value: "send"}, {name: "Show Key", value: "show"}]
          }
        ]
      }
}

async function run (AL, interaction, characters, party, discord) {

  const options = interaction.options['_hoistedOptions'].reduce((obj, opt) => {
    return {...obj, [opt.name]: opt.value} 
  }, {});


  if(options.auth) return await auth(interaction, party);

  return Promise.resolve();
}

async function auth(interaction, party){

  const command = interaction.options.get("auth")?.value;

  if(command == "send") return await mailAuth(interaction, party);
  if(command == "show") return getAuth(interaction, party);

  return Promise.resolve();
}
//"5748859076083712"

function getAuth(interaction, party){
  const ALDataKey = party.dataPool.ALDataKey;
  return interaction.editReply({ephemeral: true, content: ALDataKey})
}

async function mailAuth(interaction, party){
  const memberWithGold = party.members.find((member) => member.character && member.character.gold > 48000) // 48000 gold required to mail
  if(!memberWithGold){
    interaction.editReply({ephemeral: true, content: `Cannot send mail, no party member with enough gold found`})
    return Promise.reject("No member with enough gold found");
  } 
  const ALDataKey = party.dataPool.ALDataKey;

  console.log("Member", memberWithGold.character.name, "Key", ALDataKey);
  
  try{
    await memberWithGold.character.sendMail("earthiverse", "aldata_auth", ALDataKey)
    return interaction.editReply({ephemeral: true, content: `Sent Authentication mail`})
  }catch(error){
    console.log("Failed to send mail with ALData auth", error)
    return interaction.editReply({ephemeral: true, content: `Failed to send authentication mail`})

  }
}

module.exports = {create, run}
