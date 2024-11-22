const { randomUUID } = require("crypto");
const { requestHttpsPOST, requestHttpsGET } = require("./http_request");
const fs = require("fs");
const path = require("path");
const { escapeMarkdown, dateStringify } = require("./utils");
const { settings } = require("./configs");

const days = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
const remindersDir = path.join(__dirname, "temp");

// Helper function
const getDayName = (date) => days[date.getDay()];
const formatTime = (date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

// Format event string
const formatEventString = (startDate, endDate, title) => {
  const dayName = getDayName(startDate);
  const date = String(startDate.getDate()).padStart(2, "0");
  const month = String(startDate.getMonth() + 1).padStart(2, "0");
  const year = startDate.getFullYear();
  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);

  return `* ${dayName} ngày ${date}/${month}/${year}, từ ${startTime} đến ${endTime}: ${title}`;
};

// Save event to file
const saveEventToFile = (eventData) => {
  if (!fs.existsSync(remindersDir)) fs.mkdirSync(remindersDir);
  const filePath = path.join(
    remindersDir,
    `event_${eventData.eventId || Date.now()}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(eventData), "utf8");
  console.log(`Event saved to ${filePath}`);
};

// Set reminder with bot
const setReminder = (bot, event) => {
  const now = new Date();
  const eventDate = new Date(event.dateStart);

  // Nhắc nhở một ngày trước sự kiện vào 6:00 sáng
  const reminderDayBefore = new Date(eventDate);
  reminderDayBefore.setDate(reminderDayBefore.getDate() - 1);
  reminderDayBefore.setHours(6, 0, 0, 0);

  if (reminderDayBefore > now) {
    setTimeout(() => {
      bot.sendMessage(
        event.chatId,
        `Nhắc nhở: Sự kiện "${event.title}" sẽ diễn ra vào ngày mai.`
      );
    }, reminderDayBefore.getTime() - now.getTime());
  }

  // Nhắc nhở khi sự kiện bắt đầu
  if (eventDate > now) {
    setTimeout(() => {
      bot.sendMessage(
        event.chatId,
        `Sự kiện "${event.title}" bắt đầu ngay bây giờ!`
      );
    }, eventDate.getTime() - now.getTime());
  }
};

// Load all reminders and set them
const loadAllReminders = (bot) => {
  if (fs.existsSync(remindersDir)) {
    const files = fs.readdirSync(remindersDir);
    files.forEach((file) => {
      const filePath = path.join(remindersDir, file);
      const eventData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`Loaded event: ${eventData.title}`);
      setReminder(bot, eventData);
    });
  }
};

// Parse ICS content to extract events
const parseICS = (content) => {
  const lines = content.split("\n");
  const events = [];
  let currentEvent = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("BEGIN:VEVENT")) currentEvent = {};
    else if (trimmedLine.startsWith("DTSTART") && currentEvent)
      currentEvent.dateStart = parseICalDate(trimmedLine.split(":")[1]);
    else if (trimmedLine.startsWith("DTEND") && currentEvent)
      currentEvent.dateEnd = parseICalDate(trimmedLine.split(":")[1]);
    else if (trimmedLine.startsWith("SUMMARY") && currentEvent)
      currentEvent.title = trimmedLine.split(":")[1];
    else if (trimmedLine.startsWith(" ") && currentEvent?.title)
      currentEvent.title += trimmedLine.trim();
    else if (trimmedLine.startsWith("END:VEVENT") && currentEvent) {
      events.push(currentEvent);
      currentEvent = null;
    }
  });

  return events;
};

// Helper function to parse dates from ICS format
const parseICalDate = (dateStr) => {
  if (dateStr.endsWith("Z"))
    return new Date(
      dateStr.replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
        "$1-$2-$3T$4:$5:$6Z"
      )
    );
  if (dateStr.includes("T"))
    return new Date(
      dateStr.replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
        "$1-$2-$3T$4:$5:$6"
      )
    );
  return new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
};

// Hàm đọc tất cả reminder từ file
const loadRemindersFromFiles = () => {
  if (!fs.existsSync(remindersDir)) return []; // Nếu không có thư mục thì không có sự kiện
  const files = fs.readdirSync(remindersDir);
  return files.map(file => {
    const filePath = path.join(remindersDir, file);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  });
};

// Hàm xoá event từ file
const deleteEventFromFile = (eventId) => {
  const filePath = path.join(remindersDir, `event_${eventId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// Hàm xoá tất cả event từ file
const deleteAllEventsFromFile = () => {
  if (!fs.existsSync(remindersDir)) return;
  const files = fs.readdirSync(remindersDir);
  files.forEach(file => {
    const filePath = path.join(remindersDir, file);
    fs.unlinkSync(filePath);
  });
};


// Main access system (đã chỉnh sửa để lấy cả reminder)
const accessSystem = async (bot, chatId, obj) => {
  console.log("Kennen accessed to the system!");

  if (!obj) return { status: 101, message: "Lỗi: Không có dữ liệu" };

  try {
    switch (obj.type) {
      case "CALENDAR_ADD_EVENT":
        console.log("Kennen decided to add event");

        if (obj.arr) {
          obj.arr.forEach(event => {

            let evtTemp = {
              eventId: randomUUID(),
              title: event.title || "[Không rõ]",
              description: event.description || "[Không rõ]",
              dateStart: event.dateStart,
              dateEnd: event.dateEnd,
              location: event.location || "[Không rõ]",
              chatId: chatId,
            };

            saveEventToFile(evtTemp);
            setReminder(bot, evtTemp);
          });
        } else {
          return { status: 101, message: "Lỗi: Không có dữ liệu" };
        }

        return { status: 205, message: "Thêm lịch thành công!\n```json\n" + escapeMarkdown(JSON.stringify(obj, null, 2)) + "\n```" };

      case "CALENDAR_DELETE_EVENT":
        console.log("Kennen decided to delete event");

        if (obj.eventId) {
          deleteEventFromFile(obj.eventId);
        } else {
          return { status: 101, message: "Lỗi: Không có dữ liệu" };
        }

        return { status: 205, message: "Xoá lịch thành công!\n```json\n" + escapeMarkdown(JSON.stringify(obj, null, 2)) + "\n```" };
      case "REQUEST_CALENDAR":
        let date = new Date();
        let calendarString = settings.calendar.canAccess
          ? "API_SYSTEM_CALENDAR_RESULT\n" + "Hôm nay là " + days[date.getDay()] + ", " + dateStringify(date) + "\n\nĐây là lịch làm việc:\n"
          : "API_SYSTEM_CALENDAR_RESULT\n" + "Hôm nay là " + days[date.getDay()] + ", " + dateStringify(date) + ".\n\nNgười dùng không cho phép xem lịch.";

        // Nếu có quyền truy cập vào calendar
        if (settings.calendar.canAccess) {
          // Lấy sự kiện từ ICS API
          let objectCalendar = await Promise.all(settings.calendar.api.map(async (item) => parseICS(await requestHttpsGET(item.url))));
          let filteredEvents = objectCalendar.map(events => events.filter(event => {
            const startTime = new Date(event.dateStart).getTime();
            const currentTime = new Date().setHours(0, 0, 0, 0);
            return startTime >= currentTime && startTime <= currentTime + 7 * 24 * 60 * 60 * 1000;
          }));

          // Format sự kiện từ ICS
          calendarString += filteredEvents
            .map((events, index) => `[${settings.calendar.api[index].apiName}]\n` + events.map(event => formatEventString(event.dateStart, event.dateEnd, event.title)).join("\n"))
            .join("\n\n");

          // Lấy sự kiện từ reminder
          const reminders = loadRemindersFromFiles();
          const filteredReminders = reminders.filter(event => {
            const startTime = new Date(event.dateStart).getTime();
            const currentTime = new Date().setHours(0, 0, 0, 0);
            return startTime >= currentTime && startTime <= currentTime + 7 * 24 * 60 * 60 * 1000;
          });

          if (filteredReminders.length > 0) {
            calendarString += "\n\n[Nhắc nhở từ hệ thống]\n" + filteredReminders.map(event => formatEventString(new Date(event.dateStart), new Date(event.dateEnd), event.title + " (id: " +event.eventId + ")" )).join("\n");
          }
        }

        return { status: 204, message: obj.kennenMessage, data: calendarString };

      case "REQUEST_EXECUTE_JS":
        if (!obj.script) return { status: 102, message: "*Không có mã JavaScript*\n\n" + obj.kennenMessage ?? "NO MESSAGE FROM KENNEN" };
        obj.script = obj.script.replace("console.log(", "bot.sendMessage(chatId,");
        return { status: 203, message: obj.kennenMessage + "\n\n> Gõ `!c` để xác nhận\n```javascript\n" + obj.script + "```", javascript: obj.script };

      default:
        return { status: 100, message: "Lỗi: Request JSON không hợp lệ!" };
    }
  } catch (error) {
    console.log(error);
    return { status: 100, message: "Lỗi: Request JSON không hợp lệ!" };
  }
};

module.exports = {
  accessSystem,
  parseICS,
  loadAllReminders,
  loadRemindersFromFiles,
  deleteAllEventsFromFile,
};
