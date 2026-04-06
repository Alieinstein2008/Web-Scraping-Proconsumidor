import { baseDadosAudiencia} from  "./databaseAudiencia.config";
import { inputPathAudiencia, outputPathAudiencia } from "./databaseAudiencia.config";
import { Calendario } from "../lib/definitions";

export function retornaReclamacoesDivergentesPeriodo({ dataInicial, dataFinal }: { dataInicial?: string, dataFinal?: string }): any[] {
    const reclamacoesDivergentes = baseDadosAudiencia.atual.obterDadosDivergentes({
        colunaHomologa: "NumeroAtendimento",
        baseComparativa: baseDadosAudiencia.comparativa,
        tipoNumeroAtendimento: 'Reclamacao',
        dataInicial: dataInicial,
        dataFinal: dataFinal
    });
    return reclamacoesDivergentes;
};

export function executarBackupBaseAudiencia(): void {
    const prefixoArquivo = new Calendario().prefixoArquivoDataAtual();
    baseDadosAudiencia.atual.executarBackup({
        nomeArquivo: `${prefixoArquivo}Audiencias-Base-Web-Scraping(Backup)`,
        nomeAba: `${prefixoArquivo}Audiencias(Backup)`,
        outputPath: outputPathAudiencia
    });
};
