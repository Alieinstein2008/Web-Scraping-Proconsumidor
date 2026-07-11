import winston from "winston";

export const customLogLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    passed: 3,
    failed: 4,
    blank: 5,
  },
  colors: {
    error: "bold white redBG",
    warn: "bold magenta",
    info: "bold white",
    passed: "bold green",
    failed: "bold red",
    blank: "bold yellow",
  },
};

winston.addColors(customLogLevels.colors);