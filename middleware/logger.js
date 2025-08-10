// logger.js
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fsPromises = require("fs").promises;
const fs = require("fs");
const path = require("path");
const os = require("os");

const isProd =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

const getLogPath = (logFileName) => {
  if (isProd) {
    // serverless: use ephemeral temp dir (writable but not persistent)
    return path.join(os.tmpdir(), logFileName);
  }
  // local: keep logs in project/logs folder
  return path.join(__dirname, "..", "logs", logFileName);
};

const logEvents = async (message, logFileName = "reqLog.log") => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  const logPath = getLogPath(logFileName);

  try {
    // If local and directory does not exist, create it
    if (!isProd) {
      const dir = path.dirname(logPath);
      // recursive: true makes this safe in case parent exists
      await fsPromises.mkdir(dir, { recursive: true });
    }
    // Append to file (will create file if missing)
    await fsPromises.appendFile(logPath, logItem);
  } catch (err) {
    // Never throw from the logger — fallback to console so requests don't fail
    console.error(
      "logEvents error (falling back to console):",
      err && err.message ? err.message : err
    );
    console.log(logItem.trim());
  }
};

const logger = (req, res, next) => {
  // fire-and-forget; logEvents handles its own errors
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
