const { getConversationFileName, loadChatId } = require("../../file_worker");

const fs = require("fs");
const { deleteAllEventsFromFile } = require("../../system_worker");
const { settings } = require("../../configs");

function clearReminder(bot) {
  bot.onText(/^\/deletereminder/, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }
    try {
      deleteAllEventsFromFile();
      bot.sendMessage(chatId, "Xoá dữ liệu thành công!");
    } catch (e) {
      bot.sendMessage(
        chatId,
        "Không thể xoá cuộc trò chuyện. Lỗi:\n" + e.message
      );
    }
  });
}

module.exports = clearReminder;