import { setDefaultFilesPath } from "../config/filePath.config";
import { BaseDados } from "../lib/definitions";

let inputPathAssuntosProblemas: string = '';
let outputPathAssuntosProblemas: string = '';
let filesPathAssuntosProblemas: string[] = [];

const config = setDefaultFilesPath({
    directoryInputRelativePath: '../data/in/AssuntosProblemas',
    directoryOutputRelativePath: '../data/out/AssuntosProblemas',
    inputFilenames: [
        'AssuntosProblemas-Base-Web-Scraping.xlsx',
        'AssuntosProblemas-Base-Comparativa.xlsx'
    ]
});

if (config.sucess) {
    inputPathAssuntosProblemas = config.directoryInputPath;
    outputPathAssuntosProblemas = config.directoryOutputPath;
    filesPathAssuntosProblemas = config.filesPath;
};

export { inputPathAssuntosProblemas, outputPathAssuntosProblemas, filesPathAssuntosProblemas };

export const baseDadosAssuntosProblemas = {
    atual: new BaseDados(filesPathAssuntosProblemas[0]),
    comparativa: new BaseDados(filesPathAssuntosProblemas[1])
};