export default async function randomEmotionLoop(bot){
    const validEmotions = Object.keys(bot.character.emx);
    if(!validEmotions.length) return;
    while(bot.isRunning && bot.character?.ready){
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loop(bot, validEmotions).catch((error) => console.log(bot.name, "Failed to run move loop", error))
    }
    console.log("Emotion loop has stopped ... ")
    return Promise.resolve("Finished")
}

async function loop(bot, emotions){
    if(!bot.character?.ready) return;
    const emotionIndex = Math.floor(Math.random() * emotions.length)
    bot.character.socket.emit("emotion",{name: emotions[emotionIndex]})
    return Promise.resolve("OK");
}