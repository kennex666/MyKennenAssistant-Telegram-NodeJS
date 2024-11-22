const { settings } = require("../../configs");

function queryJSONSettings(bot) {
  bot.onText(/^\/jsonsettings/, async (msg) => {
    const chatId = msg.chat.id;
    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }
    let str = "[ Cấu hình JSON ]\n\n```json\n" + JSON.stringify(settings, null, 2) + "\n```";
    await bot.sendMessage(chatId, str, { parse_mode: "Markdown" });
  });
}


module.exports = { queryJSONSettings};