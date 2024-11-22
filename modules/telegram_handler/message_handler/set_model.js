const { getGPTSettings, settings, setGPTModel } = require("../../configs");

function setModel(bot) {
  bot.onText(/^\/setmodel (\d+)$/, async (msg) => {
    const chatId = msg.chat.id;

    let model = msg.text.replace("/setmodel ", "") - 0;
    if (settings.openAI.gptModel.length - 1 >= model) {
      bot.sendMessage(
        chatId,
        `Current model: ${getGPTSettings().modelGPTCurrent}\nChange into ${
          settings.openAI.gptModel[model]
        }`
      );
      setGPTModel(model);
    } else {
      bot.sendMessage(chatId, `No model found!`);
    }
  });
}

module.exports = setModel;