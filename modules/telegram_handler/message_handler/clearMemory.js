const { settings } = require("../../configs");
const { getConversationFileName, loadChatId } = require("../../file_worker");

const fs = require("fs");

function clearMemory(bot) {
  bot.onText(/^\/clear/, async (msg) => {
    const chatId = msg.chat.id;
    let loadChatBefore = await loadChatId(chatId);

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }
    loadChatBefore = [];
    try {
      fs.writeFileSync(getConversationFileName(chatId), JSON.stringify([]));
      bot.sendMessage(chatId, "Xoá dữ liệu thành công!");
    } catch (e) {
      bot.sendMessage(
        chatId,
        "Không thể xoá cuộc trò chuyện. Lỗi:\n" + e.message
      );
    }
  });
}

module.exports = clearMemory;