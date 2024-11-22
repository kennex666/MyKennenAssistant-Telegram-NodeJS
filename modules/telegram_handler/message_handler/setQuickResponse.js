const { settings, setQResponse } = require("../../configs");

function setQuickResponse(bot) {
  bot.onText(/^\/quickresponse /, async (msg) => {
    const chatId = msg.chat.id;
    let userInput = msg.text.replace("/quickresponse ", "");
    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }
    let typeingUntilSend = setInterval(() => {
      bot.sendChatAction(chatId, "typing");
    }, 3000);

    if (userInput == "on") {
      setQResponse(true);
      await bot.sendMessage(chatId, "Đã bật phản hồi nhanh!");
    } else {
      setQResponse(false);
      await bot.sendMessage(chatId, "Đã tắt phản hồi nhanh!");
    }
    clearInterval(typeingUntilSend);
  });
}

module.exports = setQuickResponse;