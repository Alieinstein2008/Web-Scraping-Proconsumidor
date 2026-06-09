import dotenv from 'dotenv';
import { baseDadosCartas, inputPathCartas, outputPathCartas } from "./databaseCartas.config";
import { prefixoArquivo } from ".";

dotenv.config();
export function carregarDadosColunaCartas(nomeColuna:string) {
    return {
        baseDadosPrimaria: baseDadosCartas.primaria,
        baseDadosComparativa: baseDadosCartas.comparativa,
        inputPath: inputPathCartas,
        outputPath: outputPathCartas,
        colunaHomologa: nomeColuna,
        nomeArquivoEntrada: 'Cartas-Web-Scraping',
        nomeArquivoBackup: `${prefixoArquivo}Cartas-Web-Scraping(Backup)`,
        nomeAba: `${prefixoArquivo}Cartas`
    };
}

export function obterNumerosAtendimentos(colunaHomologa: string) {
    const organizedMappingCarta = carregarDadosColunaCartas(colunaHomologa);

    console.log('Coluna homologada para o scraper de cartas:', organizedMappingCarta.colunaHomologa);

    const reclamacoes = organizedMappingCarta.baseDadosPrimaria.obterDadosDivergentes({
        colunaHomologa: organizedMappingCarta.colunaHomologa,
        tipoNumeroAtendimento: 'Reclamacao',
        baseComparativa: organizedMappingCarta.baseDadosComparativa
    });

    const consultas = organizedMappingCarta.baseDadosPrimaria.obterDadosDivergentes({
        colunaHomologa: organizedMappingCarta.colunaHomologa,
        tipoNumeroAtendimento: 'Consulta',
        baseComparativa: organizedMappingCarta.baseDadosComparativa
    });

    const denuncias = organizedMappingCarta.baseDadosPrimaria.obterDadosDivergentes({
        colunaHomologa: organizedMappingCarta.colunaHomologa,
        tipoNumeroAtendimento: 'Denuncia',
        baseComparativa: organizedMappingCarta.baseDadosComparativa
    });

    return [
        ...reclamacoes,
        ...consultas,
        ...denuncias
    ];
}

export function carregarAlteracoes(data: any[]): void {
    const organizedMappingCarta = carregarDadosColunaCartas('NumeroAtendimento');   
    organizedMappingCarta.baseDadosPrimaria.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: organizedMappingCarta.nomeArquivoEntrada,
        nomeAba: organizedMappingCarta.nomeAba,
        inputPath: organizedMappingCarta.inputPath
    })
};

export function salvarAlteracoes(signal: string, data: any[]): void {
    console.log(`\n${signal} recebido. Iniciando o carregamento de ${data.length} novos itens ⏳`);
    carregarAlteracoes(data);
    console.log('Finalizando processo.');
    process.exit(0);
};

export function executarBackup() {
    const organizedMappingCarta = carregarDadosColunaCartas('NumeroAtendimento');
    console.log('Iniciando processo de backup da base de dados primária ⏳');
    organizedMappingCarta.baseDadosPrimaria.executarBackup({
        nomeArquivo: organizedMappingCarta.nomeArquivoBackup,
        nomeAba: organizedMappingCarta.nomeAba,
        outputPath: organizedMappingCarta.outputPath
    });
    console.log('Backup concluído com sucesso. Finalizando processo.');
}
const databaseCartasQuickAccess = {
    carregarDadosColunaCartas,
    obterNumerosAtendimentos,
    carregarAlteracoes,
    salvarAlteracoes,
    executarBackup
};

export default databaseCartasQuickAccess;