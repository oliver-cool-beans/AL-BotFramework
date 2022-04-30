const bankingPosition = { map: "bank", x: 0, y: -200 };
import withdrawItemsFromBank from '../utils/withdrawItemsFromBank.js'

async function withdrawFromBank(bot, party, merchant, arg = {}, taskId) {
    console.log("Withdrawing from Bank ", bot.name)
    const {itemsToWithdraw} = args;
    await withdrawItemsFromBank(bot, itemsToWithdraw)

    bot.removeTask(taskId);
    return Promise.resolve("Finished")
}

export default withdrawFromBank