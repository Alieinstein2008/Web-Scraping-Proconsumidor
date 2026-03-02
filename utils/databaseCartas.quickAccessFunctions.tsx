import { Calendario } from "../lib/definitions";
import { baseDadosCartas } from "./databaseCartas.config";

export function retornaReclamacoesDivergentes(): any[] {
    const reclamacoesDivergentes = baseDadosCartas.atual.obterDadosDivergentes({
        colunaHomologa: "NumeroAtendimento",
        baseComparativa: baseDadosCartas.comparativa,
        tipoNumeroAtendimento: 'Reclamacao'
    });
    return reclamacoesDivergentes;
};

export function retornaReclamacoesFalhas(): any[] {
    const reclamacoesFalhas = baseDadosCartas.atual.criarFiltroColunaBase({
        colunaFiltro: 'Scraping',
        valorFiltro: 'failed',
        colunaRetorno: 'NumeroAtendimento',
        tipoNumeroAtendimento: 'Reclamacao'
    });
    return reclamacoesFalhas;
};

export function retornaReclamacoesUltimos4Meses(): any[] {
    const reclamacoesUltimos4Meses = baseDadosCartas.atual.selecionar('NumeroAtendimento')
        .tipoNumeroAtendimento('Reclamacao')
        .obterRegistrosUltimosMeses({ quantidadeMeses: 4 })
        .removerDuplicatas();
    return reclamacoesUltimos4Meses;
};

export function executarBackupBaseCartas(): void {
    const prefixoArquivo = new Calendario().prefixoArquivoDataAtual();
    baseDadosCartas.atual.executarBackup({
        nomeArquivo: `Cartas/${prefixoArquivo}Cartas-Base-Web-Scraping(Backup)`,
        nomeAba: `${prefixoArquivo}Cartas(Backup)`
    });
};

export function carregarAlteracoesBaseCartas(data: any[]): void {
    baseDadosCartas.atual.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: 'Cartas-Base-Web-Scraping',
        nomeAba: 'All'
    })
};

export function salvarAlteracoesBaseCartas(signal: string, dados: any[]): void {
    console.log(`\n${signal} recebido. Iniciando o carregamento de ${dados.length} novos itens ⏳`);
    carregarAlteracoesBaseCartas(dados);
    console.log('Finalizando processo.');
    process.exit(0);
};