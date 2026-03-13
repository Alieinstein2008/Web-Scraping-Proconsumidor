import xlsx from 'xlsx';
import { BaseDados, Calendario, TipoNumeroAtendimento } from './definitions';

export function atualizarBase(this: { base: any[] }, { novosDados, nomeArquivo, nomeAba, inputPath }: { novosDados: any[], nomeArquivo: string, nomeAba: string, inputPath: string }): void {
    const novaEstrutura = novosDados.pop();
    this.base.push(novaEstrutura);
    const worksheet = xlsx.utils.json_to_sheet(this.base);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${nomeAba}`);
    xlsx.writeFile(workbook, `${inputPath}/${nomeArquivo}.xlsx`);
    
};

export function extrairBaseCompleta(this: { caminho: string }): any[] {
    const workbook = xlsx.readFile(this.caminho);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const baseCompleta = xlsx.utils.sheet_to_json(worksheet);
    return baseCompleta;
};

export function extrairDadosBasePorOrdenamentoCronologicoNumeroAtendimento(this: { base: any[] }, { dataInicial, dataFinal }: { dataInicial: string, dataFinal: string }): string[] {

    const ordensCronologicas = new Calendario().ordensCronologicasNumeroAtendimentoEntreDatas({
        dataInicial: dataInicial,
        dataFinal: dataFinal
    });

    const dadosGeraisFiltrados = this.base.filter((colunas) => {
        for (const ordemCronologica of ordensCronologicas) {
            const anoMesNumeroAtendimento = colunas['NumeroAtendimento'].slice(0, 5);
            if (anoMesNumeroAtendimento === ordemCronologica) {
                return colunas;
            }
        }
    });

    return dadosGeraisFiltrados;
};

export function extrairColunaBase(this: { base: any[] }, coluna: string): any[] {
    const baseFiltrada = this.base.map((colunas) => {
        return colunas[coluna];
    });
    return baseFiltrada;
};

export function extrairDadosBasePorValorColuna(this: { base: any[] }, { colunaFiltro, valorFiltro, colunaRetorno, tipoNumeroAtendimento }: { colunaFiltro: string; valorFiltro: string; colunaRetorno?: string, tipoNumeroAtendimento?: TipoNumeroAtendimento }): any[] {

    const relacaoTipoNumerico = {
        'Consulta': '1',
        'Denuncia': '2',
        'Reclamacao': '3'
    };

    const dadosGeraisFiltrados = this.base.filter(colunas => colunas[colunaFiltro] == valorFiltro);

    if (colunaRetorno !== undefined) {
        let dadosMapeadosRetorno = dadosGeraisFiltrados.map(colunas => colunas[colunaRetorno]);
        if (tipoNumeroAtendimento != undefined && colunaRetorno == 'NumeroAtendimento') {
            dadosMapeadosRetorno = dadosMapeadosRetorno.filter(NumeroAtendimento => NumeroAtendimento.slice(21, 22) == relacaoTipoNumerico[tipoNumeroAtendimento]);
        }
        return dadosMapeadosRetorno;
    };
    return dadosGeraisFiltrados;
};

export function extrairDivergenciasColunaBaseComparativa(this: { basePrimaria: BaseDados }, { baseComparativa, colunaHomologa, tipoNumeroAtendimento, dataInicial, dataFinal }: { baseComparativa: BaseDados, colunaHomologa: string, tipoNumeroAtendimento?: TipoNumeroAtendimento, dataInicial?: string, dataFinal?: string }): any[] {

    const dadosBasePrimaria: string[] = this.basePrimaria
        .selecionar(colunaHomologa)
        .tipoNumeroAtendimento(tipoNumeroAtendimento)
        .obterRegistrosPorOrdenamentoCronologicoNumeroAtendimento({ dataInicial: dataInicial, dataFinal: dataFinal })
        .removerDuplicatas();

    const dadosBaseComparativa: string[] = baseComparativa
        .selecionar(colunaHomologa)
        .tipoNumeroAtendimento(tipoNumeroAtendimento)
        .obterRegistrosPorOrdenamentoCronologicoNumeroAtendimento({ dataInicial: dataInicial, dataFinal: dataFinal })
        .removerDuplicatas();

    for (const elementoBasePrimaria of dadosBasePrimaria) {
        const indiceConvergencia: number = dadosBaseComparativa.findIndex(elementoBaseComparativa => elementoBaseComparativa == elementoBasePrimaria);
        if (indiceConvergencia !== -1) {
            const elementoConvergenteRemovido = dadosBaseComparativa.splice(indiceConvergencia, 1);
        };
    };
    const elementosDivergentes: string[] = dadosBaseComparativa;
    return elementosDivergentes;
};

export function criarNovaBaseDados({ dadosJson, nomeArquivo, nomeAba, outputPath }: { dadosJson: any[], nomeArquivo: string; nomeAba: string; outputPath: string }): void {
    const worksheet = xlsx.utils.json_to_sheet(dadosJson);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${nomeAba}`);
    xlsx.writeFile(workbook, `${outputPath}/${nomeArquivo}.xlsx`);
};

export function realizarBackupBase(this: { dadosBackup: any[] }, { nomeArquivo, nomeAba, outputPath }: { nomeArquivo: string, nomeAba: string, outputPath: string }): void {
    criarNovaBaseDados({
        dadosJson: this.dadosBackup,
        nomeArquivo: nomeArquivo,
        nomeAba: nomeAba,
        outputPath: outputPath
    });
};