import dotenv from 'dotenv';
import { prefixoArquivo } from ".";
import { baseDadosAudiencia, inputPathAudiencia, outputPathAudiencia } from "./databaseAudiencia.config";
dotenv.config();

export const organizedMappingAudiencia = {
    baseDadosPrimaria: baseDadosAudiencia.primaria,
    baseDadosComparativa: baseDadosAudiencia.comparativa,
    inputPath: inputPathAudiencia,
    outputPath: outputPathAudiencia,
    colunaHomologa: 'NumeroAtendimento',
    nomeArquivoEntrada: 'Audiencias-Web-Scraping',
    nomeArquivoBackup: `${prefixoArquivo}Audiencias-Web-Scraping(Backup)`,
    nomeAba: `${prefixoArquivo}Audiencias`
}

const reclamacoes = organizedMappingAudiencia.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMappingAudiencia.colunaHomologa,
    tipoNumeroAtendimento: 'Reclamacao',
    baseComparativa: organizedMappingAudiencia.baseDadosComparativa
});

const consultas = organizedMappingAudiencia.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMappingAudiencia.colunaHomologa,
    tipoNumeroAtendimento: 'Consulta',
    baseComparativa: organizedMappingAudiencia.baseDadosComparativa
});

const denuncias = organizedMappingAudiencia.baseDadosPrimaria.obterDadosDivergentes({
    colunaHomologa: organizedMappingAudiencia.colunaHomologa,
    tipoNumeroAtendimento: 'Denuncia',
    baseComparativa: organizedMappingAudiencia.baseDadosComparativa
});


export const numerosAtendimentos = [
    ...reclamacoes,
    ...consultas,
    ...denuncias
];

export function carregarAlteracoes(data: any[]): void {
    organizedMappingAudiencia.baseDadosPrimaria.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: organizedMappingAudiencia.nomeArquivoEntrada,
        nomeAba: organizedMappingAudiencia.nomeAba,
        inputPath: organizedMappingAudiencia.inputPath
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
    organizedMappingAudiencia.baseDadosPrimaria.executarBackup({
        nomeArquivo: organizedMappingAudiencia.nomeArquivoBackup,
        nomeAba: organizedMappingAudiencia.nomeAba,
        outputPath: organizedMappingAudiencia.outputPath
    });
    console.log('Backup concluído com sucesso. Finalizando processo.');
}
