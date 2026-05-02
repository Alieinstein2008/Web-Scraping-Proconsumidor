export interface EstruturaCarta {
    Fornecedor?: string;
    Data?: string;
    Prazo?: string;
    Resposta?: string;
    Situacao?: string;
    NumeroAtendimento?: string;
    CodigoFornecedor?: string;
    CNPJ?: string;
    Scraping?: string;
}

export type TuplaInformacoesFailedCarta = [string, string, string, string, string, string, string]

export type TuplaInformacoesNulasCarta = [string, string, string, string, string, string]

export type TuplaInformacoesParciaisCarta = [string, string, string, string]
