const { sleep } = require("../../utils");

function stopBot(bot){
    bot.onText(/^\/stop/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Kennen is shutting down!");
    await sleep(3000);
    process.exit(0);
    });
}

module.exports = stopBot;