module.exports = {
  settings: {
    calendar: {
      canAccess: false,
      api: [
      ],
      apiWrite: [
      ],
    },
    ownerId: "REPLACE_YOUR_TELEGRAM_ID",
    limitMemory: 35,
    openAI: {
      key: "REPLACE_YOUR_OPENAI_KEY",
      gptModel: [
        "gpt-3.5-turbo",
        "gpt-4-turbo",
        "gpt-4o",
        "gpt-4o-mini",
        "o1-preview",
        "o1-mini",
      ],
      gptDescription: [
        "A fast, inexpensive model for simple tasks",
        "The previous set of high-intelligence models",
        "Our high-intelligence flagship model for complex, multi-step tasks",
        "Our affordable and intelligent small model for fast, lightweight tasks",
        "Reasoning model designed to solve hard problems across domains.",
        "Faster and cheaper reasoning model particularly good at coding, math, and science.",
      ],
    },
    gptSettings: {
      limitMemory: 50,
      quickresponse: true,
      modelGPTCurrent: 3,
      isCustomPrompt: false,
      isCustomModel: false,
      promptCustom: "",
      currentPromptID: 0,
      configModel: {
        temperature: 0,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    },
    telegram: {
      token: "REPLACE_YOUR_TELEGRAM_TOKEN",
    },
    bot: {
      exportFileMode: "text",
    },
    isLongerContent: false,
    setLongerContent: (isLongerContent) => {
      module.exports.settings.isLongerContent = isLongerContent;
    },
  },
  setConfigModel: function (config) {
    module.exports.settings.gptSettings.configModel = config;
  },
  getConfigModel: function () {
    return module.exports.settings.gptSettings.configModel;
  },
  getGPTSettings: function () {
    return {
      ...module.exports.settings.gptSettings,
      modelGPTCurrent:
        module.exports.settings.openAI.gptModel[
          module.exports.settings.gptSettings.modelGPTCurrent
        ],
    };
  },
  setExportFileMode: function (mode) {
    module.exports.settings.bot.exportFileMode = mode;
  },
  getExportFileMode: function () {
    return module.exports.settings.bot.exportFileMode;
  },
  setMemory: function (limit) {
    module.exports.settings.gptSettings.limitMemory = limit;
  },
  setAccessCalendar: function (access) {
    module.exports.settings.calendar.canAccess = access;
  },
  setGPTModel: function (model) {
    module.exports.settings.gptSettings.modelGPTCurrent = model;
  },
  setQResponse: function (qr) {
    module.exports.settings.gptSettings.quickresponse = qr;
  },
  openai: null,
  setOpenAI: function (openai) {
    module.exports.openai = openai;
  },
  setPromptCustom: function (prompt) {
    module.exports.settings.gptSettings.isCustomPrompt = false;
    if (!prompt || prompt == 0) {
      module.exports.settings.gptSettings.currentPromptID = 0;
      // module.exports.settings.setLongerContent(false);
      return;
    }
      
    module.exports.settings.gptSettings.currentPromptID = prompt;

    if (prompt == 1 || prompt == 2) {
      return;
    }

    module.exports.settings.gptSettings.isCustomPrompt = true;
    return;
  },
};