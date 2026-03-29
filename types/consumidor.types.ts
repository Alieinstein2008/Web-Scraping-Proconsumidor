export type EstruturaConsumidor = {
    NumeroAtendimento: string;
    CPF?: string;
    Nome?: string;
    Nascimento?: string;
    Sexo?: string;
    RacaCorEtnia?: string;
    NomeSocial?: string;
    CEP?: string;
    Latitude?: string;
    Longitude?: string;
    Logradouro?: string;
    ComplementoNumero?: string;
    Bairro?: string;
    Cidade?: string;
    UF?: string;
    Telefone?: string;
    CNPJ?: string;
    RazaoSocial?: string;
    Scraping?: string;

}

export type TuplaInformacoesParciaisConsumidorPessoaFisica = [string, string, string, string, string, string, string, string, string, string, string, string];

export type TuplaInformacoesParciaisConsumidorPessoaJuridica = [string, string, string, string, string, string, string, string];

export type TuplaInformacoesFailedConsumidor = [string, string, string, string, string, string, string, string, string, string, string, string, string, string];

export type TuplaInfomacoesNulasConsumidor = [string, string, string, string, string, string, string, string, string, string, string, string, string, string];
