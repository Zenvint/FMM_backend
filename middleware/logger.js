const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd HH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logPath = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logPath)) {
      await fsPromises.mkdir(logPath, { recursive: true });
    }

    // Try append, fallback to write if append fails
    try {
      await fsPromises.appendFile(path.join(logPath, logFileName), logItem);
    } catch (appendErr) {
      console.warn("Append failed, attempting full write:", appendErr);
      await fsPromises.writeFile(path.join(logPath, logFileName), logItem, {
        flag: "a",
      });
    }
  } catch (err) {
    console.error("Failed to log event:", err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  next();
};

module.exports = { logEvents, logger };
