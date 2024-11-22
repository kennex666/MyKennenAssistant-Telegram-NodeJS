const fs = require("fs");

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

Number.prototype.padLeft = function (base, chr) {
  var len = String(base || 10).length - String(this).length + 1;
  return len > 0 ? new Array(len).join(chr || "0") + this : this;
};

function dateStringify(d) {
  return (
    [d.getDate().padLeft(), (d.getMonth() + 1).padLeft(), d.getFullYear()].join(
      "/"
    ) +
    " " +
    [
      d.getHours().padLeft(),
      d.getMinutes().padLeft(),
      d.getSeconds().padLeft(),
    ].join(":")
  );
}

function createObjUserAndAIRespond(uChat, aChat) {
  let obj = { uChat: uChat, aChat: aChat };
  return obj;
}

function createObject(type, message) {
  let obj = { role: type, content: message };
  return obj;
}

function generateString(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cleanAndParseJson(inputString) {
  // Tìm vị trí dấu mở và đóng ngoặc của JSON trong chuỗi
  const startIndex = inputString.indexOf("{");
  const endIndex = inputString.lastIndexOf("}");

  // Nếu không tìm thấy dấu mở hoặc đóng ngoặc, trả về null
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null;
  }

  // Trích xuất phần JSON từ chuỗi
  let jsonString = inputString.substring(startIndex, endIndex + 1);

  // Sửa một số lỗi JSON phổ biến

  try {
    // Cố gắng parse JSON
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    console.error("Invalid JSON after cleaning:", error);
    return null;
  }
}

function escapeJsonString(jsonString) {
  // Thay thế các dấu nháy đơn bên trong chuỗi để đảm bảo JSON hợp lệ
  return jsonString
    .replace(/\\/g, "\\\\") // Thoát các dấu gạch chéo ngược
    .replace(/'/g, "\\'") // Thoát dấu nháy đơn
    .replace(/"/g, '\\"'); // Thoát dấu nháy kép nếu cần
}

// Chuẩn hóa chuỗi JSON
function correctJSON(jsonInput) {
  return jsonInput.replace(/"script":\s*"([^"]+)"/, (match, p1) => {
    return `"script": "${escapeJsonString(p1)}"`;
  });
}

const escapeMarkdown = (text) => {
  return text
    .replace(/_/g, "\\_") // Thoát ký tự _
    .replace(/\*/g, "\\*") // Thoát ký tự *
    .replace(/\[/g, "\\[") // Thoát ký tự [
    .replace(/\]/g, "\\]") // Thoát ký tự ]
    .replace(/\(/g, "\\(") // Thoát ký tự (
    .replace(/\)/g, "\\)") // Thoát ký tự )
    .replace(/~/g, "\\~") // Thoát ký tự ~
    .replace(/`/g, "\\`") // Thoát ký tự `
    .replace(/>/g, "\\>") // Thoát ký tự >
    .replace(/#/g, "\\#") // Thoát ký tự #
    .replace(/\+/g, "\\+") // Thoát ký tự +
    .replace(/-/g, "\\-") // Thoát ký tự -
    .replace(/=/g, "\\=") // Thoát ký tự =
    .replace(/\|/g, "\\|") // Thoát ký tự |
    .replace(/\./g, "\\.") // Thoát ký tự .
    .replace(/!/g, "\\!"); // Thoát ký tự !
};

function removeCircularReferences(obj) {
  const seen = new Set();
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return; // Loại bỏ các thuộc tính vòng tròn
        }
        seen.add(value);
      }
      return value;
    })
  );
}

const sendFile = async ({
  filename, chatId, bot, content,
}) => {
  try {
    fs.writeFileSync(filename.replace("{{id}}", chatId), content);
    const stream = fs.createReadStream(
      filename.replace("{{id}}", chatId)
    );
    await bot.sendDocument(chatId, stream);
  } catch (e) {
    console.log(e)
    bot.sendMessage(chatId, "Error response");
  }
};

module.exports = {
  generateString,
  sleep,
  correctJSON,
  cleanAndParseJson,
  escapeMarkdown,
  dateStringify,
  createObjUserAndAIRespond,
  createObject,
  sendFile,
  removeCircularReferences,
};
