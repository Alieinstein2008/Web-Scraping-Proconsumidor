import { baseDadosConsumidor, inputPathConsumidor } from "./databaseConsumidor.config";
import { Calendario } from "../lib/definitions";

const prefixoData = new Calendario().prefixoArquivoDataAtual();

const reclamacoesBairrosSuperendividamento = baseDadosConsumidor.superendividamento.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Reclamacao',
    baseComparativa: baseDadosConsumidor.superendividamentoComparativa
});

const consultasBairrosSuperendividamento = baseDadosConsumidor.superendividamento.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Consulta',
    baseComparativa: baseDadosConsumidor.superendividamentoComparativa
});

const denunciasBairrosSuperendividamento = baseDadosConsumidor.superendividamento.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Denuncia',
    baseComparativa: baseDadosConsumidor.superendividamentoComparativa
});

export const numerosAtendimentosBairrosSuperendividamento = [
    ...reclamacoesBairrosSuperendividamento,
    ...consultasBairrosSuperendividamento,
    ...denunciasBairrosSuperendividamento
];

export function carregarAlteracoesBaseConsumidorBairrosSuperendividamento(data: any[]): void {
    baseDadosConsumidor.superendividamento.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: 'Consumidor-Bairros-Superendividamento-Web-Scraping',
        nomeAba: `${prefixoData}Bairros`,
        inputPath: inputPathConsumidor
    })
};
/* 
const reclamacoesBairrosRegionais = baseDadosConsumidor.regionais.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Reclamacao',
    baseComparativa: baseDadosConsumidor.regionaisComparativa
});

const consultasBairrosRegionais = baseDadosConsumidor.regionais.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Consulta',
    baseComparativa: baseDadosConsumidor.regionaisComparativa
});

const denunciasBairrosRegionais = baseDadosConsumidor.regionais.obterDadosDivergentes({
    colunaHomologa: 'NumeroAtendimento',
    tipoNumeroAtendimento: 'Denuncia',
    baseComparativa: baseDadosConsumidor.regionaisComparativa
});

export const numerosAtendimentosBairrosRegionais = [
    ...reclamacoesBairrosRegionais,
    ...consultasBairrosRegionais,
    ...denunciasBairrosRegionais
];

export function carregarAlteracoesBaseConsumidorBairrosRegionais(data: any[]): void {
    baseDadosConsumidor.regionais.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: 'Consumidor-Bairros-Regionais-Web-Scraping',
        nomeAba: `${prefixoData}Bairros-Regionais`,
        inputPath: inputPathConsumidor
    })
}; */
