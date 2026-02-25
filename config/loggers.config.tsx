import winston from "winston";
const { combine, timestamp, printf, colorize, uncolorize, align, ms } = winston.format;

const failedFilter = winston.format((info, opts) => {
  return info.level === 'failed' ? info : false;
});

const passedFilter = winston.format((info, opts) => {
  return info.level === 'passed' ? info : false;
});

const blankFilter = winston.format((info, opts) => {
  return info.level === 'blank' ? info : false;
});

const customFormat = printf(({ level, message, timestamp, ms, ...metadata }) => {
  const logObject = {
    level: level,
    message: message,
    timestamp: timestamp,
    ms: ms,
    ...metadata
  };
  return JSON.stringify(logObject);
});

const customLogLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    passed: 3,
    failed: 4,
    blank: 5
  },
  colors: {
    error: 'white bold redBG',
    warn: 'black bold yellowBG',
    info: 'black bold whiteBG',
    passed: 'bold green',
    failed: 'bold red',
    blank: 'bold white'
  }
};

winston.addColors(customLogLevels.colors);

export function createLogger({ filenamePassed, filenameFailed, filenameCombine }: { filenamePassed: string, filenameFailed: string, filenameCombine: string }): winston.Logger {

  const logger = winston.createLogger({

    levels: customLogLevels.levels,
    level: 'blank',

    format:
      combine(
        colorize(),
        timestamp({ format: 'DD/MM/YYYY HH:mm:ss.SSS dddd MMMM' }),
        ms(),
        align(),
        printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message} [${info.ms}] `
        )
      ),

    transports: [
      new winston.transports.Console(),
      new winston.transports.File(
        {
          filename: `logs/${filenamePassed}.log`,
          format:
            combine(
              uncolorize(),
              align(),
              timestamp(),
              ms(),
              customFormat
            )
        }),
      new winston.transports.File(
        {
          filename: `logs/${filenameFailed}.log`,
          format:
            combine(
              uncolorize(),
              align(),
              timestamp(),
              ms(),
              customFormat
            )
        }),
      new winston.transports.File(
        {
          filename: `logs/${filenameCombine}.log`,
          format:
            combine(
              uncolorize(),
              align(),
              timestamp(),
              ms(),
              customFormat
            )
        }),
    ],

  });
  return logger;
}


