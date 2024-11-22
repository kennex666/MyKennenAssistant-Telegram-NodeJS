const {
  getGPTSettings,
  settings,
  getConfigModel,
  getExportFileMode,
} = require("../../configs");
const {
  isOn,
  getConversationFileName,
  getPromptFileName,
} = require("../../file_worker");

function querySettings(bot) {
  bot.onText(/^\/settings/, async (msg) => {
    console.log(getExportFileMode());
    const chatId = msg.chat.id;
    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }
    let str = `[ Cấu hình ]\n\n - Giới hạn khả năng nhớ: ${
      getGPTSettings().limitMemory
    } đoạn hội thoại\n - Cấp quyền truy cập lịch: ${isOn(
      settings.calendar.canAccess
    )}\n - ownerID: ${settings.ownerId}\n - Phản hồi nhanh: ${isOn(
      getGPTSettings().quickresponse
    )}\n - Lưu trữ trò chuyện: ${getConversationFileName(
      chatId
    )}\n - Model hiện tại: ${
      getGPTSettings().modelGPTCurrent
    }\n - Export mode: ${getExportFileMode()}
    \n - Config model: 
    ${JSON.stringify(getConfigModel(), null, 2)}
    \n - Prompt: ${settings.gptSettings.isCustomPrompt ? settings.gptSettings.promptCustom : settings.gptSettings.currentPromptID}
    \n - Generate nhiều hơn: ${settings.isLongerContent}
    \n - Phiên làm việc: ${global._session.id}\n - Phiên bản: ${
      global._VERSION.code
    }: ${global._VERSION.description}`;
    await bot.sendMessage(chatId, str);
  });
}

module.exports = querySettings;
