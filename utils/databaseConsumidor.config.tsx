import { setDefaultFilesPath } from "../config/filePath.config";
import { BaseDados } from "../lib/definitions";

let inputPathConsumidor: string = '';
let outputPathConsumidor: string = '';
let filesPathConsumidor: string[] = [];

const config = setDefaultFilesPath({
    directoryInputRelativePath: '../data/in/Consumidor',
    directoryOutputRelativePath: '../data/out/Consumidor',
    inputFilenames: [
        'Consumidor-Web-Scraping.xlsx',
        'Consumidor-Comparativa.xlsx',
        ]
});

if (config.sucess) {
    inputPathConsumidor = config.directoryInputPath;
    outputPathConsumidor = config.directoryOutputPath;
    filesPathConsumidor = config.filesPath;
};

export { inputPathConsumidor, outputPathConsumidor, filesPathConsumidor };

export const baseDadosConsumidor = {
    primaria: new BaseDados(filesPathConsumidor[0]),
    comparativa: new BaseDados(filesPathConsumidor[1]),
    };