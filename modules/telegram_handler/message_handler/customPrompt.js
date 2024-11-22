const fs = require("fs");
const { settings, setPromptCustom } = require("../../configs");

function setPrompt(bot) {
  bot.onText(/^\/prompt /, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }

    let data = msg.text.replace("/prompt ", "").trim();
    
    setPromptCustom(data);

    // fs.writeFileSync(getPromptFileName(chatId), JSON.stringify(
    //     prompt
    // ));

    await bot.sendMessage(
      chatId,
      `Prompt đã được cài đặt thành công:

  ${settings.gptSettings.isCustomPrompt ? settings.gptSettings.promptCustom : settings.gptSettings.currentPromptID}`
    )
  });
}

module.exports = setPrompt;
