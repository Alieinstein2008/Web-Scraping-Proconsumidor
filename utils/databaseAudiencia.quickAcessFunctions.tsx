import { baseDadosAudiencia} from  "./databaseAudiencia.config";
import { inputPathAudiencia, outputPathAudiencia } from "./databaseAudiencia.config";
import { Calendario } from "../lib/definitions";

export function executarBackupBaseAudiencia(): void {
    const prefixoArquivo = new Calendario().prefixoArquivoDataAtual();
    baseDadosAudiencia.atual.executarBackup({
        nomeArquivo: `${prefixoArquivo}Audiencias-Base-Web-Scraping(Backup)`,
        nomeAba: `${prefixoArquivo}Audiencias(Backup)`,
        outputPath: outputPathAudiencia
    });
};
