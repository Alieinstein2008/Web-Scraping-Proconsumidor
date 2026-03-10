import { setDefaultFilesPath } from "../config/filePath.config";
import { BaseDados } from "../lib/definitions";

let inputPathCartas: string = '';
let outputPathCartas: string = '';
let filesPathCartas: string[] = [];

const config = setDefaultFilesPath({
    directoryInputRelativePath: '../data/in/Cartas',
    directoryOutputRelativePath: '../data/out/Cartas',
    inputFilenames: [
        'Cartas-Base-Web-Scraping.xlsx',
        'Cartas-Base-Bi-Comparativa.xlsx'
    ]
});

if (config.sucess) {
    inputPathCartas = config.directoryInputPath;
    outputPathCartas = config.directoryOutputPath;
    filesPathCartas = config.filesPath;
};

export { inputPathCartas, outputPathCartas, filesPathCartas };

export const baseDadosCartas = {
    atual: new BaseDados(filesPathCartas[0]),
    comparativa: new BaseDados(filesPathCartas[1])
};