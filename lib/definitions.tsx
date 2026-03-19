import { extrairBaseCompleta, extrairColunaBase, atualizarBase, extrairDivergenciasColunaBaseComparativa, extrairDadosBasePorValorColuna, realizarBackupBase, extrairDadosBasePorOrdenamentoCronologicoNumeroAtendimento } from "./functions";

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
    private codigoFornecedor: string;
    private cnpj: string;
    private scraping: string;

    constructor(scraping: 'failed' | 'passed' | 'blank', numeroAtendimento: string, situacao: string, codigoFornecedor: string, cnpj: string, fornecedor: string, data: string, prazo: string, resposta: string) {
        this.fornecedor = fornecedor;
        this.data = data;
        this.prazo = prazo;
        this.resposta = resposta;
        this.numeroAtendimento = numeroAtendimento;
        this.situacao = situacao;
        this.codigoFornecedor = codigoFornecedor;
        this.cnpj = cnpj;
        this.scraping = scraping;
    }

    public retornaEstrutura(tipo: number): EstruturaCarta {
        switch (tipo) {
            default:
                const estrutura: EstruturaCarta = {
                    NumeroAtendimento: this.numeroAtendimento,
                    CodigoFornecedor: this.codigoFornecedor,
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
    private colunaSelecionada?: string;
    private baseModificada: any[] = [];

    constructor(caminho: string) {
        this.caminho = caminho;
        this.obterDadosGerais = extrairBaseCompleta.bind({ caminho: this.caminho });
        this.obterDadosGeraisPorOrdenamentoCronologicoNumeroAtendimento = extrairDadosBasePorOrdenamentoCronologicoNumeroAtendimento.bind({ base: this.obterDadosGerais() })
        this.obterDadosColuna = extrairColunaBase.bind({ base: this.obterDadosGerais() });
        this.obterDadosDivergentes = extrairDivergenciasColunaBaseComparativa.bind({ basePrimaria: this });
        this.carregarAlteracoes = atualizarBase.bind({ base: this.obterDadosGerais() });
        this.criarFiltroColunaBase = extrairDadosBasePorValorColuna.bind({ base: this.obterDadosGerais() });
        this.executarBackup = realizarBackupBase.bind({ dadosBackup: this.obterDadosGerais() });
    }

    //Extração
    public obterDadosGerais: () => any[];
    public obterDadosGeraisPorOrdenamentoCronologicoNumeroAtendimento: ({ }: { dataInicial: string, dataFinal: string }) => any[];
    public obterDadosColuna: (coluna: string) => any[];
    public obterDadosDivergentes: ({ }: { colunaHomologa: string, baseComparativa: BaseDados, tipoNumeroAtendimento?: TipoNumeroAtendimento, dataInicial?: string, dataFinal?: string }) => any[];
    public criarFiltroColunaBase: ({ }: { colunaFiltro: string, valorFiltro: string, colunaRetorno?: string, tipoNumeroAtendimento?: TipoNumeroAtendimento }) => any[];
    public executarBackup: ({ }: { nomeArquivo: string, nomeAba: string, outputPath: string }) => void;

    //Transformação
    public selecionar(coluna: string): this {
        this.baseModificada = this.obterDadosColuna(coluna);
        this.colunaSelecionada = coluna;
        return this;
    }

    public tipoNumeroAtendimento(tipo?: 'Reclamacao' | 'Consulta' | 'Denuncia'): this {
        const relacaoTipoNumerico = {
            'Consulta': '1',
            'Denuncia': '2',
            'Reclamacao': '3'
        };

        if (tipo !== undefined) {
            try {

                this.baseModificada = this.baseModificada.filter(elemento => elemento.slice(21, 22) === relacaoTipoNumerico[tipo]);
                this.baseModificada = this.baseModificada.map(elemento => elemento.slice(0, 22));

            } catch (error) {

                console.log(`Coluna '${this.colunaSelecionada}' não existe na base de dados ou não possui Números de Atendimento válidos`);

            }
        }
        return this;
    }

    public obterRegistrosPorOrdenamentoCronologicoNumeroAtendimento({ dataInicial, dataFinal, colunaHomologa }: { dataInicial?: string, dataFinal?: string, colunaHomologa?: string }) {

        if (dataInicial !== undefined && dataFinal !== undefined) {

            const ordensCronologicas = new Calendario().ordensCronologicasNumeroAtendimentoEntreDatas({
                dataInicial: dataInicial,
                dataFinal: dataFinal
            });

            if (this.colunaSelecionada === 'NumeroAtendimento') {

                this.baseModificada = this.baseModificada.filter((elemento) => {
                    for (const ordemCronologica of ordensCronologicas) {
                        if (elemento.slice(0, 5) === ordemCronologica) {
                            return elemento;
                        }
                    }
                });

            } else {
                const dadosGerais = this.obterDadosGeraisPorOrdenamentoCronologicoNumeroAtendimento({
                    dataInicial: dataInicial,
                    dataFinal: dataFinal
                });

                this.baseModificada = dadosGerais.filter(estrutura => estrutura[this.colunaSelecionada ?? '']);
            }
        }

        return this;
    }

    public obterRegistrosUltimosMeses({ quantidadeMeses }: { quantidadeMeses: number }): this {

        const dataBusca = new Calendario().data().subtrairMeses(quantidadeMeses);
        const [dia, mes, ano] = dataBusca.split('/');
        const anoBusca = ano.slice(2, 4);
        const mesBusca = mes;

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
    public carregarAlteracoes: ({ novosDados, nomeArquivo, nomeAba, inputPath }: { novosDados: any, nomeArquivo: string, nomeAba: string, inputPath: string }) => void;

}

export class Calendario {

    public dataAtual: any = new Date().toLocaleDateString();

    public data(): this {
        this.dataAtual = new Date();
        return this;
    }

    public prefixoArquivoDataAtual() {
        const [dia, mes, ano] = this.dataAtual.split('/');
        const prefixo = `${ano}-${mes}-${dia}_`;
        return prefixo;
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

    public ordensCronologicasNumeroAtendimentoEntreDatas({ dataInicial, dataFinal }: { dataInicial: string, dataFinal: string }): string[] {

        const formatacaoMesAnoDoisDigitos: Intl.DateTimeFormatOptions = {
            month: '2-digit',
            year: '2-digit'
        };

        const regexEspacadoresData = new RegExp('[-_ \/]');

        const [diaInicial, mesInicial, anoInicial] = dataInicial.split(regexEspacadoresData);
        const [diaFinal, mesFinal, anoFinal] = dataFinal.split(regexEspacadoresData);

        const instanciaDataInicial = new Date(
            Number(anoInicial),
            (Number(mesInicial) - 1),
            Number(diaInicial)
        );

        const instanciaDataFinal = new Date(
            Number(anoFinal),
            (Number(mesFinal) - 1),
            Number(diaFinal)
        );

        instanciaDataInicial.setDate(1);
        instanciaDataFinal.setDate(1);

        const diferencaMeses = (Number(instanciaDataFinal) - Number(instanciaDataInicial)) / (1000 * 60 * 60 * 24 * 30);

        const ordensCronologicas = [];

        for (let incrementaMes = 0; incrementaMes <= Math.floor(diferencaMeses); incrementaMes++) {
            const data = new Date(
                instanciaDataInicial.getFullYear(),
                instanciaDataInicial.getMonth() + incrementaMes,
                1
            );
            const [mes, ano] = data.toLocaleDateString('pt-br', formatacaoMesAnoDoisDigitos).split('/');
            const ordemNumeroAtendimento: string = ano.concat(`.${mes}`);
            ordensCronologicas.push(ordemNumeroAtendimento);
        };

        return ordensCronologicas;
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

export class ConsumidorPessoaFisica {
    private numeroAtendimento: string;
    private cpf: string;
    private nome: string;
    private nascimento: string;
    private sexo: string;
    private racaCorEtnia: string;
    private nomeSocial: string;
    private cep: string;
    private latitude: string;
    private longitude: string;
    private logradouro: string;
    private complementoNumero: string;
    private bairro: string;
    private cidade: string;
    private uf: string;
    private telefone: string;
    private scraping: string;


    constructor(scraping: 'failed' | 'passed' | 'blank', numeroAtendimento: string, cpf: string, nome: string, nascimento: string, sexo: string, racaCorEtnia: string, nomeSocial: string, cep: string, logradouro: string, complementoNumero: string, bairro: string, cidade: string, uf: string, telefone: string, latitude: string, longitude: string) {
        this.cpf = cpf;
        this.nome = nome;
        this.nascimento = nascimento;
        this.sexo = sexo;
        this.racaCorEtnia = racaCorEtnia;
        this.nomeSocial = nomeSocial;
        this.cep = cep;
        this.latitude = latitude;
        this.longitude = longitude;
        this.logradouro = logradouro;
        this.complementoNumero = complementoNumero;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.telefone = telefone;
        this.scraping = scraping;
        this.numeroAtendimento = numeroAtendimento;
    };

    public retornaEstrutura(tipo: number): EstruturaConsumidor {
        switch (tipo) {
            case 1:
                this.bairro = this.bairro === '' ? this.cidade : this.bairro;
                const estruturaNumeroAtendimentoBairro: EstruturaConsumidor = {
                    NumeroAtendimento: this.numeroAtendimento,
                    Bairro: this.bairro
                };
                return estruturaNumeroAtendimentoBairro;

            default:
                const estrutura: EstruturaConsumidor = {
                    NumeroAtendimento: this.numeroAtendimento,
                    Nome: this.nome,
                    NomeSocial: this.nomeSocial,
                    CPF: this.cpf,
                    Nascimento: this.nascimento,
                    RacaCorEtnia: this.racaCorEtnia,
                    Sexo: this.sexo,
                    CEP: this.cep,
                    Latitude: this.latitude,
                    Longitude: this.longitude,
                    UF: this.uf,
                    Cidade: this.cidade,
                    Bairro: this.bairro,
                    Logradouro: this.logradouro,
                    ComplementoNumero: this.complementoNumero,
                    Telefone: this.telefone,
                    Scraping: this.scraping
                };
                return estrutura;
        }
    }
}

export class ConsumidorPessoaJuridica {
    private numeroAtendimento: string;
    private cnpj: string;
    private razaoSocial: string;
    private cep: string;
    private logradouro: string;
    private complementoNumero: string;
    private bairro: string;
    private cidade: string;
    private uf: string;
    private telefone: string;
    private latitude: string;
    private longitude: string;
    private scraping: string;

    constructor(scraping: 'failed' | 'passed' | 'blank', numeroAtendimento: string, cnpj: string, razaoSocial: string, cep: string, logradouro: string, complementoNumero: string, bairro: string, cidade: string, uf: string, telefone: string, latitude: string, longitude: string) {
        this.numeroAtendimento = numeroAtendimento;
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
        this.cep = cep;
        this.logradouro = logradouro;
        this.complementoNumero = complementoNumero;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.telefone = telefone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.scraping = scraping;
    };

    public retornaEstrutura(tipo: number): EstruturaConsumidor {
        switch (tipo) {
            case 1:
                this.bairro = this.bairro === '' ? this.cidade : this.bairro;
                const estruturaNumeroAtendimentoBairro: EstruturaConsumidor = {
                    NumeroAtendimento: this.numeroAtendimento,
                    Bairro: this.bairro
                };
                return estruturaNumeroAtendimentoBairro;

            default:
                const estrutura: EstruturaConsumidor = {
                    NumeroAtendimento: this.numeroAtendimento,
                    CNPJ: this.cnpj,
                    RazaoSocial: this.razaoSocial,
                    CEP: this.cep,
                    Latitude: this.latitude,
                    Longitude: this.longitude,
                    UF: this.uf,
                    Cidade: this.cidade,
                    Bairro: this.bairro,
                    Logradouro: this.logradouro,
                    ComplementoNumero: this.complementoNumero,
                    Telefone: this.telefone,
                    Scraping: this.scraping
                };
                return estrutura;
        }
    }




}