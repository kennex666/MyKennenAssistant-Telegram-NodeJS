const { accessSystem } = require("../../system_worker");
const { loadNewestMessageFromKennen } = require("../../file_worker");
const { cleanAndParseJson } = require("../../utils");

const fs = require("fs");
const { settings } = require("../../configs");

function getRecentlyCode(bot) {
  bot.onText(/^\/getrecentlycode/, async (msg) => {
    const chatId = msg.chat.id;

    if (chatId != settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        "Phát hiện người dùng " + chatId + " đã nhắn với Kennen: " + msg
      );
      return false;
    }

    let typeingUntilSend = setInterval(() => {
      bot.sendChatAction(chatId, "typing");
    }, 3000);

    let getResponseAI = await loadNewestMessageFromKennen(chatId);
    if (getResponseAI.match(/^(API_SYSTEM )/)) {
        let jsonData = cleanAndParseJson(getResponseAI);
        let resAI = await accessSystem(bot, chatId, jsonData);
        bot.sendMessage(chatId, `*Code: ${resAI.status}*\nĐang tải xuống file code của bạn...`, {
            parse_mode: "Markdown",
        });

        fs.writeFileSync("temp/code.js", resAI.javascript);
        const stream = fs.createReadStream("temp/code.js");
        bot.sendDocument(chatId, stream);
    } else {
      try {
        bot.sendMessage(chatId, getResponseAI, { parse_mode: "Markdown" });
      } catch (e) {
        bot.sendMessage(chatId, "Error response");
      }
    }
    clearInterval(typeingUntilSend);
  });
}

module.exports = { getRecentlyCode };
