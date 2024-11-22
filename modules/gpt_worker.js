  const {
    loadChatId,
    getConversationFileName,
    loadPrompt,
  } = require("./file_worker");
  const fs = require("fs");
  const { getGPTSettings, getConfigModel, openai, settings } = require("./configs");
  const { configModel, getPrompt } = require("../constants/bot_prompt");
  const { createObject } = require("./utils");

  /* Image proccessing */
  async function requestGPTVision(image_data_url, modelGPT, intrustion) {
    let chatCompletionGenerate;
    chatCompletionGenerate = [
      { role: "system", content: intrustion["system"] },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: image_data_url, detail: "high" },
          },
          {
            type: "text",
            text: intrustion["user"],
          },
        ],
      },
    ];
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: chatCompletionGenerate,
        model: modelGPT,
        max_tokens: 4069,
        temperature: 0,
      });
      return chatCompletion.choices[0].message.content;
    } catch (e) {
      return e.message;
    }
  }

  /* Language processing */
  async function generateResponse(content, chatId) {
    let chatCompletionGenerate;
    let loadChatBefore = await loadChatId(chatId);

    chatCompletionGenerate = [];

    chatCompletionGenerate = getPrompt();

    if (content) loadChatBefore.push(createObject("user", content));

    chatCompletionGenerate = [...chatCompletionGenerate, ...loadChatBefore];

    try {
      const response = await generateResponseChatCompletion(
        chatCompletionGenerate
      );

      if (loadChatBefore.length > getGPTSettings().limitMemory) {
        loadChatBefore.shift();
      }

      if (Array.isArray(loadChatBefore) == false) loadChatBefore = [];

      loadChatBefore.push(createObject("assistant", response));

      fs.writeFileSync(
        getConversationFileName(chatId),
        JSON.stringify(loadChatBefore)
      );

      return response;
    } catch (e) {
      console.log(e);
      return e.message;
    }
  }
  async function generateResponseChatCompletion(chatCompletionGenerate) {
    // Console log the input for debugging if needed
    // console.log(chatCompletionGenerate);

    const chatCompletion = settings.isLongerContent
      ? await generateLongResponseWithStop(chatCompletionGenerate) // Call the long response generator
      : await global.openai.chat.completions.create({
          messages: chatCompletionGenerate,
          model: getGPTSettings().modelGPTCurrent,
          ...getConfigModel(),
        });
    return settings.isLongerContent ? chatCompletion : chatCompletion.choices[0].message.content;
  }

  async function generateLongResponseWithStop(chatCompletionGenerate) {
    try {
      const maxTokens = 4096; // Max token limit for the model
      const currentTokens = calculateTokens(chatCompletionGenerate); // Tokens in the conversation history

      // Ensure the conversation history is within the token limits
      if (currentTokens > maxTokens) {
        chatCompletionGenerate = trimHistoryToFitTokenLimit(
          chatCompletionGenerate,
          maxTokens
        );
      }

      // Calculate remaining tokens for output
      const remainingTokens = maxTokens - currentTokens;

      // Define the stop sequence (e.g., stopping when the response reaches "END")
      const stopSequence = ["END"];
      const maxRetries = 3; // Limit to avoid infinite recursion

      let retryCount = 0;
      let responseContent = "";

      while (retryCount < maxRetries) {
        // Call OpenAI API with stop sequence and remaining token count
        const chatCompletion = await global.openai.chat.completions.create({
          messages: chatCompletionGenerate,
          model: getGPTSettings().modelGPTCurrent,
          ...getConfigModel(),
        });

        responseContent = chatCompletion.choices[0].message.content;

        // If "END" is in the response, consider it as a stopping point
        if (chatCompletion.choices[0].finish_reason != "stop") {
          console.log("Stop sequence reached, generating more...");
          chatCompletionGenerate.push({
            role: "assistant",
            content: responseContent,
          });
          retryCount++;
        } else {
          break; // If no stop sequence, we can stop the loop
        }
      }
      return responseContent;
    } catch (error) {
      console.error("Error generating chat response:", error);
      return "Sorry, there was an error generating the response.";
    }
  }

  // Hàm tối ưu hóa để cắt ngắn lịch sử cuộc trò chuyện sao cho phù hợp với giới hạn token, chỉ cắt tin nhắn người dùng
  function trimHistoryToFitTokenLimit(messages, maxTokens) {
    let trimmedMessages = [];
    
    // Duyệt qua tất cả tin nhắn, giữ lại tin nhắn hệ thống và các tin nhắn hợp lệ của người dùng/trợ lý
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      // Giữ tất cả tin nhắn hệ thống
      if (msg.role === "system") {
        trimmedMessages.push(msg);
      } 
      // Giữ các tin nhắn của trợ lý (assistant)
      else if (msg.role === "assistant" && typeof msg.content === "string" && msg.content.trim() !== "") {
        trimmedMessages.push(msg);
      }
      // Giữ tin nhắn người dùng hợp lệ, nhưng sẽ cắt khi cần
      else if (msg.role === "user" && typeof msg.content === "string" && msg.content.trim() !== "") {
        trimmedMessages.push(msg);
      }
    }

    // Kiểm tra tổng số token của cuộc trò chuyện, cắt bớt nếu cần
    while (calculateTokens(trimmedMessages) > maxTokens) {
      // Xóa tin nhắn người dùng cũ nhất nếu vượt quá giới hạn token
      for (let i = 0; i < trimmedMessages.length; i++) {
        if (trimmedMessages[i].role === "user") {
          trimmedMessages.splice(i, 1); // Xóa tin nhắn người dùng
          break; // Chỉ xóa 1 tin nhắn người dùng để giảm token
        }
      }
    }

    return trimmedMessages;
  }

  function calculateTokens(messages) {
    // Tính tổng số token của tất cả tin nhắn trong cuộc trò chuyện
    return messages.reduce((totalTokens, message) => {
      // Tính token của mỗi tin nhắn
      const messageTokens = typeof(message.content) == "string" ? message.content.split(" ").length : 100;
      return totalTokens + messageTokens;
    }, 0);
  }


  module.exports = {
    generateResponseChatCompletion,
    generateResponse,
    requestGPTVision,
  };
