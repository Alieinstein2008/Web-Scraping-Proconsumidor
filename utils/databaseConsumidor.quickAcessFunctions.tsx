import { baseDadosConsumidor, inputPathConsumidor } from "./databaseConsumidor.config";

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
        nomeAba: 'Hoje',
        inputPath: inputPathConsumidor
    })
};
