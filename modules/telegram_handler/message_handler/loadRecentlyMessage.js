const { accessSystem } = require("../../system_worker");
const { loadNewestMessageFromKennen } = require("../../file_worker");
const { cleanAndParseJson } = require("../../utils");

const fs = require("fs");
const { settings } = require("../../configs");

function recentlyLoad(bot) {
  bot.onText(/^\/repeat/, async (msg) => {
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
      bot.sendMessage(chatId, `*Code: ${resAI.status}*\n${resAI.message}`, {
        parse_mode: "Markdown",
      });

      // Nếu đang yêu cầu thực thi JS
      if (resAI.status == 203) {
        let userConfirm = false;

        setTimeout(() => {
          if (!userConfirm) {
            bot.sendMessage(
              chatId,
              "Đã hết thời gian xác nhận, hủy thực thi JS"
            );
            bot.removeTextListener(/\!c/);
            bot.removeTextListener(/\!r/);
            console.log("User rejected to execute JS");
          }
        }, 30000);

        bot.onText(/\!r/, async (msg) => {
          userConfirm = true;
          console.log("User rejected to execute JS");
          bot.removeTextListener(/\!c/);
          bot.removeTextListener(/\!r/);
          bot.sendMessage(chatId, "Đã hủy thực thi JS");
        });

        bot.onText(/\!c/, async (msg) => {
          userConfirm = true;
          console.log("User confirmed to execute JS");
          try {
            let startTime = new Date();
            resAI.resultJS = await eval(resAI.javascript);
            if (typeof resAI.resultJS == "object") {
              resAI.resultJS = JSON.stringify(resAI.resultJS);
            }
            let endTime = new Date();
            let runTimeMS = endTime - startTime;
            let returnUserResult =
              "Thực thi hoàn tất (" +
              runTimeMS +
              "ms): ```json\n" +
              resAI.resultJS +
              "```";
            if (returnUserResult.length <= 4096) {
              bot.sendMessage(chatId, returnUserResult, {
                parse_mode: "Markdown",
              });
            } else {
              // send file
              bot.sendMessage(
                chatId,
                "Kết quả hơi dài, tôi sẽ gửi file cho bạn nè",
                {
                  parse_mode: "Markdown",
                }
              );

              await fs.writeFileSync("temp/result.json", resAI.resultJS);
              const stream = fs.createReadStream("temp/result.json");
              bot.sendDocument(chatId, stream);
            }
          } catch (e) {
            resAI.resultJS = "Error: " + e;
            bot.sendMessage(
              chatId,
              "Lỗi: ```javascript\n" + resAI.resultJS + "```",
              { parse_mode: "Markdown" }
            );
          } finally {
            bot.removeTextListener(/\!c/);
            bot.removeTextListener(/\!r/);
          }
        });
      }
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

module.exports = { recentlyLoad };
