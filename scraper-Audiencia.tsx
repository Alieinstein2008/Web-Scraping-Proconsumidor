import playwright from 'playwright';
import {customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout} from "./config/customDefinitions.config";
import { NumeroAtendimento } from "./lib/definitions";

type EstruturaAudiencia = {
    Fornecedor?: string;
    Cnpj?: string;
    Data?: string;
    Situacao?: string;
    NumeroAtendimento?: string;
    Redesignacao?:string;
    Resultado?: string;
    Scraping?: string;
}
class tratativaAudiencia {
    private fornecedor:string;
    private cnpj:string;
    private data:string;
    private situacao: string;
    private numeroAtendimento: string;
    private redesignacao: string;
    private resultado: string;
    private scraping: string;

    constructor(scraping: 'failed' | 'passed' | 'blank', resultado: string, numeroAtendimento: string, situacao: string, data: string, fornecedor: string, redesignacao: string, cnpj:string){
       this.fornecedor = fornecedor;
       this.cnpj = cnpj;
       this.data = data;
       this.situacao = situacao;
       this.numeroAtendimento = numeroAtendimento;
       this.redesignacao = redesignacao;
       this.resultado = resultado;
       this.scraping = scraping;
    }
    public retornaEstrutura(tipo: number): EstruturaAudiencia {
            switch (tipo) {
                default:
                    const estrutura: EstruturaAudiencia = {
                        NumeroAtendimento: this.numeroAtendimento,
                        Fornecedor: this.fornecedor,
                        Cnpj: this.cnpj,
                        Data: this.data,
                        Resultado: this.resultado,
                        Redesignacao: this.redesignacao,
                        Situacao: this.situacao,
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
    
            const numeroAtendimento = new NumeroAtendimento('22.12.0532.001.00701-3');
            try{
                
                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').first().click({ timeout: 30000 });
                await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`, { timeout: 90000 });
                await page.waitForSelector('.loader-container', { state: 'hidden' });
                const nx= await page.locator('span').filter({ hasText: '-3' }).allInnerTexts();

                
               
            }
            catch{}
        
})();


