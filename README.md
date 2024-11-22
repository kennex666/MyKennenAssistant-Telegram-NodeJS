# Kennen - AI Telegram Bot

Kennen is an AI bot that uses Telegram with various useful features to assist users in managing information and creating content.

## Table of Contents
- [Author](#author)
- [Purpose](#purpose)
- [Requirements](#requirements)
- [Installation Instructions](#installation-instructions)
- [Usage Instructions](#usage-instructions)
- [Contact Information](#contact-information)

## Author
Duong Thai Bao - A student of Cohort 17, Industrial University of Ho Chi Minh City

## Purpose
This project aims to create an AI bot that can interact with users via Telegram, providing features to help organize information and easily create content.

Note: This is a personal project primarily for internal purposes. I will not be responsible for any related issues. Additionally, I will not provide support for updates to the bot.

## Requirements
* Telegram account
* Node.js (version 16 higher)
* Basic programming knowledge
* Telegram Bot API library
* Open AI key

## Installation Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Kennex666/MyKennenAssistant-Telegram-NodeJS.git
   cd MyKennenAssistant-Telegram-NodeJS
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configuration**:
   Open the file `modules/configs.js` and fill in the necessary information such as the Telegram bot token and other required settings for the project.

4. **Run the Bot**:
   ```bash
   node index.js
   ```

## Usage Instructions

### Main Commands
- **/start**: Start the bot.
- **/setlimit [number]**: Set the temporary memory limit for conversations, e.g., `/setlimit 01`.
- **/load**: Show the chat messages that Kennen remembers.
- **/test**: Display the activity status.
- **/version**: Show the version information of Kennen.
- **/clear**: Clear Kennen's memory.
- **/image256 [description]**: Generate a 256x256 image based on the description, e.g., `/image256 draw a tree`.
- **/image512 [description]**: Generate a 512x512 image based on the description, e.g., `/image512 draw a tree`.
- **/image1024 [description]**: Generate a 1024x1024 image based on the description, e.g., `/image1024 draw a tree`.
- **/session**: Check the current session.
- **/calendar [on/off]**: Grant access to the study calendar.
- **/quickresponse [on/off]**: Enable/disable quick responses.
- **/settings**: View the bot's settings.
- **/setmodel [0-3]**: Set the model for GPT (0 - 3.5, 1 - 4.0).
- **/guiwebhtml**: Create a GUI for the web.
- **/imagevision [FileID;System;UserPrompt]**: Generate an image based on the description.
- **/jsonsettings**: Load JSON settings.
- **/allmodel**: List all supported models.
- **/repeat**: Repeat the bot's response.
- **/getrecentlycode**: Retrieve the most recent code file from GPT.
- **/deletereminder**: Clear all events in the system.
- **/prompt [0-2]**: Set the prompt (0 - default, 1 - HTML, 2 - RN).
- **/configm [0-1]**: Configure temperature and other parameters.
- **/export**: Export mode.
- **/codern**: Generate React Native code.
- **/codeweb**: Generate Web HTML code.
- **/d**: Default mode.

### Other features:

Bot can execute JS and remind user. (Please checkout in source, I feel so lazy too write about it 🤡)

## Contact Information
If you have any questions or would like to collaborate, please reach out to me via email: [me@dtbao.io.vn](mailto:me@dtbao.io.vn).
