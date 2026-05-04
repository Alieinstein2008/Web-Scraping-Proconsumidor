export type EstruturaAudiencia = {
    NumeroAtendimento?: string;
    CodigoFornecedor?: string;
    DataAbertura?: string;
    Fornecedor?: string;
    Cnpj?: string;
    DataAudiencia?: string;
    Situacao?: string;
    Redesignacao?:string;
    Resultado?: string;
    ComparecimentoConsumidor?: string;
    ComparecimentoFornecedor?: string;
    RetornoFornecedor?: string;
    Scraping?: string;
}

export type TuplaInformacoesParciaisAudienciaFinalizada = [string, string, string, string]

export type TuplaInformacoesParciaisAudienciaCancelada = [string, string, string]

export type TuplaInformacoesNulasAudiencia = [string, string, string, string, string, string, string, string, string, string]

export type TuplaInformacoesFailedAudiencia = [string, string, string, string, string, string, string, string, string, string, string]
