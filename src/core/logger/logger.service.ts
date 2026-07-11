import winston from "winston";
import { createLogger } from "./logger";

const existingCustomLevels = ['failed', 'passed', 'blank'];

export class LoggerService {

    private readonly logger: winston.Logger | undefined;

    constructor(loggerFilename: string) {
        this.logger = createLogger({
            filenamePassed: `${loggerFilename}-passed`,
            filenameFailed: `${loggerFilename}-failed`,
            filenameCombine: `${loggerFilename}-combine`,
            filenameBlank: `${loggerFilename}-blank`,
        });
    }

    public info(message: string, meta?: object) {
        this.logger?.info(message, meta);
    }

    public error(message: string, error?: Error) {
        this.logger?.error(message, error);
    }

    public warn(message: string) {
        this.logger?.warn(message);
    }

    public debug(message: string) {
        this.logger?.debug(message);
    }

    public log(message: string, level: typeof existingCustomLevels[number], meta?: Object) {
        if (!existingCustomLevels.includes(level)) this.warn(`[INVALID LEVEL] - ${message}`);
        else this.logger?.log(level, message);
    }
}