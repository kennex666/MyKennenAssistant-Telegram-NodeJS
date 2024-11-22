const { settings, setGPTModel } = require("../../configs");

function setAccessCalendar(bot) {
  /* Calendar access */
  bot.onText(/^\/calendar /, async (msg) => {
    const chatId = msg.chat.id;
    let userInput = msg.text.replace("/calendar ", "");
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
      setAccessCalendar(true);
      await bot.sendMessage(chatId, "Đã cấp quyền truy cập lịch!");
    } else {
      setAccessCalendar(false);
      await bot.sendMessage(chatId, "Đã thu hồi quyền truy cập lịch!");
    }
    
    clearInterval(typeingUntilSend);
  });
}

module.exports = setAccessCalendar;
