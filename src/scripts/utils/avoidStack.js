async function avoidStack (bot, data) {

    if (data.id !== bot.character.id) return Promise.resolve("OK") // Not for us
    if (!data.stacked) return
    if (!data.stacked.includes(bot.character.id)) return Promise.resolve("OK") // We're not the ones that are stacked

    console.info(`Moving ${bot.character.id} to avoid stacking!`)

    const x = -25 + Math.round(50 * Math.random())
    const y = -25 + Math.round(50 * Math.random())
    return await bot.character.move(bot.character.x + x, bot.character.y + y).catch(() => { /* Suppress errors */ })
}

export default avoidStack;