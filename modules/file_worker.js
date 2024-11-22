const fileConversation = "./temp/conversation_{{id}}.json";
const filePrompt = "./temp/prompt/{{id}}.json";
const fs = require("fs");
const { getGPTSettings } = require("./configs");


function getConversationFileName(chatId) {
  return fileConversation.replace("{{id}}", chatId);
}

function getPromptFileName(chatId) {
  return filePrompt.replace("{{id}}", chatId);
}

const isOn = (str) => {
  return str ? "on" : "off";
};

function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

const parseJSONTrans = (jsStr) => {
  try {
    return JSON.parse(jsStr);
  } catch (e) {
    console.log(e)
    return { status: 102, message: "Hệ thống trả về JSON không hợp lệ" };
  }
};

function getFileJSON(fileName) {
  try {
    if (!fs.existsSync(fileName)) {
      fs.writeFileSync(fileName, "[]");
      return [];
    }
    let data = fs.readFileSync(fileName, "utf8");
    return JSON.parse(data);
  } catch (e) {
    fs.writeFileSync(fileName, "[]");
    return [];
  }
}
async function loadChatId(chatId) {
  let loadChatBefore = await getFileJSON(getConversationFileName(chatId));
  if (!loadChatBefore) {
    loadChatBefore = [];
    fs.writeFileSync(
      getConversationFileName(chatId),
      JSON.stringify(loadChatBefore)
    );
  }
  return loadChatBefore;
}

async function loadPrompt(chatId) {
  let loadPrompt = await getFileJSON(getPromptFileName(chatId));
  if (!loadPrompt) {
    loadPrompt = [];
    fs.writeFileSync(getPromptFileName(chatId), JSON.stringify(loadPrompt));
  }
  return loadPrompt;
}

async function loadOldConversation(chatId) {
  let lastChat = `[Cuộc trò chuyện giữa bạn và Kennen - Limit ${getGPTSettings().limitMemory}]`;
  let loadChatBefore = await loadChatId(chatId);
  if (Array.isArray(loadChatBefore) == false || loadChatBefore.length == 0)
    return lastChat + "\nKhông có dữ liệu";
  for (let i = 0; i < loadChatBefore.length; i++) {

    if (loadChatBefore[i].role == "system") {
      lastChat += "\n\n[ System ] " + loadChatBefore[i].content;
      continue;
    } 

    if (loadChatBefore[i].role == "assistant") {
      lastChat += "\n\n[ Kennen ] " + loadChatBefore[i].content;
      continue;
    }


    lastChat += "\n\n[ Bạn ] " + loadChatBefore[i].content;
  }
  return lastChat;
}

async function loadNewestMessageFromKennen(chatId) {
  let loadChatBefore = await loadChatId(chatId);
  if (Array.isArray(loadChatBefore) == false || loadChatBefore.length == 0)
    return "Không có dữ liệu";
  return loadChatBefore[loadChatBefore.length - 1].aChat;
}

module.exports = {
  loadOldConversation,
  parseJSONTrans,
  getFileJSON,
  encodeFormData,
  isOn,
  getConversationFileName,
  loadChatId,
  loadNewestMessageFromKennen,
  getPromptFileName,
  loadPrompt,
};