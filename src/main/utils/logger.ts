import chalk from 'chalk';
import dayjs from 'dayjs';
import { app } from 'electron';
import fs from 'fs';
import path from 'node:path';
type Log = {
  level: string;
  source: string;
  message: string;
  datetime: Date;
};

const getLogDir = () => {
  const appAppPath = app.isPackaged ? './' : app.getAppPath();

  const logDir = path.join(appAppPath, 'logs', dayjs().format('YYYY-MM-DD'));

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

type LogLevel = Log['level'];
const getLogFile = (level: LogLevel) => {
  const logDir = getLogDir();
  const logFile = path.join(logDir, `${level}.log`);
  // Create the file if the file is not existed.
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
  }
  return logFile;
};

const writeLog = (datetime: Date, level: LogLevel, source: Log['source'], message: string) => {
  // 2.1 Write the log to the file.
  const logFile = getLogFile(level);
  const timeStr = now(datetime);
  const text = `${timeStr} ["${level}"] [${source}] ${message}\n`;
  fs.appendFileSync(logFile, text);
};

// Force chalk to use colors even on Windows terminals
chalk.level > 0 || (chalk.level = 1);

type SOURCE = 'SYSTEM' | 'DEVICE';
interface ILogger {
  info: (message: string, source?: SOURCE) => void;
  error: (message: string, source?: SOURCE) => void;
  warn: (message: string, source?: SOURCE) => void;
  verbose: (message: string, source?: SOURCE) => void;
}

const now = (now: Date) => dayjs(now).format('HH:mm:ss');
const sourceInChalk = (source: SOURCE) => chalk.gray.bold(source);

export const logger: ILogger = {
  info(message, source = 'SYSTEM') {
    // 1. Handle input.
    // 1.1 Check if source is valid.
    if (source !== 'SYSTEM' && source !== 'DEVICE') {
      throw new Error('Invalid source');
    }

    // 1.2 Check if message is valid.
    if (typeof message !== 'string') {
      throw new Error('Invalid message');
    }

    // 2. Handle logic.
    const displaySource = sourceInChalk(source);
    const level = chalk.green.bold('INFO');
    const datetime: Date = new Date();
    const timeStr = now(datetime);

    // 2.1 If the message is not end with a dot, then add a dot to the end of the message.
    if (!message.endsWith('.')) {
      message += '.';
    }

    console.log(`${timeStr} [${level}] [${displaySource}] ${message}`);
    // Save the log to the file.
    writeLog(datetime, 'info', source, message);

    // 3. Return result.
    return {
      message,
      source,
    };
  },
  error: (message, source = 'SYSTEM') => {
    const displaySource = sourceInChalk(source);
    const level = chalk.red.bold('ERROR');
    const datetime = new Date();
    const timeStr = now(datetime);

    // 2.1 If the message is not end with a dot, then add a dot to the end of the message.
    if (!message.endsWith('.')) {
      message += '.';
    }

    console.error(`${timeStr} [${level}] [${displaySource}] ${message}`);
    console.trace();

    writeLog(datetime, 'error', source, message);
  },
  warn: (message, source = 'SYSTEM') => {
    const displaySource = sourceInChalk(source);
    const level = chalk.yellow.bold('WARN');
    const datetime = new Date();
    const timeStr = now(datetime);

    // 2.1 If the message is not end with a dot, then add a dot to the end of the message.
    if (!message.endsWith('.')) {
      message += '.';
    }

    console.warn(`${timeStr} [${level}] [${displaySource}] ${message}`);

    writeLog(datetime, 'warning', source, message);
  },

  verbose: (message, source = 'SYSTEM') => {
    const displaySource = sourceInChalk(source);
    const level = chalk.gray.bold('VERBOSE');
    const datetime = new Date();
    const timeStr = now(datetime);
    console.log(`${timeStr} [${level}] [${displaySource}] ${message}`);

    // 2.1 If the message is not end with a dot, then add a dot to the end of the message.
    if (!message.endsWith('.')) {
      message += '.';
    }

    writeLog(datetime, 'verbose', source, message);
  },
};
