import dotenv from 'dotenv';
import { baseDadosCartas, inputPathCartas, outputPathCartas } from "./databaseCartas.config";
import { prefixoArquivo } from ".";

dotenv.config();

const organizedMapping = {
    baseDadosPrimaria: baseDadosCartas.primaria,
    baseDadosComparativa: baseDadosCartas.comparativa,
    inputPath: inputPathCartas,
    outputPath: outputPathCartas,
    colunaHomologa: 'NumeroAtendimento',
    nomeArquivoEntrada: 'Cartas-Web-Scraping',
    nomeArquivoBackup: `${prefixoArquivo}Cartas-Web-Scraping(Backup)`,
    nomeAba: `${prefixoArquivo}Cartas`
}

const reclamacoes = organizedMapping.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMapping.colunaHomologa,
    tipoNumeroAtendimento: 'Reclamacao',
    baseComparativa: organizedMapping.baseDadosComparativa
});     

const consultas = organizedMapping.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMapping.colunaHomologa,
    tipoNumeroAtendimento: 'Consulta',
    baseComparativa: organizedMapping.baseDadosComparativa
});

const denuncias = organizedMapping.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMapping.colunaHomologa,
    tipoNumeroAtendimento: 'Denuncia',
    baseComparativa: organizedMapping.baseDadosComparativa
});


export const numerosAtendimentos = [
    ...reclamacoes,
    ...consultas,
    ...denuncias
];

export function carregarAlteracoes(data: any[]): void {
    organizedMapping.baseDadosPrimaria.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: organizedMapping.nomeArquivoEntrada,
        nomeAba: organizedMapping.nomeAba,
        inputPath: organizedMapping.inputPath
    })
};

export function salvarAlteracoes(signal: string, data: any[]): void {
    console.log(`\n${signal} recebido. Iniciando o carregamento de ${data.length} novos itens ⏳`);
    carregarAlteracoes(data);
    console.log('Finalizando processo.');
    process.exit(0);
};

export function executarBackup() {
    console.log('Iniciando processo de backup da base de dados primária ⏳');
    organizedMapping.baseDadosPrimaria.executarBackup({
        nomeArquivo: organizedMapping.nomeArquivoBackup,
        nomeAba: organizedMapping.nomeAba,
        outputPath: organizedMapping.outputPath
    });
    console.log('Backup concluído com sucesso. Finalizando processo.');
}
