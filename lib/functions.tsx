import xlsx from 'xlsx';
import { BaseDados } from './definitions';

export function extrairBaseCompleta(this: BaseDados): any[] {
    const workbook = xlsx.readFile(this.caminho);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const dadosBase = xlsx.utils.sheet_to_json(worksheet);
    return dadosBase;
};

export function extrairColunaBase(this: { base: any[] }, coluna: string): any[] {
    const baseFiltrada = this.base.map((colunas) => {
        return colunas[coluna];
    });
    return baseFiltrada;
};

export function atualizarBase(this: { base: any[] }, novosDados: any[], nomeArquivo: string, nomeAba: string) {
    this.base.push(novosDados);
    const worksheet = xlsx.utils.json_to_sheet(this.base);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${nomeAba}`);
    xlsx.writeFile(workbook, `${nomeArquivo}`);
}
