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
}

export class TratativaCarta {
    fornecedor: string;
    data: string;
    prazo: string;
    resposta: string;
    numeroAtendimento: NA;
    situacao: string;
    codFornecedor: string;

    constructor(numeroAtendimento: NA, situacao: string, codFornecedor: string, fornecedor: string, data: string, prazo: string, resposta: string) {
        this.fornecedor = fornecedor;
        this.data = data;
        this.prazo = prazo;
        this.resposta = resposta;
        this.numeroAtendimento = numeroAtendimento;
        this.situacao = situacao;
        this.codFornecedor = codFornecedor;
    }

    retornaEstrutura() {
        const obj: Carta = {
            Fornecedor: this.fornecedor,
            Data: this.data,
            Prazo: this.prazo,
            Resposta: this.resposta,
            Situacao: this.situacao,
            NumeroAtendimento: this.numeroAtendimento,
            CodigoFornecedor: this.codFornecedor
        };
        return obj;
    }
};