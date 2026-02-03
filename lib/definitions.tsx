export type UserInformation = {
    credential: string,
    password: string
}

export type EstruturaCarta = {
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

export class NumeroAtendimento {
    numeroAtendimento: string;

    constructor(numeroAtendimento: string) {
        this.numeroAtendimento = numeroAtendimento;
    }

    Formatacao(tipo: number) {
        switch (tipo) {
            case 1:
                return this.numeroAtendimento.slice(0, 22);
            case 2:
                return this.numeroAtendimento.slice(0, 22).replace(/[^a-zA-Z0-9]/g, "");
            default:
                return this.numeroAtendimento;
        }
    }
}


export class TratativaCarta {
    fornecedor: string;
    data: string;
    prazo: string;
    resposta: string;
    numeroAtendimento: string;
    situacao: string;
    codFornecedor: string;
    cnpj: string;
    scraping: string;


    constructor(scraping: 'failed' | 'passed',numeroAtendimento: string, situacao: string, codFornecedor: string, cnpj: string, fornecedor: string, data: string, prazo: string, resposta: string) {
        this.fornecedor = fornecedor;
        this.data = data;
        this.prazo = prazo;
        this.resposta = resposta;
        this.numeroAtendimento = numeroAtendimento;
        this.situacao = situacao;
        this.codFornecedor = codFornecedor;
        this.cnpj = cnpj;
        this.scraping = scraping;
    }

    retornaEstrutura(tipo: number) {
        switch (tipo) {
            default:
                const estrutura: EstruturaCarta = {
                    NumeroAtendimento: this.numeroAtendimento,
                    CodigoFornecedor: this.codFornecedor,
                    Fornecedor: this.fornecedor,
                    CNPJ: this.cnpj,
                    Data: this.data,
                    Prazo: this.prazo,
                    Resposta: this.resposta,
                    Situacao: this.situacao,
                    Scraping:this.scraping
                };
                return estrutura;
        }

    }
};