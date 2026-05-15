import { setDefaultFilesPath } from "../config/filePath.config";
import { BaseDados } from "../lib/definitions";

let inputPathAudiencia: string = '';
let outputPathAudiencia: string = '';
let filesPathAudiencia: string[] = [];

const config = setDefaultFilesPath({
    directoryInputRelativePath: '../data/in/Audiencia',
    directoryOutputRelativePath: '../data/out/Audiencia',
    inputFilenames: [
        'Audiencias-Web-Scraping.xlsx',
        'Audiencias-Comparativa.xlsx'
    ]
});

if (config.sucess) {
    inputPathAudiencia = config.directoryInputPath;
    outputPathAudiencia = config.directoryOutputPath;
    filesPathAudiencia = config.filesPath;
};

export { inputPathAudiencia, outputPathAudiencia, filesPathAudiencia };

export const baseDadosAudiencia = {
    primaria: new BaseDados(filesPathAudiencia[0]),
    comparativa: new BaseDados(filesPathAudiencia[1])
};