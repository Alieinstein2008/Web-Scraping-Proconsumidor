import dotenv from 'dotenv';
import { prefixoArquivo } from ".";
import { baseDadosConsumidor, inputPathConsumidor, outputPathConsumidor } from "./databaseConsumidor.config";

dotenv.config();

export const organizedMappingConsumidor = {
    baseDadosPrimaria: baseDadosConsumidor.primaria,
    baseDadosComparativa: baseDadosConsumidor.comparativa,
    inputPath: inputPathConsumidor,
    outputPath: outputPathConsumidor,
    colunaHomologa: 'NumeroAtendimento',
    nomeArquivoEntrada: 'Consumidor-Web-Scraping',
    nomeArquivoBackup: `${prefixoArquivo}Consumidor-Base-Web-Scraping(Backup)`,
    nomeAba: `${prefixoArquivo}Consumidor`
}

const reclamacoes = organizedMappingConsumidor.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMappingConsumidor.colunaHomologa,
    tipoNumeroAtendimento: 'Reclamacao',
    baseComparativa: organizedMappingConsumidor.baseDadosComparativa
});

const consultas = organizedMappingConsumidor.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMappingConsumidor.colunaHomologa,
    tipoNumeroAtendimento: 'Consulta',
    baseComparativa: organizedMappingConsumidor.baseDadosComparativa
});

const denuncias = organizedMappingConsumidor.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMappingConsumidor.colunaHomologa,
    tipoNumeroAtendimento: 'Denuncia',
    baseComparativa: organizedMappingConsumidor.baseDadosComparativa
});


export const numerosAtendimentos = [
    ...reclamacoes,
    ...consultas,
    ...denuncias
];

export function carregarAlteracoes(data: any[]): void {
    organizedMappingConsumidor.baseDadosPrimaria.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: organizedMappingConsumidor.nomeArquivoEntrada,
        nomeAba: organizedMappingConsumidor.nomeAba,
        inputPath: organizedMappingConsumidor.inputPath
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
    organizedMappingConsumidor.baseDadosPrimaria.executarBackup({
        nomeArquivo: organizedMappingConsumidor.nomeArquivoBackup,
        nomeAba: organizedMappingConsumidor.nomeAba,
        outputPath: organizedMappingConsumidor.outputPath
    });
    console.log('Backup concluído com sucesso. Finalizando processo.');
}