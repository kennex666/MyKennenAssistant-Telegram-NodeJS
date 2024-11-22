const { getGPTSettings, setMemory, settings } = require("../../configs");
const { getConversationFileName, loadChatId } = require("../../file_worker");
const fs = require("fs");

function setMemoryLimit(bot) {
  bot.onText(/^\/setlimit (\d{1,2})$/, async (msg, match) => {
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

    let oldLimit = getGPTSettings().limitMemory;
    setMemory(msg.text.replace("/setlimit ", "") - 0);
    if (getGPTSettings().limitMemory < 0) {
      await bot.sendMessage(
        chatId,
        "Giới hạn âm là một giới hạn vô lí. Thiết lập thất bại!"
      );
      return false;
    }
    if (loadChatBefore.length > getGPTSettings().limitMemory) {
      for (
        i = 0;
        i < loadChatBefore.length - getGPTSettings().limitMemory;
        i++
      ) {
        await loadChatBefore.shift();
      }
      await fs.writeFileSync(
        getConversationFileName(chatId),
        JSON.stringify(loadChatBefore)
      );
    }
    await bot.sendMessage(
      chatId,
      `Đã tạm thời thay đổi khả năng nhớ từ ${oldLimit} đoạn hội thoại thành ${
        getGPTSettings().limitMemory
      }`
    );
  });
}

module.exports = setMemoryLimit;