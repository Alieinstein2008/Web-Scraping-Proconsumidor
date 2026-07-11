import winston from "winston";
const { combine, timestamp, printf, colorize, uncolorize, align, ms } = winston.format;

const levelFilter = (level: string) => winston.format((info, opt) => {
  return info.level === level ? info : false;
})();

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
    error: 'bold white redBG',
    warn: 'bold magenta',
    info: 'bold white',
    passed: 'bold green',
    failed: 'bold red',
    blank: 'bold yellow'
  }
};

winston.addColors(customLogLevels.colors);

export function createLogger({ filenamePassed, filenameFailed, filenameBlank, filenameCombine }: { filenameCombine: string, filenamePassed?: string, filenameFailed?: string, filenameBlank?: string }): winston.Logger {

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
      new winston.transports.File(
        {
          filename: `logs/${filenamePassed}.log`,
          format:
            combine(
              uncolorize(),
              levelFilter('passed'),
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
              levelFilter('failed'),
              align(),
              timestamp(),
              ms(),
              customFormat
            )
        }),
      new winston.transports.File(
        {
          filename: `logs/${filenameBlank}.log`,
          format:
            combine(
              uncolorize(),
              levelFilter('blank'),
              align(),
              timestamp(),
              ms(),
              customFormat
            )
        })
    ],

  });
  return logger;
}


