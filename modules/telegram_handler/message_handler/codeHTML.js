const { image_web_generator } = require("../../../constants/bot_prompt");
const { settings } = require("../../configs");
const { requestGPTVision } = require("../../gpt_worker");

const fileCoding = "./temp/gpt-4-turbo_{{id}}";

const fs = require("fs");

function codeHTMLWeb(bot) {
  /* Coding HTML screen */
  bot.onText(/^\/guiwebhtml /, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }

    let message = msg.text.replace("/guiwebhtml ", "");
    let typeingUntilSend = setInterval(() => {
      bot.sendChatAction(chatId, "typing");
    }, 3000);

    message = await bot.getFileLink(message);
    if (!message) {
      return;
    }
    bot.sendMessage(chatId, "Đang xử lý yêu cầu `Tạo giao diện Web HTML`...", {
      parse_mode: "Markdown",
    });
    let getResponseAI = await requestGPTVision(
      message,
      settings.openAI.gptModel[1],
      image_web_generator
    );

    try {
      fs.writeFileSync(
        fileCoding.replace("{{id}}", chatId) + ".html",
        getResponseAI
      );
      const stream = fs.createReadStream(
        fileCoding.replace("{{id}}", chatId) + ".html"
      );
      bot.sendDocument(chatId, stream);
    } catch (e) {
      bot.sendMessage(chatId, "Error response");
    }
    clearInterval(typeingUntilSend);
  });
}

module.exports = {codeHTMLWeb};