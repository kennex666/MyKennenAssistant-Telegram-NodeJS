const { settings } = require("../../configs");
const { requestGPTVision } = require("../../gpt_worker");

const fileCoding = "./temp/gpt-4-turbo_{{id}}";

const fs = require("fs");

function imageProcess(bot) {
  /* proccessing image with prompt */
  bot.onText(/^\/imagevision /, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }

    let message = msg.text.replace("/imagevision ", "");
    let typeingUntilSend = setInterval(() => {
      bot.sendChatAction(chatId, "typing");
    }, 3000);

    message = message.split(";");

    let object = {
      user: message[2],
      system: message[1] + "\nLuôn sử dụng markdown để phản hồi",
    };

    message = message[0].trim();
    message = await bot.getFileLink(message);
    if (!message) {
      return;
    }
    bot.sendMessage(chatId, `Đang xử lý yêu cầu \`${object["user"]}\`...`, {
      parse_mode: "Markdown",
    });
    let getResponseAI = await requestGPTVision(
      message,
      settings.openAI.gptModel[1],
      object
    );

    try {
      fs.writeFileSync(
        fileCoding.replace("{{id}}", chatId) + ".txt",
        getResponseAI
      );
      const stream = fs.createReadStream(
        fileCoding.replace("{{id}}", chatId) + ".txt"
      );
      bot.sendDocument(chatId, stream);
      if (getResponseAI.length < 4000)
        bot.sendMessage(chatId, getResponseAI, { parse_mode: "Markdown" });
      else bot.sendMessage(chatId, "Nội dung quá lớn, chuyển tiếp bằng File");
    } catch (e) {
      bot.sendMessage(chatId, "Error response");
    }
    clearInterval(typeingUntilSend);
  });
}

module.exports = {imageProcess};