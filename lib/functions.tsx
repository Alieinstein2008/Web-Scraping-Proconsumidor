import xlsx from 'xlsx';
import { BaseDados } from './definitions';

export function extrairBaseCompleta(this: { caminho: string }): any[] {
    const workbook = xlsx.readFile(this.caminho);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const baseCompleta = xlsx.utils.sheet_to_json(worksheet);
    return baseCompleta;
};

export function extrairColunaBase(this: { base: any[] }, coluna: string): any[] {
    const baseFiltrada = this.base.map((colunas) => {
        return colunas[coluna];
    });
    return baseFiltrada;
};

export function atualizarBase(this: { base: any[] }, novosDados: any[], nomeArquivo: string, nomeAba: string): void {
    this.base.push(novosDados);
    const worksheet = xlsx.utils.json_to_sheet(this.base);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${nomeAba}`);
    xlsx.writeFile(workbook, `${nomeArquivo}`);
}

export function extrairDivergenciasColunaBaseComparativa(this: { basePrimaria: BaseDados }, { baseComparativa, colunaHomologa }: { baseComparativa: BaseDados, colunaHomologa: string }): any[] {

    const dadosBasePrimaria: string[] = this.basePrimaria.selecionar(colunaHomologa).tipoNumeroAtendimento('Reclamacao').removerDuplicatas();
    const dadosBaseComparativa: string[] = baseComparativa.selecionar(colunaHomologa).tipoNumeroAtendimento('Reclamacao').removerDuplicatas();

    for (const elementoBasePrimaria of dadosBasePrimaria) {
        const indiceConvergencia: number = dadosBaseComparativa.findIndex(elementoBaseComparativa => elementoBaseComparativa == elementoBasePrimaria);
        if (indiceConvergencia !== -1) {
            const elementoConvergenteRemovido = dadosBaseComparativa.splice(indiceConvergencia, 1);
        }
    };
    const elementosDivergentes: string[] = dadosBaseComparativa;

    return elementosDivergentes;
}