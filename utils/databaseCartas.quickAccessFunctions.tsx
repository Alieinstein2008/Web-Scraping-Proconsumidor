import { baseDadosCartas } from "./databaseCartas.config";

export function retornaReclamacoesDivergentes() {
    const reclamacoesDivergentes = baseDadosCartas.atual.obterDadosDivergentes({
        colunaHomologa: "NumeroAtendimento",
        baseComparativa: baseDadosCartas.comparativa,
        tipoNumeroAtendimento: 'Reclamacao'
    });
    return reclamacoesDivergentes;
};

export function retornaReclamacoesFalhas() {
    const reclamacoesFalhas = baseDadosCartas.atual.criarFiltroColunaBase({
        colunaFiltro: 'Scraping',
        valorFiltro: 'failed',
        colunaRetorno: 'NumeroAtendimento',
        tipoNumeroAtendimento: 'Reclamacao'
    });
    return reclamacoesFalhas;
};

export function retornaReclamacoesUltimos4Meses() {
    const reclamacoesUltimos4Meses = baseDadosCartas.atual.selecionar('NumeroAtendimento')
        .tipoNumeroAtendimento('Reclamacao')
        .obterRegistrosUltimosMeses({ quantidadeMeses: 4 })
        .removerDuplicatas();
    return reclamacoesUltimos4Meses;
};

export function executarBackupBaseCartas() {
    baseDadosCartas.atual.executarBackup({
        nomeArquivo: 'Cartas-Base-Web-Scraping(Backup)',
        nomeAba: 'Cartas(Backup)'
    });
    console.log('Backup Executado com sucesso! 🗃');
};

export function carregarAlteracoesBaseCartas(data: any[]) {
    baseDadosCartas.atual.carregarAlteracoes(
        data, 'Cartas-Base-Web-Scraping', 'All'
    )
};

export function salvarAlteracoesBaseCartas(signal: string, dados: any[]) {
    console.log(`\n${signal} recebido. Iniciando o carregamento de ${dados.length} novos itens ⏳`);
    carregarAlteracoesBaseCartas(dados);
    console.log('Finalizando processo.');
    process.exit(0);
};