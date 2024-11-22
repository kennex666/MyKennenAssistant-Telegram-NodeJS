const { settings } = require("../../configs");
const { loadOldConversation } = require("../../file_worker");

function loadConversation(bot) {
    bot.onText(/^\/load/, async (msg) => {
      const chatId = msg.chat.id;
      if (chatId != settings.ownerId) {
        bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
        bot.sendMessage(
          settings.ownerId,
          "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
        );
        return false;
      }
      bot.sendMessage(chatId, await loadOldConversation(chatId));
    });
}

module.exports = loadConversation;