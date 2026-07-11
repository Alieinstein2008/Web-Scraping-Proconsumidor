import winston from "winston";

const { printf } = winston.format;

export const levelFilter = (level: string) =>
  winston.format((info) => (info.level === level ? info : false))();

export const jsonFormat = printf(
  ({ level, message, timestamp, ms, ...metadata }) =>
    JSON.stringify({
      level,
      message,
      timestamp,
      ms,
      ...metadata,
    })
);