const OpenAI = require("openai");
const TelegramBot = require("node-telegram-bot-api");
const { generateString } = require("./modules/utils");
const fs = require("fs");
const {
  handleTelegramMesage,
} = require("./modules/telegram_handler/createMessage");

require("./modules/configs");
require("./constants/bot_prompt");

const { loadAllReminders } = require("./modules/system_worker");
const { settings, setOpenAI } = require("./modules/configs");
const { loadChatId, getConversationFileName } = require("./modules/file_worker");
const {
  processMessage,
} = require("./modules/telegram_handler/message_handler/anyMessage");

// const fileUserData = './temp/user_data_{{id}}.json';
global._VERSION = { code: "3.2.0", description: "Remove /guihtml and guirn, can send image like Chat GPT web" };
global._session = { id: generateString(12), createAt: new Date() };

global.openai = new OpenAI({
  apiKey: settings.openAI.key,
});

console.log("\x1b[34m%s\x1b[0m %s", "Log: ", "Đang load cài đặt hệ thống");

console.log("\x1b[34m%s\x1b[0m %s", "Log: ", "Đang khởi động dịch vụ OpenAI");

/* Function */
console.log("\x1b[34m%s\x1b[0m %s", "Log: ", "Đang khởi động Telegram Bot");

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(settings.telegram.token, { polling: true });

console.log("\x1b[34m%s\x1b[0m %s", "Log: ", "Thiết lập phiên chat người dùng");

handleTelegramMesage(bot);

// Handle event send message - image, file
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  let chatIDFile = "";

  if (chatId != settings.ownerId) {
    return;
  }

  if (!msg.document && !msg.photo) {
    return;
  }

  if (msg.document) {
    if (msg.document.mime_type.match("image")) {
      chatIDFile = msg.document.file_id;
    } else {
      return;
    }
  }

  if (msg.photo) {
    if (msg.photo.length > 0) {
      chatIDFile = msg.photo[msg.photo.length - 1].file_id;
    } else {
      return;
    }
  }

  const caption = msg.caption || "";
  const file_url = await bot.getFileLink(chatIDFile);

  bot.sendMessage(chatId, `Đã nhận file hình ảnh: ${chatIDFile}`);

  let loadChatBefore = [];
  loadChatBefore = await loadChatId(chatId);

  const botContent = [
    {
      type: "image_url",
      image_url: { url: file_url, detail: "high" },
    },
  ];

  if (!caption) {
    loadChatBefore.push({
      role: "user",
      content: botContent,
    });
    fs.writeFileSync(
      getConversationFileName(chatId),
      JSON.stringify(loadChatBefore)
    );
    return;
  }

  botContent.push({
    type: "text",
    text: caption,
  });

  loadChatBefore.push({
    role: "user",
    content: botContent,
  });
  // bot.sendMessage(chatId, `File ID: \`${chatIDFile}\`\n\nCommand create GUI: \`/guiwebhtml ${chatIDFile}\`\n\nCommand prompt custom \`/imagevision ${chatIDFile};System;User\``, {parse_mode: "Markdown"});

  fs.writeFileSync(
    getConversationFileName(chatId),
    JSON.stringify(loadChatBefore)
  );
  processMessage(bot, msg.chat.id, loadChatBefore);
  return;
});

loadAllReminders(bot);

console.log("\x1b[34m%s\x1b[0m %s", "Log: ", "Đã sẵn sàng hoạt động!");
