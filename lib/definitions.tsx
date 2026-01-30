export type UserInformation = {
    credential: string,
    password: string
}

export type NA = string;

export type Carta = {
    Fornecedor: string;
    Data: string;
    Prazo: string;
    Resposta: string;
    Situacao: string;
    NumeroAtendimento: NA;
    CodigoFornecedor: string;
    CNPJ: string;
}

export class TratativaCarta {
    fornecedor: string;
    data: string;
    prazo: string;
    resposta: string;
    numeroAtendimento: NA;
    situacao: string;
    codFornecedor: string;
    cnpj: string;

    constructor(numeroAtendimento: NA, situacao: string, codFornecedor: string, cnpj: string, fornecedor: string, data: string, prazo: string, resposta: string) {
        this.fornecedor = fornecedor;
        this.data = data;
        this.prazo = prazo;
        this.resposta = resposta;
        this.numeroAtendimento = numeroAtendimento;
        this.situacao = situacao;
        this.codFornecedor = codFornecedor;
        this.cnpj = cnpj;
    }

    retornaEstrutura(tipo: number) {
        switch (tipo) {
            default:
                const estrutura: Carta = {
                    NumeroAtendimento: this.numeroAtendimento,
                    CodigoFornecedor: this.codFornecedor,
                    Fornecedor: this.fornecedor,
                    CNPJ: this.cnpj,
                    Data: this.data,
                    Prazo: this.prazo,
                    Resposta: this.resposta,
                    Situacao: this.situacao,
                };
                return estrutura;
        }

    }
};