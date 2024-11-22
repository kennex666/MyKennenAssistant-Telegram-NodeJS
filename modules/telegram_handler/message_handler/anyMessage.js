const { accessSystem } = require("../../system_worker");
const {
  parseJSONTrans,
  loadChatId,
  getConversationFileName,
} = require("../../file_worker");
const { generateResponse, generateResponseChatCompletion } = require("../../gpt_worker");
const { sleep, cleanAndParseJson, createObject, sendFile } = require("../../utils");
const fs = require("fs");
const {
  getGPTSettings,
  settings,
  getExportFileMode,
} = require("../../configs");

function sendMessageWithMarkdown(bot, chatId, text) {
  bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

function removeListeners(bot, patterns) {
  patterns.forEach((pattern) => bot.removeTextListener(pattern));
}

async function handleJavaScriptExecution(bot, chatId, resAI, resultJS) {
  const startTime = new Date();
  resAI.resultJS = await eval(resAI.javascript);
  resAI.resultJS =
    typeof resAI.resultJS === "object"
      ? JSON.stringify(resAI.resultJS)
      : resAI.resultJS;

  const runTimeMS = new Date() - startTime;
  const userResponse = `Thực thi hoàn tất (${runTimeMS}ms): \`\`\`json\n${resAI.resultJS}\n\`\`\`\n\nBạn muốn lưu kết quả này vào bộ nhớ không? Gõ \`!s\` để lưu, \`!rs\` để bỏ qua`;

  // Ask to save to memory
  const responseMessage =
    userResponse.length <= 4096
      ? userResponse
      : "Kết quả hơi dài, tôi sẽ gửi file cho bạn nè.\n\nBạn muốn lưu kết quả này vào bộ nhớ không? Gõ `!s` để lưu, `!rs` để bỏ qua";

  if (userResponse.length > 4096) {
    sendFile({
      filename: "./temp/result_{{id}}.json",
      chatId,
      bot,
      content: resAI.resultJS,
    })
  } else {
    sendMessageWithMarkdown(bot, chatId, responseMessage);
  }
}

async function saveResponseToMemory(bot, chatId, resAI) {
  let loadChatBefore = await loadChatId(chatId);

  if (loadChatBefore.length > getGPTSettings().limitMemory) {
    loadChatBefore.shift();
  }

  loadChatBefore.push(createObject("system", resAI.data));
  fs.writeFileSync(
    getConversationFileName(chatId),
    JSON.stringify(loadChatBefore)
  );
}

function handleUserConfirmation(bot, chatId, resAI) {
  let userConfirmed = false;
  let userAddedToSystem = false;

  const confirmExecution = async () => {
    userConfirmed = true;
    console.log("User confirmed to execute JS");
    removeListeners(bot, [/^\!c$/, /^\!r$/]);

    try {
      await handleJavaScriptExecution(bot, chatId, resAI);
    } catch (e) {
      resAI.resultJS = "Error: " + e;
      sendMessageWithMarkdown(
        bot,
        chatId,
        "Lỗi: ```javascript\n" + resAI.resultJS + "```"
      );
    }
  };

  const rejectExecution = () => {
    userConfirmed = true;
    console.log("User rejected to execute JS");
    removeListeners(bot, [/^\!c$/, /^\!r$/]);
    bot.sendMessage(chatId, "Đã hủy thực thi JS");
  };

  bot.onText(/^\!c$/, confirmExecution);
  bot.onText(/^\!r$/, rejectExecution);

  return { userConfirmed, userAddedToSystem };
}

async function processMessage(bot, chatId, text) {
  console.log("Received from " + chatId);

  if (chatId !== settings.ownerId) {
    sendMessageWithMarkdown(
      bot,
      chatId,
      "Bạn không được phép truy cập dịch vụ này!"
    );
    sendMessageWithMarkdown(
      bot,
      settings.ownerId,
      "Phát hiện người dùng " + chatId + " đã nhắn với Kennen"
    );
    return;
  }

  const typingInterval = setInterval(() => {
    bot.sendChatAction(chatId, "typing");
  }, 3000);

  let getResponseAI =
    typeof text == "string"
      ? await generateResponse(text, chatId)
      : await generateResponseChatCompletion(text);

  if (getResponseAI.match(/^(API_SYSTEM )/)) {
    const jsonData = cleanAndParseJson(getResponseAI);
    const resAI = await accessSystem(bot, chatId, jsonData);
    sendMessageWithMarkdown(
      bot,
      chatId,
      `*Code: ${resAI.status}*\n${resAI.message}`
    );

    if (resAI.status === 203) {
      const { userConfirmed } = handleUserConfirmation(bot, chatId, resAI);

      // Save to memory logic can be triggered based on user response
      setTimeout(() => {
        if (!userConfirmed) {
          removeListeners(bot, [/^\!c$/, /^\!r$/]);
          console.log("User rejected to execute JS");
          sendMessageWithMarkdown(
            bot,
            chatId,
            "Đã hết thời gian xác nhận, hủy thực thi JS"
          );
        }
      }, 30000);
    } else if (resAI.status === 204) {
      await saveResponseToMemory(bot, chatId, resAI);
      const responseAI = await generateResponse("", chatId);
      sendMessageWithMarkdown(bot, chatId, responseAI);
    } else if (resAI.status === 205) {
      await saveResponseToMemory(
        bot,
        chatId,
        "API_SYSTEM_CALENDAR_RESULT" + resAI
      );
    }
  } else {
    try {
      if (getExportFileMode() != "text") {
        sendFile({
          filename: "./temp/result_{{id}}." + getExportFileMode(),
          chatId,
          bot,
          content: getResponseAI,
        });
      } else {
        if (getResponseAI.length > 4096) {
          sendMessageWithMarkdown(
            bot,
            "Nội dung quá dài... Đang gửi file",
            getResponseAI
          );
          sendFile({
            filename: "./temp/result_{{id}}.txt",
            chatId,
            bot,
            content: getResponseAI,
          });
        } else sendMessageWithMarkdown(bot, chatId, getResponseAI);
      }
    } catch (e) {
      sendMessageWithMarkdown(bot, chatId, "Error response");
    }
  }

  clearInterval(typingInterval);
}

function receiveAnyMessage(bot) {
  bot.onText(/^[^\/\!](.*)/, async (msg) => {
    processMessage(bot, msg.chat.id, msg.text);
  });
}

module.exports = { receiveAnyMessage, processMessage };
