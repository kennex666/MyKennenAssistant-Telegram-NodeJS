const { configModel } = require("../../../constants/bot_prompt");
const { setConfigModel, setExportFileMode, setGPTModel, setPromptCustom } = require("../../configs");
const { convertDate } = require("../../system_worker");

function handleExternalCommand(bot) {
  bot.onText(/^\/codern$/, async (msg) => {
    const chatId = msg.chat.id;
    setConfigModel(configModel.coding);
    setPromptCustom(2);
    setExportFileMode("js");
    setGPTModel(1);

    await bot.sendMessage(chatId, "Đã chuyển sang chế độ code React Native!");
  });

  bot.onText(/^\/codeweb$/, async (msg) => {
    const chatId = msg.chat.id;
    setConfigModel(configModel.coding);
    setPromptCustom(1);
    setExportFileMode("html");
    setGPTModel(1);

    await bot.sendMessage(chatId, "Đã chuyển sang chế độ code web HTML!");
  });

  bot.onText(/^\/d$/, async (msg) => {
    const chatId = msg.chat.id;
    setConfigModel(configModel.default);
    setPromptCustom(0);
    setExportFileMode("text");
    setGPTModel(3);

    await bot.sendMessage(chatId, "Đã chuyển sang chế độ làm việc bình thường!");
  });



  bot.onText(/^\/test/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Currently working!");
  });

  bot.onText(/^\/session/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      `Phiên: ${global._session.id}\nTạo lúc: ${convertDate(
        global._session.createAt
      )}`
    );
  });
  bot.onText(/^\/version/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      `Version ${_VERSION.code}: ${_VERSION.description}`
    );
  });
  bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      "Xin chào! Trước khi bắt đầu, ID của bạn là " + chatId
    );
  });
}

module.exports = { handleExternalCommand };
