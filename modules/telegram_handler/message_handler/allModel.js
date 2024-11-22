const { settings } = require("../../configs");
const { sleep } = require("../../utils");

function listAllModel(bot){
    bot.onText(/^\/allmodel/, async (msg) => {
    const chatId = msg.chat.id;
    const ourModel = settings.openAI.gptModel.map((element, index) => {
        return `${index + 1}. ${element}: ${settings.openAI.gptDescription[index]}`;
    });
    await bot.sendMessage(chatId, "[ MODE GPT ]\n" + ourModel.join("\n"));
    });
}

module.exports = listAllModel;