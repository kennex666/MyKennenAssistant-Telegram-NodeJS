const { settings, setExportFileMode, getExportFileMode } = require("../../configs");

function exportFileModeHandler(bot) {
  bot.onText(/^\/export /, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }

    let data = msg.text.replace("/export ", "");

    setExportFileMode(data);

    // fs.writeFileSync(getPromptFileName(chatId), JSON.stringify(
    //     prompt
    // ));

    await bot.sendMessage(
      chatId,
      `Đã chỉnh sang chế độ export:

${getExportFileMode()}`
    );
  });
}

module.exports = exportFileModeHandler;
