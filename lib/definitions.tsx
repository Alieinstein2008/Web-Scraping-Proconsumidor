import { extrairBaseCompleta, extrairColunaBase, atualizarBase } from "./functions";

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


    constructor(scraping: 'failed' | 'passed', numeroAtendimento: string, situacao: string, codFornecedor: string, cnpj: string, fornecedor: string, data: string, prazo: string, resposta: string) {
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
                    Scraping: this.scraping
                };
                return estrutura;
        }

    }
}

export class BaseDados {

    protected caminho: string;
    private baseModificada: any[] = [];

    constructor(caminho: string) {
        this.caminho = caminho;
        this.obterDadosGerais = extrairBaseCompleta.bind(this);
        this.obterDadosColuna = extrairColunaBase.bind({ base: this.obterDadosGerais() });
        this.carregarAlteracoes = atualizarBase.bind({ base: this.obterDadosGerais() });

    }

    //Extração
    public obterDadosGerais: () => any[];
    public obterDadosColuna: (coluna: string) => any[];

    //Transformação
    public filtrar(coluna: string): this {
        this.baseModificada = this.obterDadosColuna(coluna);
        return this;
    }

    public removerDuplicatas(): this {
        this.baseModificada = [...new Set(this.baseModificada)];
        return this;
    }

    public quantificarDados(): number {
        return this.baseModificada.length;
    }

    //Carga
    public carregarAlteracoes: (novosDados: any, nomeArquivo: string, nomeAba: string) => void;


}

export class Calendario {

    public dataAtual: any = new Date().toLocaleDateString();

    public data(): this {
        this.dataAtual = new Date();
        return this;
    }

    public subtrairMeses(meses: number) {
        
        const data = this.dataAtual;
        const dia = data.getDate();

        data.setDate(1);

        const mes = new Date(data).getMonth();

        data.setMonth(mes - meses);

        const ultimoDia = new Date(
            data.getFullYear(),
            data.getMonth() + 1,
            0
        ).getDate();

        data.setDate(Math.min(dia, ultimoDia));

        return new Date(data).toLocaleDateString();

    }

}