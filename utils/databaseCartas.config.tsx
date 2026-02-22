import { createDirectoriesInRoot } from "../config/directories.config";
import { BaseDados } from "../lib/definitions";

const dirnameInput = 'data/in';
const dirnameOutput = 'data/out';

await createDirectoriesInRoot({
    dirnameInput: dirnameInput,
    dirnameOutput: dirnameOutput
});

export const baseDadosCartas = {
    atual: new BaseDados(`${dirnameInput}/Cartas-Base-Web-Scraping.xlsx`),
    comparativa: new BaseDados(`${dirnameInput}/Base-Bi-WebScraping-Cartas-NA(comparativa).xlsx`)
};
