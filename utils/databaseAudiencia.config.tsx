import { setDefaultFilesPath } from "../config/filePath.config";
import { BaseDados } from "../lib/definitions";

let inputPathAudiencia: string = '';
let outputPathAudiencia: string = '';
let filesPathAudiencia: string[] = [];

const config = setDefaultFilesPath({
    directoryInputRelativePath: '../data/in/Audiencia',
    directoryOutputRelativePath: '../data/out/Audiencia',
    inputFilenames: [
        'Audiencias-Base-Web-Scraping.xlsx',
        'Audiencias-Base-Bi-Comparativa.xlsx'
    ]
});

if (config.sucess) {
    inputPathAudiencia = config.directoryInputPath;
    outputPathAudiencia = config.directoryOutputPath;
    filesPathAudiencia = config.filesPath;
};

export { inputPathAudiencia, outputPathAudiencia, filesPathAudiencia };

export const baseDadosAudiencia = {
    atual: new BaseDados(filesPathAudiencia[0]),
    comparativa: new BaseDados(filesPathAudiencia[1])
};