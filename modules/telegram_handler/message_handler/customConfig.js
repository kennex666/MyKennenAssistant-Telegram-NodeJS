const fs = require("fs");
const { settings, setPromptCustom, setConfigModel, getConfigModel } = require("../../configs");
const { configModel } = require("../../../constants/bot_prompt");

function customConfig(bot) {
  bot.onText(/^\/configm /, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }

    let data = msg.text.replace("/configm ", "");

    if (data == 0)
      setConfigModel(
        configModel.default
      );
    else if (data == 1)
      setConfigModel(
        configModel.coding
      );
    else {
      const config = data.split(" ");
      setConfigModel({
        temperature: config[0] ?? configModel.default.temperature,
        max_tokens: config[1] ?? configModel.default.max_tokens,
        top_p: config[2] ?? configModel.default.top_p,
        frequency_penalty: config[3] ?? configModel.default.frequency_penalty,
        presence_penalty: config[4] ?? configModel.default.presence_penalty,
      });
    }
    

    // fs.writeFileSync(getPromptFileName(chatId), JSON.stringify(
    //     prompt
    // ));

    await bot.sendMessage(
      chatId,
      `Config đã được cài đặt thành công:
      \`\`\`json
${
   JSON.stringify(getConfigModel(), null, 2)
}\`\`\``
    );
  });
}

module.exports = customConfig;
