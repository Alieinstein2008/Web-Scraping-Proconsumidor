import { baseDadosAudiencia} from  "./databaseAudiencia.config";
import { inputPathAudiencia, outputPathAudiencia } from "./databaseAudiencia.config";
import { Calendario } from "../lib/definitions";

export const NA = baseDadosAudiencia.atual.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Reclamacao',
    baseComparativa: baseDadosAudiencia.comparativa
});

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

export function retornaTodasReclamacoesDivergentes(): any[] {
    const reclamacoesDivergentes = baseDadosAudiencia.atual.obterDadosDivergentes({
        colunaHomologa: "NumeroAtendimento",
        baseComparativa: baseDadosAudiencia.comparativa,
        tipoNumeroAtendimento: 'Reclamacao'
    });
    return reclamacoesDivergentes;
};

export function retornaReclamacoesFalhas(): any[] {
    const reclamacoesFalhas = baseDadosAudiencia.atual.criarFiltroColunaBase({
        colunaFiltro: 'Scraping',
        valorFiltro: 'failed',
        colunaRetorno: 'NumeroAtendimento',
        tipoNumeroAtendimento: 'Reclamacao'
    });
    return reclamacoesFalhas;
};

export function executarBackupBaseAudiencia(): void {
    const prefixoArquivo = new Calendario().prefixoArquivoDataAtual();
    baseDadosAudiencia.atual.executarBackup({
        nomeArquivo: `${prefixoArquivo}Audiencias-Base-Web-Scraping(Backup)`,
        nomeAba: `${prefixoArquivo}Audiencias(Backup)`,
        outputPath: outputPathAudiencia
    });
};
export function carregarAlteracoesBaseAudiencia(data: any[]): void {
    baseDadosAudiencia.atual.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: 'Audiencias-Base-Web-Scraping',
        nomeAba: 'All',
        inputPath: inputPathAudiencia
    })
};

export function salvarAlteracoesBaseAudiencia(signal: string, dados: any[]): void {
    console.log(`\n${signal} recebido. Iniciando o carregamento de ${dados.length} novos itens ⏳`);
    carregarAlteracoesBaseAudiencia(dados);
    console.log('Finalizando processo.');
    process.exit(0);
};
