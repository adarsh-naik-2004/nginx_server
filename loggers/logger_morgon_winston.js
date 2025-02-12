/*
Node Logger is a powerful tool that allows you to log messages to the console, file, or other destinations. It provides a simple and flexible API for logging messages, making it easy to debug and monitor your Node.js applications.
Console logs are great for quick debugging, but they can be difficult to manage and analyze.
*/

import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, colorize } = format;

const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({ filename: "app.log" }),
  ],
});

export default logger;
