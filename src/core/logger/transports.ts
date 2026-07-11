import winston from "winston";
import { levelFilter, jsonFormat } from "./formats";

const { combine, timestamp, uncolorize, align, ms } = winston.format;

const baseFormat = combine(
  uncolorize(),
  align(),
  timestamp(),
  ms(),
  jsonFormat
);

function createFileTransport(filename: string, level?: string) {
  return new winston.transports.File({
    filename: `logs/${filename}.log`,
    format: level
      ? combine(levelFilter(level), baseFormat)
      : baseFormat,
  });
}

export function createTransports({
  filenamePassed,
  filenameFailed,
  filenameBlank,
  filenameCombine,
}: {
  filenameCombine: string;
  filenamePassed?: string;
  filenameFailed?: string;
  filenameBlank?: string;
}) {
  return [
    new winston.transports.Console(),
    createFileTransport(filenameCombine),
    createFileTransport(filenamePassed!, "passed"),
    createFileTransport(filenameFailed!, "failed"),
    createFileTransport(filenameBlank!, "blank"),

  ];
}