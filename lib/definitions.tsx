import { extrairBaseCompleta, extrairColunaBase, atualizarBase, extrairDivergenciasColunaBaseComparativa, extrairDadosBasePorValorColuna, realizarBackupBase } from "./functions";

export type UserInformation = {
    credential: string,
    password: string
}

export type TipoNumeroAtendimento = ('Reclamacao' | 'Denuncia' | 'Consulta');

export class NumeroAtendimento {
    protected numeroAtendimento: string;

    constructor(numeroAtendimento: string) {
        this.numeroAtendimento = numeroAtendimento;
    }

    public Formatacao(tipo: number): string {
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

export type TuplaInformacoesFailedCarta = [string, string, string, string, string, string, string]

export type TuplaInformacoesNulasCarta = [string, string, string, string, string, string]

export type TuplaInformacoesParciaisCarta = [string, string, string, string]

export class TratativaCarta {
    private fornecedor: string;
    private data: string;
    private prazo: string;
    private resposta: string;
    private numeroAtendimento: string;
    private situacao: string;
    private codFornecedor: string;
    private cnpj: string;
    private scraping: string;

    constructor(scraping: 'failed' | 'passed' | 'blank', numeroAtendimento: string, situacao: string, codFornecedor: string, cnpj: string, fornecedor: string, data: string, prazo: string, resposta: string) {
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

    public retornaEstrutura(tipo: number): EstruturaCarta {
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
                }
                return estrutura;
        }
    }
}

export class BaseDados {

    protected caminho: string;
    private baseModificada: any[] = [];

    constructor(caminho: string) {
        this.caminho = caminho;
        this.obterDadosGerais = extrairBaseCompleta.bind({ caminho: this.caminho });
        this.obterDadosColuna = extrairColunaBase.bind({ base: this.obterDadosGerais() });
        this.obterDadosDivergentes = extrairDivergenciasColunaBaseComparativa.bind({ basePrimaria: this });
        this.carregarAlteracoes = atualizarBase.bind({ base: this.obterDadosGerais() });
        this.criarFiltroColunaBase = extrairDadosBasePorValorColuna.bind({ base: this.obterDadosGerais() });
        this.executarBackup = realizarBackupBase.bind({ dadosBackup: this.obterDadosGerais() });
    }

    //Extração
    public obterDadosGerais: () => any[];
    public obterDadosColuna: (coluna: string) => any[];
    public obterDadosDivergentes: ({ }: { colunaHomologa: string, baseComparativa: BaseDados, tipoNumeroAtendimento?: TipoNumeroAtendimento }) => any[];
    public criarFiltroColunaBase: ({ }: { colunaFiltro: string, valorFiltro: string, colunaRetorno?: string, tipoNumeroAtendimento?: TipoNumeroAtendimento }) => any[];
    public executarBackup: ({ }: { nomeArquivo: string, nomeAba: string }) => void;

    //Transformação
    public selecionar(coluna: string): this {
        this.baseModificada = this.obterDadosColuna(coluna);
        return this;
    }

    public tipoNumeroAtendimento(tipo?: 'Reclamacao' | 'Consulta' | 'Denuncia'): this {
        const relacaoTipoNumerico = {
            'Consulta': '1',
            'Denuncia': '2',
            'Reclamacao': '3'
        };

        if (tipo !== undefined) {

            this.baseModificada = this.baseModificada.filter(elemento => elemento.slice(21, 22) == relacaoTipoNumerico[tipo]);
            this.baseModificada = this.baseModificada.map(elemento => elemento.slice(0, 22));
        }
        return this;
    }

    public obterRegistrosUltimosMeses({ quantidadeMeses }: { quantidadeMeses: number }): this {

        const dataBusca = new Calendario().data().subtrairMeses(quantidadeMeses);
        const diaMesAno: string[] = dataBusca.split('/');
        const mesBusca = diaMesAno[1];
        const anoBusca = diaMesAno[2].slice(2, 4);

        this.baseModificada = this.baseModificada.filter(elemento => elemento.slice(0, 2) == anoBusca && elemento.slice(3, 5) == mesBusca);

        return this;
    }

    public removerDuplicatas(): string[] {
        this.baseModificada = [...new Set(this.baseModificada)];
        return this.baseModificada;
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

export type EstruturaConsumidor = {
    NumeroAtendimento: string;
    CPF?: string;
    Nome?: string;
    Nascimento?: string;
    Sexo?: string;
    RacaCorEtnia?: string;
    NomeSocial?: string;
    CEP?: string;
    Logradouro?: string;
    ComplementoNumero?: string;
    Bairro?: string;
    Cidade?: string;
    UF?: string;
    Telefone?: string;
    Scraping: string;

}

export type TuplaInformacoesParciaisConsumidor = [string, string, string, string, string, string, string, string, string, string, string, string];

export type TuplaInformacoesFailedConsumidor = [string, string, string, string, string, string, string, string, string, string, string, string, string, string];

export class Consumidor {
    private NumeroAtendimento: string;
    private CPF: string;
    private Nome: string;
    private Nascimento: string;
    private Sexo: string;
    private RacaCorEtnia: string;
    private NomeSocial: string;
    private CEP: string;
    private Logradouro: string;
    private ComplementoNumero: string;
    private Bairro: string;
    private Cidade: string;
    private UF: string;
    private Telefone: string;
    private Scraping: string;


    constructor(scraping: 'failed' | 'passed', numeroAtendimento: string, cpf: string, nome: string, nascimento: string, sexo: string, racaCorEtnia: string, nomeSocial: string, cep: string, logradouro: string, complementoNumero: string, bairro: string, cidade: string, uf: string, telefone: string) {
        this.CPF = cpf;
        this.Nome = nome;
        this.Nascimento = nascimento;
        this.Sexo = sexo;
        this.RacaCorEtnia = racaCorEtnia;
        this.NomeSocial = nomeSocial;
        this.CEP = cep;
        this.Logradouro = logradouro;
        this.ComplementoNumero = complementoNumero;
        this.Bairro = bairro;
        this.Cidade = cidade;
        this.UF = uf;
        this.Telefone = telefone;
        this.Scraping = scraping;
        this.NumeroAtendimento = numeroAtendimento;
    };

    public retornaEstrutura(tipo: number): EstruturaConsumidor {
        switch (tipo) {
            default:
                const estrutura: EstruturaConsumidor = {
                    NumeroAtendimento: this.NumeroAtendimento,
                    Nome: this.Nome,
                    NomeSocial: this.NomeSocial,
                    CPF: this.CPF,
                    Nascimento: this.Nascimento,
                    RacaCorEtnia: this.RacaCorEtnia,
                    Sexo: this.Sexo,
                    CEP: this.CEP,
                    UF: this.UF,
                    Cidade: this.Cidade,
                    Bairro: this.Bairro,
                    Logradouro: this.Logradouro,
                    ComplementoNumero: this.ComplementoNumero,
                    Telefone: this.Telefone,
                    Scraping: this.Scraping
                };
                return estrutura;
        }
    }
}

export class Log {
    private NumeroAtendimento: string;
    private TempoExecucao: string;
    private Situacao: string;

    constructor(numeroAtendimento: string, tempoExecucao: string, situacao: string) {
        this.NumeroAtendimento = numeroAtendimento;
        this.TempoExecucao = tempoExecucao;
        this.Situacao = situacao;
    };
}