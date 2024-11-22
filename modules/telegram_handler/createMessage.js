const { settings } = require("../configs");
const listAllModel = require("./message_handler/allModel");
const { receiveAnyMessage } = require("./message_handler/anyMessage");
const clearMemory = require("./message_handler/clearMemory");
const clearReminder = require("./message_handler/clearReminder");
const { codeHTMLWeb } = require("./message_handler/codeHTML");
const { handleExternalCommand } = require("./message_handler/commands_not_important");
const customConfig = require("./message_handler/customConfig");
const setPrompt = require("./message_handler/customPrompt");
const exportFileModeHandler = require("./message_handler/exportFileMode");
const { getRecentlyCode } = require("./message_handler/getRecentlyCode");
const { imageDraw } = require("./message_handler/imageDraw");
const { imageProcess } = require("./message_handler/imageProcess");
const loadConversation = require("./message_handler/loadConversation");
const { recentlyLoad } = require("./message_handler/loadRecentlyMessage");
const setMemoryLimit = require("./message_handler/memoryLimit");
const querySettings = require("./message_handler/querySettings");
const setModel = require("./message_handler/set_model");
const setAccessCalendar = require("./message_handler/setAccessCalendar");
const setQuickResponse = require("./message_handler/setQuickResponse");
const { queryJSONSettings } = require("./message_handler/settingsJSON");
const stopBot = require("./message_handler/stopMessage");

function handleTelegramMesage(bot) {
  try {

    exportFileModeHandler(bot);
      
    customConfig(bot);

    setPrompt(bot);

    clearReminder(bot);
      
    getRecentlyCode(bot);

    recentlyLoad(bot);

    receiveAnyMessage(bot);

    setModel(bot);

    stopBot(bot);

    setMemoryLimit(bot);

    loadConversation(bot);

    clearMemory(bot);

    setAccessCalendar(bot);

    setQuickResponse(bot);

    querySettings(bot);

    imageDraw(bot);

    codeHTMLWeb(bot);

    imageProcess(bot);

    handleExternalCommand(bot);

    queryJSONSettings(bot);

    listAllModel(bot);
    
  } catch (error) {
    console.log(error);
    
    bot.sendMessage(
      settings.ownerId,
      "Error: ```javascript\n" + error + "```"
    );
  }
}


module.exports = { handleTelegramMesage };