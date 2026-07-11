import winston from "winston";

import { customLogLevels } from "./levels";
import { createTransports } from "./transports";

export function createLogger(config: {
  filenameCombine: string;
  filenamePassed?: string;
  filenameFailed?: string;
  filenameBlank?: string;
}) {
  return winston.createLogger({
    levels: customLogLevels.levels,
    transports: createTransports(config),
  });
}