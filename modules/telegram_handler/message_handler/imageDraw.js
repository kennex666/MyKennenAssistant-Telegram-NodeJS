const https = require("https");
const { settings } = require("../../configs");

function imageDraw(bot) {
  const drawImage = async (msg, size) => {
    const chatId = msg.chat.id;
    if (chatId !== settings.ownerId) {
      bot.sendMessage(chatId, "Bạn không được phép truy cập dịch vụ này!");
      bot.sendMessage(
        settings.ownerId,
        `Phát hiện người dùng ${chatId} đã nhắn với Kennen: ${msg}`
      );
      return;
    }

    await bot.sendChatAction(chatId, "upload_photo");
    const userInput = msg.text.replace(`/image${size} `, "");
    console.log(`Drawing: ${userInput}`);

    const options = {
      hostname: "api.openai.com",
      path: "/v1/images/generations",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.openAI.key}`,
      },
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        if (body.data && body.data[0].url) {
          bot.sendPhoto(chatId, body.data[0].url);
        } else {
          bot.sendMessage(chatId, "Tạo thất bại");
        }
      });
    });

    req.write(
      JSON.stringify({
        prompt: userInput,
        n: 1,
        size: `${size}x${size}`,
      })
    );
    req.end();
  };

  // Các lệnh với các kích thước khác nhau
  bot.onText(/^\/image1024 /, (msg) => drawImage(msg, 1024));
  bot.onText(/^\/image512 /, (msg) => drawImage(msg, 512));
  bot.onText(/^\/image256 /, (msg) => drawImage(msg, 256));
}

module.exports = {imageDraw};