import { baseDadosConsumidor, inputPathConsumidor } from "./databaseConsumidor.config";

const reclamacoes = baseDadosConsumidor.regionaisComparativa.selecionar('Número de Atendimento').tipoNumeroAtendimento('Reclamacao').removerDuplicatas();
const denuncias = baseDadosConsumidor.regionaisComparativa.selecionar('Número de Atendimento').tipoNumeroAtendimento('Denuncia').removerDuplicatas();
const consultas = baseDadosConsumidor.regionaisComparativa.selecionar('Número de Atendimento').tipoNumeroAtendimento('Consulta').removerDuplicatas();

export const numerosAtendimentosBairrosRegionais = [...reclamacoes, ...consultas, ...denuncias];

export function carregarAlteracoesBaseConsumidorBairrosRegionais(data: any[]): void {
    baseDadosConsumidor.regionais.carregarAlteracoes({
        novosDados: data,
        nomeArquivo: 'Consumidor-Bairros-Regionais-Web-Scraping',
        nomeAba: 'Hoje',
        inputPath: inputPathConsumidor
    })
};
