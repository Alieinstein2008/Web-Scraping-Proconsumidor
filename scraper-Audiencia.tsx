import playwright from 'playwright';
import {customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout} from "./config/customDefinitions.config";
import { NumeroAtendimento } from "./lib/definitions";
import { createLogger } from './config/loggers.config';
import { carregarAlteracoesBaseAudiencia, executarBackupBaseAudiencia, NA,  salvarAlteracoesBaseAudiencia } from './utils/databaseAudiencia.quickAcessFunctions';

const logger = createLogger({
  filenameCombine: 'audiencia/audiencia-combine',
  filenamePassed: 'audiencia/audiencia-passed',
  filenameFailed: 'audiencia/audiencia-failed',
  filenameBlank: 'audiencia/audiencia-blank',
});

const textoBusca = 'Audiência';
const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
const regexDataAudiencia = new RegExp(` Dia \\d{2} de [A-Za-z]+ de \\d{4}`, 'i');
const regexDataAbertura = new RegExp('\\d{2}\\/\\d{2}\\/\\d{4}', 'i');

export type TuplaInformacoesParciaisAudienciaFinalizada = [string, string, string, string];
export type TuplaInformacoesParciaisAudienciaCancelada = [string, string, string];
export type TuplaInformacoesNulasAudiencia = [string, string, string, string, string, string, string, string, string, string];
export type TuplaInformacoesFailedAudiencia = [string, string, string, string, string, string, string, string, string, string, string];
type EstruturaAudiencia = {
    NumeroAtendimento?: string;
    CodigoFornecedor?: string;
    DataAbertura?: string;
    Fornecedor?: string;
    Cnpj?: string;
    DataAudiencia?: string;
    Situacao?: string;
    Redesignacao?:string;
    Resultado?: string;
    ComparecimentoConsumidor?: string;
    ComparecimentoFornecedor?: string;
    RetornoFornecedor?: string;
    Scraping?: string;
}
export class tratativaAudiencia {
    private numeroAtendimento: string;
    private codigoFornecedor: string;
    private dataAbertura: string;
    private fornecedor:string;
    private cnpj:string;
    private dataAudiencia:string;
    private situacaoAudiencia: string;
    private redesignacao: string;
    private resultadoAudiencia: string;
    private comparecimentoConsumidor: string;
    private comparecimentoFornecedor: string;
    private retornoFornecedor: string;
    private scraping: string;

    constructor(scraping: 'failed' | 'passed' | 'blank', numeroAtendimento: string, codigoFornecedor: string, dataAbertura: string, fornecedor: string, cnpj:string, dataAudiencia: string, situacaoAudiencia: string, redesignacao: string, resultadoAudiencia: string, comparecimentoConsumidor: string, comparecimentoFornecedor: string, retornoFornecedor: string) {    
        this.numeroAtendimento = numeroAtendimento;
        this.codigoFornecedor = codigoFornecedor;
        this.dataAbertura = dataAbertura;
        this.fornecedor = fornecedor;
        this.cnpj = cnpj;
        this.dataAudiencia = dataAudiencia;
        this.situacaoAudiencia = situacaoAudiencia;
        this.redesignacao = redesignacao;
        this.resultadoAudiencia = resultadoAudiencia;
        this.comparecimentoConsumidor = comparecimentoConsumidor;
        this.comparecimentoFornecedor = comparecimentoFornecedor;
        this.retornoFornecedor = retornoFornecedor;
        this.scraping = scraping;

    }
    public retornaEstrutura(tipo: number): EstruturaAudiencia {
            switch (tipo) {
                case 1:
                     const estrutura1: EstruturaAudiencia = {
                        NumeroAtendimento: this.numeroAtendimento,
                        CodigoFornecedor: this.codigoFornecedor,
                        DataAbertura: this.dataAbertura,
                        Fornecedor: this.fornecedor,
                        Cnpj: this.cnpj,
                        DataAudiencia: this.dataAudiencia,
                        Situacao: this.situacaoAudiencia,
                        Redesignacao: this.redesignacao,
                        Resultado: this.resultadoAudiencia,
                        ComparecimentoConsumidor: this.comparecimentoConsumidor,
                        ComparecimentoFornecedor: this.comparecimentoFornecedor,
                        RetornoFornecedor: this.retornoFornecedor,
                        Scraping: this.scraping
                        
                    }
                    return estrutura1;
                default:
                    const estrutura: EstruturaAudiencia = {
                        NumeroAtendimento: this.numeroAtendimento,
                        CodigoFornecedor: this.codigoFornecedor,
                        DataAbertura: this.dataAbertura,
                        Fornecedor: this.fornecedor,
                        Cnpj: this.cnpj,
                        DataAudiencia: this.dataAudiencia,
                        Situacao: this.situacaoAudiencia,
                        Redesignacao: this.redesignacao,
                        Resultado: this.resultadoAudiencia,
                        ComparecimentoConsumidor: this.comparecimentoConsumidor,
                        ComparecimentoFornecedor: this.comparecimentoFornecedor,
                        RetornoFornecedor: this.retornoFornecedor,
                        Scraping: this.scraping
                    }
                    return estrutura;
            }
    }

}

 (async () => {
    
       console.time('Tempo-de-Execução-Total');

            const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
            const context = await customContext(browser);
            let page = await context.newPage();
        
            const textoBusca = 'Audiência';
            const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
            const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
            const regexDataAudiencia = new RegExp(` Dia \\d{2} de [A-Za-z]+ de \\d{4}`, 'i');
            const regexDataAbertura = new RegExp('\\d{2}\\/\\d{2}\\/\\d{4}', 'i');

            executarBackupBaseAudiencia();
              
              process.on('SIGINT', () => salvarAlteracoesBaseAudiencia('SIGINT', allTested));
              process.on('SIGTERM', () => salvarAlteracoesBaseAudiencia('SIGTERM', allTested));
            
            await page.goto("https://proconsumidor.mj.gov.br/#/inicio", { waitUntil: "networkidle", timeout: customTimeout.general });
            let allTested: any[] = [];

            const numeroAtendimento = new NumeroAtendimento('');
            try{
                
                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').first().click({ timeout: 30000 });
                await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`, { timeout: 90000 });
                await page.waitForSelector('.loader-container', { state: 'hidden' });
                const nx= await page.locator('span').filter({ hasText: '-3' }).allInnerTexts();


                
               
            }
            catch{}
        
})();


