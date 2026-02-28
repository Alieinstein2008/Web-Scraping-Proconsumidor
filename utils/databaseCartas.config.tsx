import { createDirectoriesInRoot, dirnameInput, dirnameOutput } from "../config/directories.config";
import { BaseDados } from "../lib/definitions";

(async () => {
    await createDirectoriesInRoot({
        dirnameInput: dirnameInput,
        dirnameOutput: dirnameOutput
    });
})();

export const baseDadosCartas = {
    atual: new BaseDados(`${dirnameInput}/Cartas/Cartas-Base-Web-Scraping.xlsx`),
    comparativa: new BaseDados(`${dirnameInput}/Cartas/Cartas-Base-Bi-Comparativa.xlsx`)
};